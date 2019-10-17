<template>
  <div class="crossroad-editor">
    <h3>Edit crossroad</h3>

    <svg width="220" height="220">
      <path d="M 10 10 L 110 110" v-if="showNW"></path>
      <path d="M 110 0 L 110 110" v-if="showN"></path>
      <path d="M 210 10 L 110 110" v-if="showNE"></path>

      <path d="M 0 110 L 110 110" v-if="showW"></path>
      <circle r="20" cx="110" cy="110"></circle>
      <path d="M 220 110 L 110 110" v-if="showE"></path>

      <path d="M 10 210 L 110 110" v-if="showSW"></path>
      <path d="M 110 220 L 110 110" v-if="showS"></path>
      <path d="M 210 210 L 110 110" v-if="showSE"></path>
    </svg>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import Crossroad, {Directions} from '@/models/crossroad';

  @Component
  export default class CrossroadEditor extends Vue {
    @Prop() private crossroad!: Crossroad;

    @Watch('crossroad', {deep: true})
    private onCrossroadChanged() {
    }

    get showNW(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.NW);
    }

    get showN(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.N);
    }

    get showNE(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.NE);
    }

    get showW(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.W);
    }

    get showE(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.E);
    }

    get showSW(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.SW);
    }

    get showS(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.S);
    }

    get showSE(): boolean {
      return this.crossroad.connections.some(c => c.direction === Directions.SE);
    }
  }
</script>

<style scoped lang="scss">
  path {
    stroke: lightgray;
    stroke-width: 40px;
  }

  circle {
    fill: lightgray;
  }
</style>
