<template>
  <span class="button">
    <button class="mdi"
            :class="classes"
            @click="selectButton">
      <span v-show="type === ButtonType.BuildRoad">Roads: <b>{{roadsCount}}</b></span>
      <span v-show="type === ButtonType.BuildRoad">&nbsp;</span>

      <span v-show="type === ButtonType.EditCrossroad">&nbsp;</span>
      <span v-show="type === ButtonType.EditCrossroad">&nbsp;</span>

      <span v-show="type === ButtonType.MarkDistrict">Dists: <b>{{districtsCount}}</b></span>
      <span v-show="type === ButtonType.MarkDistrict">Waste: <b>{{wasteDistsCount}}</b></span>

      <span v-show="type === ButtonType.EditDistrict"><b>{{districtsDetailedCount}}</b></span>
      <span v-show="type === ButtonType.EditDistrict">P: <b>{{districtsDetailedPops}}</b></span>
    </button>
  </span>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {ButtonType} from '@/models/inputs';
  import {RootState} from '@/store/store';
  import {MutationName} from '@/mutations/mutations';
  import {RoadType} from '@/models/road';
  import {DistrictType} from '@/models/district';

  type IconMap = {[key in ButtonType]: string};

  const Icons: IconMap = {
    [ButtonType.BuildRoad]: 'mdi-road',
    [ButtonType.MarkDistrict]: 'mdi-home-plus',
    [ButtonType.EditDistrict]: 'mdi-home-city',
    [ButtonType.EditCrossroad]: 'mdi-transit-connection-variant',
  };

  @Component
  export default class Button extends Vue {
    @Prop() private type!: ButtonType;

    private data() {
      return {
        ButtonType,
      };
    }

    get state(): RootState {
      return this.$store.state as RootState;
    }

    get classes(): string {
      return [Icons[this.type], this.activeClass].join(' ');
    }

    get activeClass(): string {
      return this.type === this.state.toolbarState ? 'active' : '';
    }

    get roadsCount(): number {
      return this.state.roads.length;
    }

    get districtsCount(): number {
      return this.state.districts.filter(d => {
        return !(d.type === DistrictType.Water || d.type === DistrictType.Wasteland);
      }).length;
    }

    get wasteDistsCount(): number {
      return this.state.districts.length - this.districtsCount;
    }

    get districtsDetailedCount(): string {
      const counter = {
        [DistrictType.Residential]: 0,
        [DistrictType.Commercial]: 0,
        [DistrictType.Industrial]: 0,
        [DistrictType.Forest]: 0,
        [DistrictType.Wasteland]: 0,
        [DistrictType.Water]: 0,
      };

      this.state.districts.forEach(d => counter[d.type]++);

      return [
        counter[DistrictType.Residential],
        counter[DistrictType.Commercial],
        counter[DistrictType.Industrial],
        counter[DistrictType.Forest],
      ].join(',');
    }

    get districtsDetailedPops(): string {
      // let maxPop = 0;
      // let maxWork = 0;
      // this.state.districts.forEach(d => {
      //   maxPop += d.t3.maxPopulation;
      //   maxWork += d.t3.maxWorkspace;
      // });

      return [
        0, 0,
      ].join('/');
    }

    private selectButton() {
      this.$store.commit(MutationName.ChangeToolbarState, this.type);
    }
  }
</script>

<style scoped lang="scss">
  .mdi {
    padding: 0;
    font-size: 24px;
    height: 80px;
    width: 80px;
    color: gray;
    cursor: pointer;

    &.active {
      color: black;
    }

    span {
      display: block;
      font-family: 'PT Sans';
      font-size: 12px;
    }
  }
</style>
