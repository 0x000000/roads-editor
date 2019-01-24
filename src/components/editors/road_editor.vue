<template>
  <div class="road-editor">
    <h4>Edit road</h4>

    <label>
      Type
      <select v-model="roads[0].type">
        <option :value="RoadType.Street">Street</option>
        <option :value="RoadType.Highway">Highway</option>
        <option :value="RoadType.Border">Border</option>
        <option :value="RoadType.WaterWay">Water Way</option>
      </select>
    </label>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import Road, {RoadType} from '@/models/road';
  import store from '@/store/store';
  import {MutationName} from '@/mutations/mutations';

  @Component
  export default class RoadEditor extends Vue {
    @Prop() private roads!: Road[];

    @Watch('roads', {deep: true})
    private onRoadsChanged() {
      const refType = this.roads[0].type;

      this.roads.forEach(r => {
        r.type = refType;
      });

      store.commit(MutationName.SaveState);
    }

    private data() {
      return {
        RoadType,
      };
    }
  }
</script>

<style scoped lang="scss">
</style>
