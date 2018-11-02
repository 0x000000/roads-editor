<template>
  <div class="builder">
    <Toolbar />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Toolbar from '@/components/toolbar.vue';

@Component({
  components: {
    Toolbar,
  },
})
export default class Home extends Vue {}
</script>

<style scoped lang="scss">
  .builder {
    text-align: left;
  }
</style>
