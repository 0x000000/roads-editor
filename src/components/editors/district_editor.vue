import {BlockType} from '@/models/block';
import {BlockType} from '@/models/block';
<template>
  <div class="district-editor">
    <h3>Edit district</h3>

    <div class="tool-row">
      <div class="district-view">
        <svg width="250" height="250">
          <polygon :points="svgPointsZeroDiff"
                   :class="district.classes">
          </polygon>

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

        <label v-if="rci">
          Density
          <select v-model="selectedBlock.density">
            <option :value="Density.Rural">1 - Rural</option>
            <option :value="Density.Suburban">2 - Suburban</option>
            <option :value="Density.Urban">3 - Urban</option>
            <option :value="Density.UrbanCenter">4 - Urban Center</option>
            <option :value="Density.UrbanCore">5 - Urban Core</option>
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
            <option :value="NatureType.None">None</option>
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
        <svg width="400" height="400">
          <polygon class="block"
                   v-if="selectedBlock"
                   :class="selectedBlock.classes"
                   :points="svgBlockPointsMaxZoom(selectedBlock)">
          </polygon>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import District, {DistrictShape} from '@/models/district';
  import store from '@/store/store';
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

  const ZOOM_1 = 2;
  const ZOOM_2 = 18;
  const OFFSET = 10;

  @Component({
    components: {Button},
  })
  export default class DistrictEditor extends Vue {
    @Prop() private district!: District;
    private prevDistrictId: number | undefined = undefined;
    private selectedBlock: Block | undefined;

    @Watch('district', {deep: true})
    private onDistrictChanged() {
      if (this.district.id !== this.prevDistrictId && this.prevDistrictId !== undefined) {
        this.selectedBlock = undefined;
      }

      this.prevDistrictId = this.district.id;
      store.commit(MutationName.SaveState);
    }

    private data() {
      return {
        BlockType,
        Wealth,
        Density,
        DistrictShape,
        NatureType,
        BlockLevel,
        ROAD_WIDTH: ROAD_WIDTH * 2,
        selectedBlock: undefined,
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
      }

      this.selectedBlock = nextBlock;
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
        const x = (point.x - orderedPoints[0].x + diffX) * POINT_DISTANCE * ZOOM_2 + OFFSET;
        const y = (point.y - orderedPoints[0].y + diffY) * POINT_DISTANCE * ZOOM_2 + OFFSET;

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
    stroke-width: 5px;

    &:hover, &.selected {
      stroke: #FD783F;
      cursor: pointer;
    }
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
