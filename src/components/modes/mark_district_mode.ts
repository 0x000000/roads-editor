import {Mode} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';
import store from '@/store/store';

export class MarkDistrictMode extends Mode {
  public selectDot(nextDot: Dot): void {
  }

  public selectRoad(nextRoad: Road): void {
  }

  public onDeleteKey(): void {
  }
}
