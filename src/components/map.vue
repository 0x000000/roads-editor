<template>
  <div class="map">
    <svg id="canvas" :width="mapSize.width" :height="mapSize.height">
      <!--<path v-for="road in roads"-->
      <!--:d="road.d"-->
      <!--:class="road.classes"-->
      <!--:stroke-width="ROAD_WIDTH"-->
      <!--@click="selectRoad(road)"-->
      <!--/>-->

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
  import {RootState} from '../store';
  import {Dot} from '../models/dot';
  import {Rect} from '../models/geometry';
  import {MutationName} from '../mutations';

  @Component
  export default class Map extends Vue {
    private dots: Dot[] = Dot.buildArray();

    private data() {
      return {
        DOT_RADIUS,
        ROAD_WIDTH,
      };
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

    private selectedDot: Dot | undefined;

    private selectDot(nextDot: Dot) {
      if (this.selectedDot === undefined) { // pick first point
        this.selectedDot = nextDot;
        this.selectedDot.selected = true;

        this.dots.forEach((currentDot: Dot) => {
          if (
            nextDot.gridPosition.x === currentDot.gridPosition.x ||
            nextDot.gridPosition.y === currentDot.gridPosition.y ||
            Math.abs(nextDot.gridPosition.x - currentDot.gridPosition.x) ===
            Math.abs(nextDot.gridPosition.y - currentDot.gridPosition.y)
          ) {
            currentDot.shown = true;
          } else {
            currentDot.shown = false;
          }
        });
      } else if (this.selectedDot) { // pick second point
        if (this.selectedDot !== nextDot) { // do not reset selection
        }

        this.dots.forEach((dot: Dot) => dot.shown = true);
        this.selectedDot.selected = false;
        this.selectedDot = undefined;
      }
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
        stroke: gray;
      }

      &.type-highway {
        stroke: black;
      }

      &.type-street {
        stroke: lightgray;
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
        stroke-width: 5px;
      }

      &.selected {
        fill: darkred;
        stroke: darkred;
        stroke-width: 5px;
      }
    }
  }
</style>
