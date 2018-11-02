<template>
  <span class="button">
    <button class="mdi" :class="classes" @click="selectButton"></button>
  </span>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {ButtonType} from '@/models/inputs';
  import {RootState} from '../store/store';
  import {MutationName} from '../mutations/mutations';

  type IconMap = {[key in ButtonType]: string};

  const Icons: IconMap = {
    [ButtonType.SelectRoad]: 'mdi-cursor-default',
    [ButtonType.BuildRoad]: 'mdi-road',
  };

  @Component
  export default class Button extends Vue {
    @Prop() private type!: ButtonType;

    get state(): RootState {
      return this.$store.state as RootState;
    }

    get classes(): string {
      return [Icons[this.type], this.activeClass].join(' ');
    }

    get activeClass(): string {
      return this.type === this.state.toolbarState ? 'active' : '';
    }

    private selectButton() {
      this.$store.commit(MutationName.ChangeToolbarState, this.type);
    }
  }
</script>

<style scoped lang="scss">
  .mdi {
    padding: 0;
    font-size: 24px;
    height: 36px;
    width: 36px;
    color: gray;
    cursor: pointer;

    &.active {
      color: black;
    }
  }
</style>
