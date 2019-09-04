<template>
  <div class="map">
    <svg id="canvas"
         :width="mapSize.width"
         :height="mapSize.height"
         :class="mapClasses">

      <template v-for="district in districts">
        <polygon :points="district.svgPoints"
                 :class="district.classes">
        </polygon>

        <polygon v-if="showBlocks"
                 v-for="block in district.blocks"
                 class="block"
                 :points="block.svgPoints"
                 :class="block.classes"
                 @click="selectDistrict(district)">
        </polygon>
      </template>

      <path v-for="road in roads"
            :v-key="road.id"
            :d="road.d"
            :class="road.classes"
            :stroke-width="ROAD_WIDTH"
            @click="selectRoad(road)"
            @mouseover.alt="onRoadMouseover(road)">
      </path>

      <g v-show="showDots">
        <circle v-for="dot in dots"
                v-show="dot.shown"
                :r="DOT_RADIUS"
                :cx="dot.mapPosition.x"
                :cy="dot.mapPosition.y"
                :class="{'selected': dot.selected}"
                @click="selectDot(dot)">
        </circle>
      </g>

      <g v-show="showCrossroads">
        <circle v-for="crossroad in crossroads"
                :r="CROSSROAD_DOT_RADIUS"
                :cx="crossroad.dot.mapPosition.x"
                :cy="crossroad.dot.mapPosition.y"
                :class="{'selected': crossroad.selected}"
                @click="selectCrossroad(crossroad)">
        </circle>
      </g>

    </svg>
  </div>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator';
  import {
    CROSSROAD_DOT_RADIUS,
    DOT_RADIUS,
    FIELD_HEIGHT,
    FIELD_WIDTH,
    POINT_DISTANCE,
    ROAD_WIDTH
  } from '@/config';
  import {RootState} from '@/store/store';
  import {Dot} from '@/models/dot';
  import {Rect} from '@/models/geometry';
  import Road, {RoadType} from '@/models/road';
  import hotkeys from 'hotkeys-js';
  import {Mode} from './modes';
  import District from '@/models/district';
  import {ButtonType} from '@/models/inputs';
  import Crossroad from '@/models/crossroad';
  import crossroad from '@/models/crossroad';

  @Component
  export default class MapComponent extends Vue {
    private dots: Dot[] = Dot.buildArray();
    private selectedDistrict: District | undefined;

    private data() {
      return {
        DOT_RADIUS,
        ROAD_WIDTH,
        CROSSROAD_DOT_RADIUS,
      };
    }

    private mounted() {
      Mode.setup({
        dots: this.dots,
      });

      hotkeys('esc', () => {
        this.mode.onEscKey();
      });

      hotkeys('delete, backspace', () => {
        this.mode.onDeleteKey();
      });

      hotkeys('enter', () => {
        this.mode.onEnterKey();
      });
    }

    get state(): RootState {
      return this.$store.state as RootState;
    }

    get mapSize(): Rect {
      return {
        width: (FIELD_WIDTH + 1) * POINT_DISTANCE,
        height: (FIELD_HEIGHT + 1) * POINT_DISTANCE,
      };
    }

    get roads(): Road[] {
      return this.state.roads;
    }

    get crossroads(): Crossroad[] {
      return this.state.crossroads;
    }

    get districts(): District[] {
      return this.state.districts;
    }

    get toolbarState(): ButtonType {
      return this.state.toolbarState;
    }

    @Watch('toolbarState')
    private onToolbarStateChanged(newVal: ButtonType, oldVal: ButtonType) {
      Mode.getMode(oldVal).onEscKey();
    }

    get showBlocks(): boolean {
      return this.toolbarState === ButtonType.EditDistrict;
    }

    get showDots(): boolean {
      return this.toolbarState === ButtonType.BuildRoad;
    }

    get showCrossroads(): boolean {
      return this.toolbarState === ButtonType.EditCrossroad;
    }

    get mapClasses(): string[] {
      return [`map-${this.toolbarState.toString().toLowerCase()}`];
    }

    get mode(): Mode {
      return Mode.getMode(this.toolbarState);
    }

    private selectDot(nextDot: Dot) {
      this.mode.selectDot(nextDot);
    }

    private selectRoad(nextRoad: Road) {
      this.mode.selectRoad(nextRoad);
    }

    private selectDistrict(nextDistrict: District) {
      this.mode.selectDistrict(nextDistrict);
      this.selectedDistrict = nextDistrict;
    }

    private selectCrossroad(nextCrossroad: Crossroad) {
      this.mode.selectCrossroad(nextCrossroad);
    }

    private onRoadMouseover(road: Road) {
      this.mode.onRoadMouseover(road);
    }
  }
</script>
<style lang="scss" scoped>
  polygon.block {
    &.selected {
      stroke: transparent;
      stroke-width: 5px;
    }
  }
</style>

<style lang="scss">
  $selectedColor: #FD783F;
  $hoverColor: black;

  #canvas {
    background-color: #fbfbfb;
    cursor: default;
  }

  circle {
    fill: darkgray;
    cursor: pointer;

    &:hover, &.selected:hover {
      fill: $hoverColor;
      stroke: $hoverColor;
      stroke-width: 5px;
    }

    &.selected {
      fill: $selectedColor;
      stroke: $selectedColor;
      stroke-width: 5px;
    }
  }

  path {
    stroke: white;

    &.selected:hover {
      fill: $hoverColor;
      stroke: $hoverColor;
      stroke-width: 10px;
    }

    //highway
    &.type-1 {
      stroke: black;
    }

    //street
    &.type-2 {
      stroke: black;
    }

    //waterway
    &.type-3 {
      stroke: #0c88ee;
    }

    &.selected {
      stroke-width: 10px;
      stroke: $selectedColor;
    }
  }

  polygon {
    // residential
    &.district-1 {
      fill: #FCC038;
    }

    // commercial
    &.district-2 {
      fill: #9F89CF;
    }

    // industrial
    &.district-3 {
      fill: #FA4C4A;
    }

    // Nature
    &.district-4 {
      fill: #22B860;
    }

    // water
    &.district-5 {
      fill: #5ACAEE;
    }

    // wasteland
    &.district-6 {
      fill: #e0e2e5;
    }

    &.selected {
      stroke: $selectedColor;
      stroke-width: 5px;
    }
  }

  .map-buildroad,
  .map-markdistrict {
    path {
      &:hover {
        fill: $hoverColor;
        stroke: $hoverColor;
        stroke-width: 10px;
      }
    }
  }

  .map-editdistrict {
    polygon {
      &:hover {
        stroke: $hoverColor;
        stroke-width: 5px;
      }
    }
  }
</style>
