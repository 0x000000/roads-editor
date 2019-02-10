import {ButtonType} from '../models/inputs';
<template>
  <div class="editor">
    <div class="editor-content">
      <RoadEditor v-if="showRoadEditor" :roads="selectedRoads" />
      <DistrictEditor v-if="showDistrictEditor" :district="selectedDistrict" />
      <CrossroadEditor v-if="showCrossroadEditor" :crossroad="selectedCrossroad" />
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
  import CrossroadEditor from '@/components/editors/crossroad_editor.vue';
  import Crossroad from '@/models/crossroad';


  @Component({
    components: {
      RoadEditor,
      DistrictEditor,
      CrossroadEditor,
    },
  })
  export default class Editor extends Vue {
    get state(): RootState {
      return this.$store.state as RootState;
    }

    get toolbarState(): ButtonType {
      return this.state.toolbarState;
    }

    get selectedRoads(): Road[] {
      return this.state.roads.filter(r => r.selected);
    }

    get selectedCrossroad(): Crossroad | undefined {
      return this.state.crossroads.find(c => c.selected);
    }

    get showRoadEditor(): boolean {
      return this.toolbarState === ButtonType.BuildRoad && this.selectedRoads.length > 0;
    }

    get selectedDistrict(): District | undefined {
      return this.state.districts.find(d => d.selected);
    }

    get showDistrictEditor(): boolean {
      return this.toolbarState === ButtonType.EditDistrict && this.selectedDistrict !== undefined;
    }

    get showCrossroadEditor(): boolean {
      return this.toolbarState === ButtonType.EditCrossroad && this.selectedCrossroad !== undefined;
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
