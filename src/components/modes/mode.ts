import {ButtonType} from '@/models/inputs';
import {BuildRoadMode, MarkDistrictMode} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';

type ModeMap = { [key in ButtonType]: Mode };

export interface MapResources {
  dots: Dot[];
  selectedDot: Dot | undefined;
  selectedRoad: Road | undefined;
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

  public abstract onDeleteKey(): void;

  public onEscKey() {
    if (this.map.selectedDot) {
      this.map.selectedDot.selected = false;
      this.map.selectedDot = undefined;
    }

    if (this.map.selectedRoad) {
      this.map.selectedRoad.deselect();
      this.map.selectedRoad = undefined;
    }
  }
}
