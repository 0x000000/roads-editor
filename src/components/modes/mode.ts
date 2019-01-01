import {ButtonType} from '@/models/inputs';
import {BuildRoadMode, MarkDistrictMode} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';

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
    };
  }

  public static getMode(type: ButtonType): Mode {
    return this.modes[type];
  }

  protected constructor(protected map: MapResources) {
  }

  public abstract selectDot(nextDot: Dot): void;

  public abstract selectRoad(nextRoad: Road): void;

  public abstract onEnterKey(): void;

  public abstract onDeleteKey(): void;

  public abstract onEscKey(): void;
}
