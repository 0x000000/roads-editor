import {BlockShape, BlockState, BlockType, Density, Wealth} from '@/models/block';
import {calculateChances, GenerationChance, selectByChance} from '@/models/utils';
import times from 'lodash/times';

export enum GeneratorType {
  Rural,
}

export enum DistrictShape {
  Linear,
  Ussr
}

export enum DistrictWealth {
  Poor,
  PoorLow,
  PoorMid,
  PoorHigh,
  Low,
  LowMid,
  LowHigh,
  Mid,
  MidHigh,
  High,
}

export enum TargetPopulation {
  VeryLow,
  Low,
  Medium,
  High,
  VeryHigh,
}

const DistrictWealthValues = {
  [DistrictWealth.Poor]: () => calculateChances('100', Wealth.Poor),
  [DistrictWealth.Low]: () => calculateChances('100', Wealth.Low),
  [DistrictWealth.Mid]: () => calculateChances('100', Wealth.Mid),
  [DistrictWealth.High]: () => calculateChances('100', Wealth.High),
  [DistrictWealth.PoorLow]: () => calculateChances('50,50', Wealth.Poor, Wealth.Low),
  [DistrictWealth.PoorMid]: () => calculateChances('33,34,33', Wealth.Poor, Wealth.Low, Wealth.Mid),
  [DistrictWealth.PoorHigh]: () => calculateChances('25,25,25,25', Wealth.Poor, Wealth.Low, Wealth.Mid, Wealth.High),
  [DistrictWealth.LowMid]: () => calculateChances('50,50', Wealth.Low, Wealth.Mid),
  [DistrictWealth.LowHigh]: () => calculateChances('33,34,33', Wealth.Low, Wealth.Mid, Wealth.High),
  [DistrictWealth.MidHigh]: () => calculateChances('50,50', Wealth.Mid, Wealth.High),
};

const DistrictTypeDensityValues = {
  [GeneratorType.Rural]: () => calculateChances('50,50', Density.Lowest, Density.Low),
};

export interface GeneratorOptions {
  type: GeneratorType;
  wealth: DistrictWealth;
  shape: DistrictShape;
  population: TargetPopulation;
}

function shortBlockRCI(type: BlockType, options: GeneratorOptions): BlockState {
  let wealth;
  let density;

  switch (type) {
    case BlockType.Forest:
    case BlockType.Park:
      density = Density.Lowest;
      wealth = Wealth.Low;
      break;

    default:
      density = selectByChance(DistrictTypeDensityValues[options.type]());
      wealth = selectByChance(DistrictWealthValues[options.wealth]());
  }

  return {
    id: 0,
    position: {x: 0, y: 0},
    paths: [],
    shape: BlockShape.Square,
    type,
    density,
    wealth,
    buildings: [],
    layoutId: undefined, //todo: >>>>>>>>>
  };
}

function generateBlock(blocks: Array<GenerationChance<BlockState>>): BlockState {
  return selectByChance(blocks);
}

export function generateRuralBlock(options: GeneratorOptions): BlockState {
  return generateBlock(
    calculateChances<BlockState>(
      '45,35,5,15',
      shortBlockRCI(BlockType.Residential, options),
      shortBlockRCI(BlockType.Agricultural, options),
      shortBlockRCI(BlockType.Industrial, options),
      shortBlockRCI(BlockType.Forest, options)
    )
  );
}

export function generateBlocks(options: GeneratorOptions, count: number): BlockState[] {
  return times(count).map(_ => {
    switch (options.type) {
      case GeneratorType.Rural: return generateRuralBlock(options);
      default: throw new Error('Unknown type' + options.type);
    }
  });
}
