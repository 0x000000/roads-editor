<template>
  <div class="district-editor">
    <h3>Edit district</h3>

    <svg width="250" height="250">
      <polygon class="zoomed"
               :points="svgPointsZeroDiff"
               :class="district.classes">
      </polygon>

      <template v-for="block in district.blocks">
        <path v-for="path in block.paths"
              class="block-border"
              :d="dWithZeroDiff(path)"
              :stroke-width="ROAD_WIDTH">
        </path>
      </template>
    </svg>

<!--    <label>-->
<!--      Type-->
<!--      <select v-model="district.type">-->
<!--        <option :value="DistrictType.Wasteland">Wasteland</option>-->
<!--        <option :value="DistrictType.Residential">Residential</option>-->
<!--        <option :value="DistrictType.Commercial">Commercial</option>-->
<!--        <option :value="DistrictType.Industrial">Industrial</option>-->
<!--        <option :value="DistrictType.Forest">Forest</option>-->
<!--        <option :value="DistrictType.Water">Water</option>-->
<!--      </select>-->
<!--    </label>-->

<!--    <div v-for="(tier, num) in tiers" class="tier">-->
<!--      <h5>Tier {{num + 1}}</h5>-->

<!--      <label>-->
<!--        Density-->
<!--        <select v-model="district[tier].density">-->
<!--          <option :value="1">1 - Rural</option>-->
<!--          <option :value="2">2 - Suburban</option>-->
<!--          <option :value="3">3 - Urban</option>-->
<!--          <option :value="4">4 - Urban Center</option>-->
<!--          <option :value="5">5 - Urban Core</option>-->
<!--        </select>-->
<!--      </label>-->

<!--      <label>-->
<!--        Wealth-->
<!--        <select v-model="district[tier].wealth">-->
<!--          <option :value="1">1 - Working class</option>-->
<!--          <option :value="2">2 - Middle class</option>-->
<!--          <option :value="3">3 - Upper class</option>-->
<!--        </select>-->
<!--      </label>-->

<!--      <br/>-->

<!--      <label>-->
<!--        Max Population ~{{RecommendedPopulationByDensity[district[tier].density]}}-->
<!--        <input class="population" v-model.number="district[tier].maxPopulation" type="number"/>-->
<!--      </label>-->

<!--      <label>-->
<!--        Max Workspace-->
<!--        <input class="population" v-model.number="district[tier].maxWorkspace" type="number"/>-->
<!--      </label>-->
<!--    </div>-->
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import District, {DistrictType, RecommendedPopulationByDensity} from '@/models/district';
  import store from '@/store/store';
  import {MutationName} from '@/mutations/mutations';
  import {POINT_DISTANCE, ROAD_WIDTH} from '@/config';
  import {Path} from '@/models/geometry';

  const ZOOM = 2;
  const OFFSET = 10;

  @Component
  export default class DistrictEditor extends Vue {
    @Prop() private district!: District;

    @Watch('district', {deep: true})
    private onDistrictChanged() {
      store.commit(MutationName.SaveState);
    }

    private data() {
      return {
        DistrictType,
        RecommendedPopulationByDensity,
        ROAD_WIDTH: ROAD_WIDTH * 2,
      };
    }

    get tiers(): string[] {
      return ['t1', 't2', 't3'];
    }

    private dWithZeroDiff(path: Path): string {
      const fromX: number = (path.start.x - this.minX) * POINT_DISTANCE * ZOOM + OFFSET;
      const fromY: number = (path.start.y - this.minY) * POINT_DISTANCE * ZOOM + OFFSET;
      const toX: number = (path.end.x - this.minX) * POINT_DISTANCE * ZOOM + OFFSET;
      const toY: number = (path.end.y - this.minY) * POINT_DISTANCE * ZOOM + OFFSET;

      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }

    get svgPointsZeroDiff(): string {
      const pointsCoordinates: string[] = [];

      for (const point of this.district.points) {
        const x = (point.x - this.minX) * POINT_DISTANCE * ZOOM + OFFSET;
        const y = (point.y - this.minY) * POINT_DISTANCE * ZOOM + OFFSET;

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
</style>
