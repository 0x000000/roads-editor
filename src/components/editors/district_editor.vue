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
            <option :value="DistrictShape.Ussr">USSR</option>
          </select>
        </label>

        <label>
          Generator Type
          <select v-model="generatorType">
            <option :value="GeneratorType.Random">Random</option>
            <option :value="GeneratorType.Rural">Rural</option>
          </select>
        </label>


        <label>
          District Wealth
          <select v-model="districtWealth">
            <option :value="DistrictWealth.Poor">Poor</option>
            <option :value="DistrictWealth.PoorLow">Poor - Low</option>
            <option :value="DistrictWealth.PoorMid">Poor - Mid</option>
            <option :value="DistrictWealth.PoorHigh">Poor - High</option>
            <option :value="DistrictWealth.Low">Low</option>
            <option :value="DistrictWealth.LowMid">Low - Mid</option>
            <option :value="DistrictWealth.LowHigh">Low - High</option>
            <option :value="DistrictWealth.MidHigh">Mid - High</option>
            <option :value="DistrictWealth.Mid">Mid</option>
            <option :value="DistrictWealth.High">High</option>
          </select>
        </label>

        <label>
          Target Population
          <select v-model="districtPopulation">
            <option :value="TargetPopulation.VeryLow">Very Low</option>
            <option :value="TargetPopulation.Low">Low</option>
            <option :value="TargetPopulation.Medium">Medium</option>
            <option :value="TargetPopulation.High">High</option>
            <option :value="TargetPopulation.VeryHigh">Very High</option>
          </select>
        </label>

        <label>
          Level
          <select v-model="district.level">
            <option :value="DistrictLevel.One">1 Level</option>
            <option :value="DistrictLevel.Two">2 Level</option>
            <option :value="DistrictLevel.Three">3 Level</option>
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
            <option :value="BlockType.Agricultural">Agricultural</option>
            <option :value="BlockType.Forest">Forest</option>
            <option :value="BlockType.Park">Park</option>
            <option :value="BlockType.Water">Water</option>
          </select>
        </label>

        <label>
          Layout Name
          <select v-model="layoutName">
            <option v-for="name in layoutNames" :value="name">{{name}}</option>
          </select>
        </label>

        <label>
          Density
          <select v-model="selectedBlock.density">
            <option :value="Density.Lowest">1 - Rural</option>
            <option :value="Density.Low">2 - Suburban</option>
            <option :value="Density.Medium">3 - Urban</option>
            <option :value="Density.High">4 - Urban Center</option>
            <option :value="Density.Highest">5 - Urban Core</option>
          </select>
        </label>

        <label>
          Wealth
          <select v-model="selectedBlock.wealth">
            <option :value="Wealth.Poor">1 - Poor</option>
            <option :value="Wealth.Low">2 - Working class</option>
            <option :value="Wealth.Mid">3 - Middle class</option>
            <option :value="Wealth.High">4 - Upper class</option>
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

          <rect v-for="slot in selectedSlots"
                :transform="transform(slot)"
                class="building-slot"
                :width="28"
                :height="28"
                :x="slot.topLeftPosition.x"
                :y="slot.topLeftPosition.y">
          </rect>

          <rect v-for="building in selectedBuildings"
                :key="building.id"
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
  import District, {DistrictLevel} from '@/models/district';
  import store, {RootState} from '@/store/store';
  import {MutationName} from '@/mutations/mutations';
  import {POINT_DISTANCE, ROAD_WIDTH} from '@/config';
  import {orderPointsByRoads, Path} from '@/models/geometry';
  import Block, {BlockShape, BlockType, Density, LAYOUTS, Wealth} from '@/models/block';
  import Button from '@/components/button.vue';
  import hotkeys from 'hotkeys-js';
  import {
    DistrictShape,
    DistrictWealth,
    generateBlocks,
    GeneratorType,
    TargetPopulation
  } from '@/models/block_generator';
  import {Building, Slot} from '@/models/building';
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
    private generatorType: GeneratorType = GeneratorType.Rural;
    private districtWealth: DistrictWealth = DistrictWealth.LowMid;
    private districtPopulation: TargetPopulation = TargetPopulation.VeryLow;
    private layoutName: string | undefined;

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
    private onLayoutChange(choosenName: string) {
      if (this.selectedBlock) {
        this.selectedBlock.layout = LAYOUTS.find(l => l.name === choosenName);
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
        DistrictLevel,
        GeneratorType,
        DistrictWealth,
        TargetPopulation,
        ROAD_WIDTH: ROAD_WIDTH * 2,
        selectedBlock: undefined,
        generatorType: GeneratorType.Rural,
        districtWealth: DistrictWealth.LowMid,
        districtPopulation: TargetPopulation.VeryLow,
        layoutName: undefined,
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
        case 'shift+a':
          this.selectedBlock.type = BlockType.Agricultural;
          break;
        case 'shift+f':
          this.selectedBlock.type = BlockType.Forest;
          break;
        case 'shift+p':
          this.selectedBlock.type = BlockType.Park;
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

      generateBuildingsForBlock(this.district, this.selectedBlock);
    }

    private generateLayoutAllBlocks() {
      this.selectedBlock = undefined;

      generateBlocks({
        type: this.generatorType,
        shape: this.district.shape,
        wealth: this.districtWealth,
        population: this.districtPopulation,
      }, this.district.blocks.length).forEach((newBlock, index) => {
        const block = this.district.blocks[index];

        block.type = newBlock.type;
        block.wealth = newBlock.wealth;
        block.density = newBlock.density;
        block.layout = LAYOUTS[0]; //todo:1111111111111
        block.buildings = generateBuildingsForBlock(this.district, block);

        Vue.set(this.district.blocks, index, block);
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

    get layoutNames(): string[] {
      if (this.selectedBlock === undefined) {
        return [];
      }

      const selectedBlockShape = this.selectedBlock.shape;
      return LAYOUTS.filter(l => {
        return l.block.shape === selectedBlockShape;
      }).map(l => l.name);
    }

    get selectedSlots(): Slot[] {
      if (this.selectedBlock && this.selectedBlock.layout) {
        return this.selectedBlock.layout.sectors.map(s => s.slots).flat();
      }

      return [];
    }

    get selectedBuildings(): Building[] {
      if (this.selectedBlock) {
        return this.selectedBlock.buildings;
      }

      return [];
    }

    private transform(slot: Slot): string {
      return `rotate(${slot.rotation}, ${slot.absolutePosition.x}, ${slot.absolutePosition.y})`;
    }

    private transformBuilding(building: Building): string {
      const x = building.center.x + (building.variant.width / 2) + building.centerDiff.x;
      const y = building.center.y + (building.variant.height / 2) + building.centerDiff.y;

      return `rotate(${building.rotationAngle}, ${x}, ${y})`;
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
