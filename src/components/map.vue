<template>
  <div class="map">
    <svg id="canvas"
         :width="mapSize.width"
         :height="mapSize.height"
         :class="mapClasses">

      <polygon v-for="district in districts"
               :points="district.svgPoints"
               :class="district.classes"
               @click="selectDistrict(district)">
      </polygon>

      <path v-for="road in roads"
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
    </svg>
  </div>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from 'vue-property-decorator';
  import {DOT_RADIUS, FIELD_HEIGHT, FIELD_WIDTH, POINT_DISTANCE, ROAD_WIDTH} from '../config';
  import {RootState} from '../store/store';
  import {Dot} from '../models/dot';
  import {Rect} from '../models/geometry';
  import Road, {RoadType} from '../models/road';
  import hotkeys from 'hotkeys-js';
  import {Mode} from './modes';
  import District from '@/models/district';
  import {ButtonType} from '@/models/inputs';

  @Component
  export default class Map extends Vue {
    private dots: Dot[] = Dot.buildArray();

    private data() {
      return {
        DOT_RADIUS,
        ROAD_WIDTH,
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

      hotkeys('shift+r,shift+c,shift+i,shift+f,shift+w', (_, handler) => {
        this.mode.onKey(handler.key);
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

    get showDots(): boolean {
      return this.toolbarState === ButtonType.BuildRoad;
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
    }

    private onRoadMouseover(road: Road) {
      this.mode.onRoadMouseover(road);
    }
  }
</script>

<style scoped lang="scss">
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

    &.type-border {
      stroke: lightgray;
    }

    &.type-highway {
      stroke: black;
    }

    &.type-street {
      stroke: darkgray;
    }

    &.selected {
      stroke-width: 10px;
      stroke: $selectedColor;
    }
  }

  polygon {
    &.district-wasteland {
      fill: #e0e2e5;
    }

    &.district-industrial {
      fill: #FA4C4A;
    }

    &.district-residential {
      fill: #FCC038;
    }

    &.district-commercial {
      fill: #9F89CF;
    }

    &.district-forest {
      fill: #22B860;
    }

    &.district-water {
      fill: #5ACAEE;
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
