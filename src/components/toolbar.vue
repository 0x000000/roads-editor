<template>
  <div class="toolbar">
    <Button :type="ButtonType.BuildRoad"></Button>
    <Button :type="ButtonType.EditCrossroad"></Button>
    <Button :type="ButtonType.MarkDistrict"></Button>
    <Button :type="ButtonType.EditDistrict"></Button>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import Button from '@/components/button.vue';
  import {ButtonType} from '@/models/inputs';

  @Component({
    components: {
      Button,
    },
  })
  export default class Toolbar extends Vue {
    private data() {
      return {
        ButtonType,
      };
    }
  }
</script>

<style scoped lang="scss">
  .toolbar {
    margin: 20px 0 10px 19px;
  }
</style>
