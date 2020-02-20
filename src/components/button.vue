<template>
  <span class="button">
    <button class="mdi"
            :class="classes"
            @click="selectButton">
      <span>{{title}}</span>
    </button>
  </span>
</template>

<script lang="ts">
  import {Component, Prop, Vue} from 'vue-property-decorator';
  import {ButtonType} from '@/models/inputs';
  import {RootState} from '@/store/store';
  import {MutationName} from '@/mutations/mutations';

  type ButtonMap = {[key in ButtonType]: string};

  const Icons: ButtonMap = {
    [ButtonType.BuildRoad]: 'mdi-road',
    [ButtonType.MarkDistrict]: 'mdi-border-bottom',
    [ButtonType.EditDistrict]: 'mdi-border-all',
    [ButtonType.EditCrossroad]: 'mdi-transit-connection-variant',
  };

  const Titles: ButtonMap = {
    [ButtonType.BuildRoad]: 'Roads',
    [ButtonType.EditCrossroad]: 'Crossroads',
    [ButtonType.MarkDistrict]: 'Create District',
    [ButtonType.EditDistrict]: 'Edit District',
  };

  @Component
  export default class Button extends Vue {
    @Prop() private type!: ButtonType;

    private data() {
      return {
        ButtonType,
      };
    }

    get state(): RootState {
      return this.$store.state as RootState;
    }

    get classes(): string {
      return [Icons[this.type], this.activeClass].join(' ');
    }

    get activeClass(): string {
      return this.type === this.state.toolbarState ? 'active' : '';
    }

    get title(): string {
      return Titles[this.type];
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
    height: 80px;
    width: 80px;
    color: gray;
    cursor: pointer;

    &.active {
      color: black;
    }

    span {
      display: block;
      font-family: 'PT Sans';
      font-size: 12px;
    }
  }
</style>
