import {Persistent} from '@/store/persistence';

export interface CityState {
  name: string;
}

export default class City implements Persistent<CityState> {
  public name!: string;

  constructor(state: CityState) {
    this.load(state);
  }

  load(rawState: CityState): void {
    this.name = rawState.name;
  }

  save(): CityState {
    return {name: this.name};
  }
}
