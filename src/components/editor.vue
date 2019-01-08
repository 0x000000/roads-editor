<template>
  <div class="editor">
    <div class="editor-content">
      <RoadEditor v-if="showRoadEditor" :road="selectedRoad" />
      <DistrictEditor v-if="showDistrictEditor" :district="selectedDistrict" />
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import RoadEditor from '@/components/editors/road_editor.vue';
  import {RootState} from '@/store/store';
  import {ButtonType} from '@/models/inputs';
  import Road from '@/models/road';
  import DistrictEditor from '@/components/editors/district_editor.vue';
  import District from '@/models/district';


  @Component({
    components: {
      RoadEditor,
      DistrictEditor,
    },
  })
  export default class Editor extends Vue {
    get state(): RootState {
      return this.$store.state as RootState;
    }

    get toolbarState(): ButtonType {
      return this.state.toolbarState;
    }

    get selectedRoad(): Road | undefined {
      return this.state.roads.find(r => r.selected);
    }

    get showRoadEditor(): boolean {
      return this.toolbarState === ButtonType.BuildRoad && this.selectedRoad !== undefined;
    }

    get selectedDistrict(): District | undefined {
      return this.state.districts.find(d => d.selected);
    }

    get showDistrictEditor(): boolean {
      return this.toolbarState === ButtonType.EditDistrict && this.selectedDistrict !== undefined;
    }
  }
</script>

<style scoped lang="scss">
  .editor {
    margin-left: 15px;
  }

  /deep/ label {
    font-size: 15px;
  }


  /deep/ label,
  /deep/ input,
  /deep/ select {
    display: block;
  }

  /deep/ input,
  /deep/ select {
    margin-bottom: 14px;
    font-size: 16px;
    padding: 3px 5px;
    min-width: 200px;
  }

  /deep/ select {
    height: 30px;
    min-width: 215px;
  }


</style>
