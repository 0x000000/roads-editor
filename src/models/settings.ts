export interface SettingsState {
  roadId: number;
  districtId: number;
  blockId: number;
}

export default class Settings implements SettingsState {
  private static instance: Settings | undefined;

  public static getInstance(): Settings {
    if (!this.instance) {
      this.instance = new Settings();
    }

    return this.instance;
  }

  public roadId!: number;
  public districtId!: number;
  public blockId!: number;

  private constructor() {
  }

  public initialize(state: SettingsState): Settings {
    this.roadId = state.roadId;
    this.districtId = state.districtId;
    this.blockId = state.blockId;
    return this;
  }

  get nextRoadId(): number {
    return this.roadId++;
  }

  get nextDistrictId(): number {
    return this.districtId++;
  }

  get nextBlockId(): number {
    return this.blockId++;
  }
}
