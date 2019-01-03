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
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
  import District, {DistrictType} from '@/models/district';
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
      };
    }

  }
</script>

<style scoped lang="scss">
</style>
