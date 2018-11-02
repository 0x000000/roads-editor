<template>
  <div class="toolbar">
    <Button :type="ButtonType.SelectRoad"></Button>
    <Button :type="ButtonType.BuildRoad"></Button>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import Button from '@/components/button.vue';
  import {ButtonType} from '../models/inputs';

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
    margin-bottom: 10px;
  }
</style>
