<template>
  <div class="road-editor">
    <h4>Edit road</h4>

    <label>
      Type
      <select v-model="road.type">
        <option :value="RoadType.Street">Street</option>
        <option :value="RoadType.Highway">Highway</option>
        <option :value="RoadType.Border">Border</option>
        <option :value="RoadType.Water">Water</option>
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
    @Prop() private road!: Road;

    @Watch('road', {deep: true})
    private onRoadChanged() {
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
