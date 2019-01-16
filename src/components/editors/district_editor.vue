<template>
  <div class="district-editor">
    <h4>Edit district</h4>

    <label>
      Type
      <select v-model="district.type">
        <option :value="DistrictType.Wasteland">Wasteland</option>
        <option :value="DistrictType.Residential">Residential</option>
        <option :value="DistrictType.Commercial">Commercial</option>
        <option :value="DistrictType.Industrial">Industrial</option>
        <option :value="DistrictType.Forest">Forest</option>
        <option :value="DistrictType.Water">Water</option>
      </select>
    </label>

    <div v-for="(tier, num) in tiers" class="tier">
      <h5>Tier {{num + 1}}</h5>

      <label>
        Density
        <select v-model="district[tier].density">
          <option :value="1">1 - Rural</option>
          <option :value="2">2 - Suburban</option>
          <option :value="3">3 - Urban</option>
          <option :value="4">4 - Urban Center</option>
          <option :value="5">5 - Urban Core</option>
        </select>
      </label>

      <label>
        Wealth
        <select v-model="district[tier].wealth">
          <option :value="1">1 - Working class</option>
          <option :value="2">2 - Middle class</option>
          <option :value="3">3 - Upper class</option>
        </select>
      </label>

      <label>
        Max Population ~{{RecommendedPopulationByDensity[district[tier].density]}}
        <input v-model.number="district[tier].maxPopulation" type="number" />
      </label>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import District, {DistrictType, RecommendedPopulationByDensity} from '@/models/district';
  import store from '@/store/store';
  import {MutationName} from '@/mutations/mutations';

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
      };
    }

    get tiers(): string[] {
      return ['t1', 't2', 't3'];
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
</style>
