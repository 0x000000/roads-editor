<template>
  <div class="about">
    <h3>Tips</h3>
    <ul>
      <li>Режим создания дорог: позволяет выделять/развыделять дорогу по ховеру c альтом</li>
      <li>Режим создания района: позволяет выделять/развыделять дороги по ховеру c альтом</li>
      <li>Режим создания района: нажми enter чтоб создать район на выделенных дорогах</li>
      <li>Режим редактора района: выдели район и нажми Shift + R/C/I/F/W чтоб выбрать тип района
      </li>
    </ul>

    <h3>Variants</h3>
    <div>
      <svg width="220" height="220" v-for="variant in variants">
        <path d="M 10 10 L 110 110" v-if="variant.showNW"></path>
        <path d="M 110 0 L 110 110" v-if="variant.showN"></path>
        <path d="M 210 10 L 110 110" v-if="variant.showNE"></path>

        <path d="M 0 110 L 110 110" v-if="variant.showW"></path>
        <circle r="5" cx="110" cy="110"></circle>
        <path d="M 220 110 L 110 110" v-if="variant.showE"></path>

        <path d="M 10 210 L 110 110" v-if="variant.showSW"></path>
        <path d="M 110 220 L 110 110" v-if="variant.showS"></path>
        <path d="M 210 210 L 110 110" v-if="variant.showSE"></path>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';

  const CROSSROAD_VARIANTS = {
    '10000001': false,
    '10000010': false,
    '10000011': false,
    '10000100': false,
    '10000110': false,
    '10000101': false,
    '10000111': false,
    '10001000': false,
    '10001100': false,
    '10001010': false,
    '10001110': false,
    '10001001': false,
    '10001101': false,
    '10001011': false,
    '10001111': false,
    '10010010': false,
    '10010011': false,
    '10011010': false,
    '10010110': false,
    '10011110': false,
    '10011001': false,
    '10010101': false,
    '10011101': false,
    '10011011': false,
    '10010111': false,
    '10011111': false,
    '10101010': false,
    '10101011': false,
    '10101101': false,
    '10101111': false,
    '10110111': false,
    '10111011': false,
    '10111111': false,
    '11111111': false,
  };

  class CrossroadVariant {
    constructor(private variant: string) {
    }

    get showN(): boolean {
      return this.variant[0] === '1';
    }

    get showNE(): boolean {
      return this.variant[1] === '1';
    }

    get showE(): boolean {
      return this.variant[2] === '1';
    }

    get showSE(): boolean {
      return this.variant[3] === '1';
    }

    get showS(): boolean {
      return this.variant[4] === '1';
    }

    get showSW(): boolean {
      return this.variant[5] === '1';
    }

    get showW(): boolean {
      return this.variant[6] === '1';
    }

    get showNW(): boolean {
      return this.variant[7] === '1';
    }
  }

  @Component
  export default class About extends Vue {
    private variants: CrossroadVariant[] = Object.keys(CROSSROAD_VARIANTS).map(v => new CrossroadVariant(v));
  }
</script>
<style scoped lang="scss">
  svg {
    margin: 10px;
  }

  path {
    stroke: lightgray;
    stroke-width: 10px;
  }

  circle {
    fill: lightgray;
  }
</style>
