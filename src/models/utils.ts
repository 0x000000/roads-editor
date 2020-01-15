export interface GenerationChance<T> {
  readonly min: number;
  readonly max: number;
  readonly value: T;
}

export interface Range {
  min: number;
  max: number;
}

/* tslint:disable */
export interface CycledPair<T> {
  readonly start: T;
  readonly end: T;
}

export function cycledPairs<T>(array: T[]): CycledPair<T>[] {
  const pairs: CycledPair<T>[] = [];

  let first = array.length - 1;
  for (let second = 0; second < array.length; second++) {
    pairs.push({start: array[first], end: array[second]});

    first = second;
  }

  return pairs;
}
/* tslint:enable */

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rand100() {
  return random(0, 100);
}

export function inRange(value: number, min: number, max: number) {
  return value >= min && value <= max;
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
  return formula.split(',')
    .map(value => parseInt(value, 10))
    .reduce((total, current) => total + current, 0) === 100;
}

export function calculateChances<T>(formula: string, ...params: T[]): Array<GenerationChance<T>> {
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

export function selectByChance<T>(chances: Array<GenerationChance<T>>): T {
  const dice = rand100();
  return (chances.find(c => inRange(dice, c.min, c.max)) as GenerationChance<T>).value;
}

export function decide(range: Range): number {
  return random(range.min, range.max);
}

export function r(min: number, max: number): Range {
  return {min, max};
}

export function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
