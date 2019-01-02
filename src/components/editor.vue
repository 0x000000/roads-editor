<template>
  <div class="editor">
    <RoadEditor v-if="showRoadEditor" :road="selectedRoad"/>
  </div>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import RoadEditor from '@/components/editors/road_editor.vue';
  import {RootState} from '@/store/store';
  import {ButtonType} from '@/models/inputs';
  import Road from '@/models/road';


  @Component({
    components: {
      RoadEditor,
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
  }
</script>

<style scoped lang="scss">
  .editor {
    margin-left: 15px;
  }

  input {
    display: block;
  }
</style>
