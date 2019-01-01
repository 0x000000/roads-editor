export interface SettingsState {
  roadId: number;
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

  private constructor() {
  }

  public initialize(state: SettingsState): Settings {
    this.roadId = state.roadId;
    return this;
  }

  get nextRoadId(): number {
    return this.roadId++;
  }
}
