export interface CityState {
  name: string;
}

export default class City implements CityState {
  public name: string;

  constructor(state: CityState) {
    this.name = state.name;
  }
}
