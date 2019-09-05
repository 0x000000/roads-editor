import {BlockLevel, BlockShape, BlockState, BlockType, Density, NatureType, Wealth} from '@/models/block';
import {inRange, rand100} from '@/models/utils';
import times from 'lodash/times';

export enum GeneratorType {
  Random,
  Rural,
}

export interface GenerationChance<T> {
  readonly min: number;
  readonly max: number;
  readonly value: T;
}

export interface GenerationOptions {
  readonly wealth: Array<GenerationChance<Wealth>>;
  readonly density: Array<GenerationChance<Density>>;
}

function parseFormula(formula: string): number[][] {
  let prev = 0;

  return formula.split(',').map(value => parseInt(value, 10)).map(value => {
    const range = prev === 0 ? [prev, value + prev] : [prev + 1, value + prev];
    prev += value;

    return range;
  });
}


function assertProbabilities(formula: string): boolean {
  return formula.split(',').map(value => parseInt(value, 10)).reduce((total, current) => total + current, 0) === 100;
}

function chance<T>(formula: string, ...params: T[]): Array<GenerationChance<T>> {
  if (params.length !== formula.split(',').length) {
    throw new Error('Wrong params count');
  }

  if (!assertProbabilities(formula)) {
    throw new Error('Sum of chances != 100%');
  }

  return parseFormula(formula).map(([min, max], index) => {
    return {min, max, value: params[index]};
  });
}

function select<T>(chances: Array<GenerationChance<T>>): T {
  const dice = rand100();
  return (chances.find(c => inRange(dice, c.min, c.max)) as GenerationChance<T>).value;
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
    natureType: NatureType.None,
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
  const wealth = select<Wealth>(options.wealth);
  const density = select<Density>(options.density);

  return select<BlockState>(blocks);
}

export function generateRuralBlock(): BlockState {
  return generateBlock(
    {
      wealth: chance<Wealth>('50,50', Wealth.Low, Wealth.Mid),
      density: chance<Density>('60,30,10', Density.Lowest, Density.Low, Density.Medium),
    },
    chance<BlockState>(
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
