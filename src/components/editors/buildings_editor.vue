<template>
  <div class="road-editor">
    <h3>Buildings List</h3>

    <input type="button" value="Generate" @click="generate" />

    <ul>
      <li v-for="building in buildingVariants">
        {{building.name}}: {{TypeName[building.type]}} {{SizeName[building.size]}} {{building.slotSize}} {{building.width}}x{{building.height}}x{{building.length}} {{building.maxAngle}}&#176;
        <svg class="preview" :height="SLOT_SIZE * ZOOM" :width="SLOT_SIZE * ZOOM">
          <rect x="1" y="1" :width="building.width * ZOOM" :height="building.height * ZOOM"></rect>
        </svg>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'vue-property-decorator';
  import {BuildingSize, BuildingType, IBuildingVariant} from '@/models/building';
  import {generateBuildingVariants} from '@/models/building_generator';
  import {SLOT_SIZE} from '@/config';
  import store, {RootState} from '@/store/store';
  import {MutationName} from '@/mutations/mutations';

  const ZOOM = 3;

  const TypeName = {
    [BuildingType.Residential]: 'Residential',
    [BuildingType.Commercial]: 'Commercial',
    [BuildingType.Industrial]: 'Industrial',
    [BuildingType.HQ]: 'HQ',
  };

  const SizeName = {
    [BuildingSize.S]: 'S',
    [BuildingSize.M]: 'M',
    [BuildingSize.L]: 'L',
    [BuildingSize.XL]: 'XL',
    [BuildingSize.XXL]: 'XXL',
    [BuildingSize.XXXL]: 'XXXL',
  };

  @Component
  export default class BuildingsEditor extends Vue {
    private data() {
      return {
        TypeName,
        SizeName,
        SLOT_SIZE,
        ZOOM,
      };
    }

    private mounted() {
      //todo: console.log(JSON.stringify(this.buildingVariants));
    }

    get state(): RootState {
      return this.$store.state as RootState;
    }

    get buildingVariants(): IBuildingVariant[] {
      return this.state.buildingVariants;
    }

    private generate() {
      this.state.buildingVariants = generateBuildingVariants();
      store.commit(MutationName.SaveState);
    }
  }
</script>

<style scoped lang="scss">
  .preview {
    border: 1px solid #FD783F;
  }
</style>
