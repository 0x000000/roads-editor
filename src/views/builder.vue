<template>
  <div class="builder">
    <Toolbar />
    <Map />
    <Editor />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Toolbar from '@/components/toolbar.vue';
import Map from '@/components/map.vue';
import Editor from '@/components/editor.vue';

@Component({
  components: {
    Toolbar,
    Map,
    Editor,
  },
})
export default class Home extends Vue {
  private mounted() {
    new Audio('tick.mp3').play();
  }
}
</script>

<style scoped lang="scss">
  .builder {
    text-align: left;
  }

  .map {
    float: left;
  }

  .editor {
    float: left;
  }
</style>
