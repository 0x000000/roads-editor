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
