import {ButtonType} from '@/models/inputs';
import {
  BuildCrossroadMode,
  BuildRoadMode,
  EditDistrictMode,
  MarkDistrictMode
} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';
import District from '@/models/district';
import {RootState} from '@/store/store';
import store from '@/store/store';
import Crossroad from '@/models/crossroad';

type ModeMap = { [key in ButtonType]: Mode };

export interface MapResources {
  dots: Dot[];
}

export abstract class Mode {
  private static modes: ModeMap;

  public static setup(map: MapResources) {
    this.modes = {
      [ButtonType.BuildRoad]: new BuildRoadMode(map),
      [ButtonType.MarkDistrict]: new MarkDistrictMode(map),
      [ButtonType.EditDistrict]: new EditDistrictMode(map),
      [ButtonType.EditCrossroad]: new BuildCrossroadMode(map),
    };
  }

  public static getMode(type: ButtonType): Mode {
    return this.modes[type];
  }

  protected constructor(protected map: MapResources) {
  }

  public selectDot(nextDot: Dot): void {
  }

  public selectRoad(nextRoad: Road): void {
  }

  public selectDistrict(nextDistrict: District): void {
  }

  public selectCrossroad(nextCrossroad: Crossroad) {

  }

  public onEnterKey(): void {
  }

  public onDeleteKey(): void {
  }

  public onEscKey(): void {
  }

  public onRoadMouseover(road: Road): void {}

  protected get state(): RootState {
    return store.state as RootState;
  }
}
