import {BlockLevel, BlockShape, BlockState, BlockType, Density, NatureType, Wealth} from '@/models/block';
import {calculateChances, GenerationChance, selectByChance} from '@/models/utils';
import times from 'lodash/times';

export enum GeneratorType {
  Random,
  Rural,
}

export interface GenerationOptions {
  readonly wealth: Array<GenerationChance<Wealth>>;
  readonly density: Array<GenerationChance<Density>>;
}

function shortBlockRCI(type: BlockType): BlockState {
  return {
    id: 0,
    position: {x: 0, y: 0},
    paths: [],
    shape: BlockShape.Square,
    type,
    density: Density.Lowest,
    wealth: Wealth.Poor,
    natureType: NatureType.Forest,
    level: BlockLevel.Zero,
  };
}

function shortBlockNature(natureType: NatureType) {
  return {
    id: 0,
    position: {x: 0, y: 0},
    paths: [],
    shape: BlockShape.Square,
    type: BlockType.Nature,
    density: Density.Lowest,
    wealth: Wealth.Poor,
    natureType,
    level: BlockLevel.Zero,
  };
}

function generateBlock(options: GenerationOptions, blocks: Array<GenerationChance<BlockState>>): BlockState {
  const wealth = selectByChance<Wealth>(options.wealth);
  const density = selectByChance<Density>(options.density);

  return selectByChance<BlockState>(blocks);
}

export function generateRuralBlock(): BlockState {
  return generateBlock(
    {
      wealth: calculateChances<Wealth>('50,50', Wealth.Low, Wealth.Mid),
      density: calculateChances<Density>('60,30,10', Density.Lowest, Density.Low, Density.Medium),
    },
    calculateChances<BlockState>(
      '55,35,5,5',
      shortBlockRCI(BlockType.Residential),
      shortBlockNature(NatureType.Agricultural),
      shortBlockRCI(BlockType.Industrial),
      shortBlockNature(NatureType.Forest)
    )
  );
}

export function generateBlocks(type: GeneratorType, count: number): BlockState[] {
  return times(count).map(_ => {
    switch (type) {
      case GeneratorType.Rural: return generateRuralBlock();
      default: throw new Error('Unknown type' + type);
    }
  });
}
