<template>
  <div class="builder">
    <Toolbar />
    <Map />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Toolbar from '@/components/toolbar.vue';
import Map from '@/components/map.vue';

@Component({
  components: {
    Toolbar,
    Map,
  },
})
export default class Home extends Vue {
  mounted() {
    new Audio('tick.mp3').play();
  }
}
</script>

<style scoped lang="scss">
  .builder {
    text-align: left;
  }
</style>
