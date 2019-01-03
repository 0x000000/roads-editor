import {ButtonType} from '@/models/inputs';
import {BuildRoadMode, EditDistrictMode, MarkDistrictMode} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';
import District from '@/models/district';
import {RootState} from '@/store/store';
import store from '@/store/store';

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

  public onEnterKey(): void {
  }

  public onDeleteKey(): void {
  }

  public onEscKey(): void {
  }

  private get state(): RootState {
    return store.state as RootState;
  }
}