<template>
  <div class="district-editor">
    <h3>Edit district</h3>

    <div class="tool-row">
      <div class="district-view">
        <svg width="250" height="250">
          <polygon v-for="block in district.blocks"
                   class="block"
                   :v-key="block.id"
                   :class="block.classes"
                   :points="svgBlockPoints(block)"
                   @click="selectBlock(block)">
          </polygon>
        </svg>
      </div>

      <div class="district-toolbar">
        <label>
          District Shape
          <select v-model="district.shape">
            <option :value="DistrictShape.Linear">Linear</option>
          </select>
        </label>

        <label>
          Generator Type
          <select v-model="generatorType">
            <option :value="GeneratorType.Random">Random</option>
            <option :value="GeneratorType.Rural">Rural</option>
          </select>
        </label>

        <input type="button"
               value="Generate Layout For All"
               @click="generateLayoutAllBlocks"/>
      </div>
    </div>

    <div class="tool-row">
      <div v-if="selectedBlock" class="block-toolbar">
        <h4>Edit Block</h4>

        <label>
          Type
          <select v-model="selectedBlock.type">
            <option :value="BlockType.Wasteland">Wasteland</option>
            <option :value="BlockType.Residential">Residential</option>
            <option :value="BlockType.Commercial">Commercial</option>
            <option :value="BlockType.Industrial">Industrial</option>
            <option :value="BlockType.Nature">Nature</option>
            <option :value="BlockType.Water">Water</option>
          </select>
        </label>

        <label>
          Level
          <select v-model="selectedBlock.level">
            <option :value="BlockLevel.Zero">Disabled</option>
            <option :value="BlockLevel.One">1 Level</option>
            <option :value="BlockLevel.Two">2 Level</option>
            <option :value="BlockLevel.Three">3 Level</option>
          </select>
        </label>

        <label>
          Layout Name
          <select v-model="layoutName">
            <option v-for="name in layoutNames" :value="name">{{name}}</option>
          </select>
        </label>

        <label v-if="rci">
          Density
          <select v-model="selectedBlock.density">
            <option :value="Density.Lowest">1 - Rural</option>
            <option :value="Density.Low">2 - Suburban</option>
            <option :value="Density.Medium">3 - Urban</option>
            <option :value="Density.High">4 - Urban Center</option>
            <option :value="Density.Highest">5 - Urban Core</option>
          </select>
        </label>

        <label v-if="rci">
          Wealth
          <select v-model="selectedBlock.wealth">
            <option :value="Wealth.Poor">1 - Poor</option>
            <option :value="Wealth.Low">2 - Working class</option>
            <option :value="Wealth.Mid">3 - Middle class</option>
            <option :value="Wealth.High">4 - Upper class</option>
          </select>
        </label>

        <label v-if="nature">
          Nature Type
          <select v-model="selectedBlock.natureType">
            <option :value="NatureType.Forest">Forest</option>
            <option :value="NatureType.Park">Park</option>
            <option :value="NatureType.Agricultural">Agricultural</option>
          </select>
        </label>

        <input type="button"
               value="Generate Layout"
               @click="generateLayoutCurrentBlock"/>
      </div>

      <div class="block-view">
        <svg width="410" height="410" v-if="selectedBlock">
          <polygon class="block"
                   :class="selectedBlock.classes"
                   :points="svgBlockPointsMaxZoom(selectedBlock)">
          </polygon>

          <rect v-for="slot in selectedSlots()"
                :transform="transform(slot)"
                class="building-slot"
                :width="28"
                :height="28"
                :x="slot.topLeftPosition.x"
                :y="slot.topLeftPosition.y">
          </rect>

          <rect v-for="building in buildings"
                class="building"
                :transform="transformBuilding(building)"
                :width="building.variant.width"
                :height="building.variant.height"
                :x="building.center.x"
                :y="building.center.y">
          </rect>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import District, {DistrictShape} from '@/models/district';
  import store, {RootState} from '@/store/store';
  import {MutationName} from '@/mutations/mutations';
  import {POINT_DISTANCE, ROAD_WIDTH} from '@/config';
  import {orderPointsByRoads, Path} from '@/models/geometry';
  import Block, {
    BlockLevel,
    BlockShape,
    BlockType,
    Density,
    NatureType,
    Wealth
  } from '@/models/block';
  import Button from '@/components/button.vue';
  import hotkeys from 'hotkeys-js';
  import {generateBlocks, GeneratorType} from '@/models/block_generator';
  import {BuildingSlot, IBlockImport, RuralLayouts} from '@/layouts/rural_residential';
  import {Building, ISector, Slot} from '@/models/building';
  import {generateBuildingsForBlock} from '@/models/building_generator';

  const ZOOM_1 = 2;
  const ZOOM_2 = 20;
  const OFFSET = 10;

  @Component({
    components: {Button},
  })
  export default class DistrictEditor extends Vue {
    @Prop() private district!: District;
    private prevDistrictId: number | undefined = undefined;
    private selectedBlock: Block | undefined;
    private generatorType?: GeneratorType;
    private layoutName: string | undefined;
    private buildings: Building[] = [];

    @Watch('district', {deep: true})
    private onDistrictChanged() {
      if (this.district.id !== this.prevDistrictId && this.prevDistrictId !== undefined) {
        if (this.selectedBlock !== undefined) { this.selectedBlock.selected = false; }
        this.selectedBlock = undefined;
      }

      this.prevDistrictId = this.district.id;
      store.commit(MutationName.SaveState);
    }

    @Watch('layoutName')
    private onLayoutChange(newVal: string) {
      if (this.selectedBlock) {
        this.selectedBlock.layout = RuralLayouts.find(l => l.name === newVal);
      }
    }

    get state(): RootState {
      return this.$store.state as RootState;
    }

    private data() {
      return {
        BlockType,
        Wealth,
        Density,
        DistrictShape,
        NatureType,
        BlockLevel,
        GeneratorType,
        ROAD_WIDTH: ROAD_WIDTH * 2,
        selectedBlock: undefined,
        generatorType: GeneratorType.Rural,
        layoutName: undefined,
        buildings: [],
      };
    }

    private mounted() {
      hotkeys('shift+r, shift+c, shift+i, shift+f, shift+n, shift+w', (_, handler) => {
        this.onKey(handler.key);
      });
    }

    public selectBlock(nextBlock: Block) {
      if (this.selectedBlock) {
        this.selectedBlock.selected = false;
        this.layoutName = undefined;
        this.buildings = [];
      }

      this.selectedBlock = nextBlock;
      if (nextBlock.layout && nextBlock.layout) {
        this.layoutName = nextBlock.layout.name;
      }
      this.selectedBlock.selected = true;
    }

    public onKey(key: string) {
      if (!this.selectedBlock) {
        return;
      }

      switch (key) {
        case 'shift+r':
          this.selectedBlock.type = BlockType.Residential;
          break;
        case 'shift+c':
          this.selectedBlock.type = BlockType.Commercial;
          break;
        case 'shift+i':
          this.selectedBlock.type = BlockType.Industrial;
          break;
        case 'shift+n':
          this.selectedBlock.type = BlockType.Nature;
          break;
        case 'shift+w':
          this.selectedBlock.type = BlockType.Water;
          break;
      }
    }

    private svgBlockPoints(block: Block): string {
      const pointsCoordinates: string[] = [];

      for (const point of orderPointsByRoads(block.paths)) {
        const x = (point.x - this.minX) * POINT_DISTANCE * ZOOM_1 + OFFSET;
        const y = (point.y - this.minY) * POINT_DISTANCE * ZOOM_1 + OFFSET;

        pointsCoordinates.push(`${x},${y}`);
      }

      return pointsCoordinates.join(' ');
    }

    private svgBlockPointsMaxZoom(block: Block): string {
      const pointsCoordinates: string[] = [];

      const orderedPoints = orderPointsByRoads(block.paths);

      let diffX;
      let diffY;
      if (block.shape === BlockShape.TriangleTopRight) {
        diffX = 1;
        diffY = 1;
      } else {
        diffX = 0;
        diffY = 1;
      }

      for (const point of orderedPoints) {
        const x = (point.x - orderedPoints[0].x + diffX) * POINT_DISTANCE * ZOOM_2;
        const y = (point.y - orderedPoints[0].y + diffY) * POINT_DISTANCE * ZOOM_2;

        pointsCoordinates.push(`${x},${y}`);
      }

      return pointsCoordinates.join(' ');
    }

    private dWithZeroDiff(path: Path): string {
      const fromX: number = (path.start.x - this.minX) * POINT_DISTANCE * ZOOM_1 + OFFSET;
      const fromY: number = (path.start.y - this.minY) * POINT_DISTANCE * ZOOM_1 + OFFSET;
      const toX: number = (path.end.x - this.minX) * POINT_DISTANCE * ZOOM_1 + OFFSET;
      const toY: number = (path.end.y - this.minY) * POINT_DISTANCE * ZOOM_1 + OFFSET;

      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    private generateLayoutCurrentBlock() {
      if (this.selectedBlock === undefined || this.selectedBlock.layout === undefined) {
        return;
      }

      this.buildings = generateBuildingsForBlock(this.district, this.selectedBlock);
    }

    private generateLayoutAllBlocks() {
      generateBlocks(this.generatorType as GeneratorType, this.district.blocks.length).forEach((newBlock, index) => {
        const block = this.district.blocks[index];

        //todo: generalize with generateLayoutCurrentBlock
        block.type = newBlock.type;
        block.natureType = newBlock.natureType;
        block.wealth = newBlock.wealth;
        block.density = newBlock.density;
      });
    }

    get svgPointsZeroDiff(): string {
      const pointsCoordinates: string[] = [];

      for (const point of this.district.points) {
        const x = (point.x - this.minX) * POINT_DISTANCE * ZOOM_1 + OFFSET;
        const y = (point.y - this.minY) * POINT_DISTANCE * ZOOM_1 + OFFSET;

        pointsCoordinates.push(`${x},${y}`);
      }

      return pointsCoordinates.join(' ');
    }

    get minX(): number {
      return Math.min(...this.district.points.map(p => p.x));
    }

    get minY(): number {
      return Math.min(...this.district.points.map(p => p.y));
    }

    get rci(): boolean {
      if (this.selectedBlock) {
        return [
          BlockType.Residential,
          BlockType.Commercial,
          BlockType.Industrial,
        ].includes(this.selectedBlock.type);
      } else {
        return false;
      }
    }

    get nature(): boolean {
      return this.selectedBlock !== undefined && this.selectedBlock.type === BlockType.Nature;
    }

    get layoutNames(): string[] {
      if (this.selectedBlock === undefined) {
        return [];
      }

      return RuralLayouts.filter(l => {
        return l !== undefined && l.block.shape === (this.selectedBlock as Block).shape;
      }).map(l => l.name);
    }

    private selectedSlots(): Slot[] {
      if (this.selectedBlock && this.selectedBlock.layout) {
        return this.selectedBlock.layout.sectors.map(s => s.slots).flat();
      }

      return [];
    }

    private transform(slot: Slot): string {
      return `rotate(${slot.rotation}, ${slot.absolutePosition.x}, ${slot.absolutePosition.y})`;
    }

    private transformBuilding(building: Building): string {
      return `rotate(${building.rotationAngle}, ${building.center.x + (building.variant.width / 2)}, ${building.center.y + (building.variant.height / 2)})`;
    }
  }
</script>

<style scoped lang="scss">
  h5 {
    padding: 0;
    margin: 0 0 5px 0;
    font-size: 15px;
  }

  .tier {
    border-left: 2px solid lightgray;
    padding-left: 10px;
    margin-bottom: 10px;

    label {
      display: inline-block;
      margin-right: 15px;
    }
  }

  path.block-border {
    stroke: darkgrey;
  }

  .block {
    stroke: darkgrey;
    stroke-width: 2px;

    &:hover, &.selected {
      stroke: #FD783F;
      cursor: pointer;
    }
  }

  .building-slot {
    stroke: #0c88ee;
    stroke-width: 1px;
    fill: none;
  }

  .tool-row {
    overflow: hidden;
  }

  .district-view, .block-view, .district-toolbar, .block-toolbar {
    float: left;
  }

  .district-view, .block-toolbar {
    min-width: 300px;
  }

</style>
