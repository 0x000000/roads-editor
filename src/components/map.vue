<template>
  <div class="map">
    <div>
      Roads: {{roadsCount}}
    </div>

    <svg id="canvas" :width="mapSize.width" :height="mapSize.height">
      <path v-for="road in roads"
            :d="road.d"
            :class="road.classes"
            :stroke-width="ROAD_WIDTH"
            @click="selectRoad(road)">
      </path>

      <g>
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
  import {Component, Vue} from 'vue-property-decorator';
  import {DOT_RADIUS, FIELD_HEIGHT, FIELD_WIDTH, POINT_DISTANCE, ROAD_WIDTH} from '../config';
  import {RootState} from '../store/store';
  import {Dot} from '../models/dot';
  import {Rect} from '../models/geometry';
  import Road, {RoadType} from '../models/road';
  import hotkeys from 'hotkeys-js';
  import {Mode} from './modes';

  @Component
  export default class Map extends Vue {
    private dots: Dot[] = Dot.buildArray();
    private selectedDot: Dot | undefined;
    private selectedRoad: Road | undefined;

    private data() {
      return {
        DOT_RADIUS,
        ROAD_WIDTH,
      };
    }

    private mounted() {
      Mode.setup({
        dots: this.dots,
        selectedDot: this.selectedDot,
        selectedRoad: this.selectedRoad,
      });

      hotkeys('esc', () => {
        Mode.getMode(this.state.toolbarState).onEscKey();
      });

      hotkeys('delete, backspace', () => {
        Mode.getMode(this.state.toolbarState).onDeleteKey();
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

    get roadsCount(): number {
      return this.roads.filter(road => road.type !== RoadType.Border).length;
    }

    private selectDot(nextDot: Dot) {
      Mode.getMode(this.state.toolbarState).selectDot(nextDot);
    }

    private selectRoad(nextRoad: Road) {
      Mode.getMode(this.state.toolbarState).selectRoad(nextRoad);
    }
  }
</script>

<style scoped lang="scss">
  #canvas {
    background-color: lightgray;

    circle {
      fill: white;
      cursor: pointer;

      &:hover, &.selected:hover {
        fill: black;
        stroke: black;
        stroke-width: 5px;
      }

      &.selected {
        fill: darkred;
        stroke: darkred;
        stroke-width: 5px;
      }
    }

    path {
      stroke: white;

      &.type-border {
        stroke: #bcbcbc;
      }

      &.type-highway {
        stroke: black;
      }

      &.type-street {
        stroke: gray;
      }

      &.error {
        stroke: red;
      }

      &.warning {
        stroke: orange;
      }

      &:hover, &.selected:hover {
        fill: black;
        stroke: black;
        stroke-width: 10px;
      }

      &.selected {
        stroke-width: 10px;
      }
    }
  }
</style>
