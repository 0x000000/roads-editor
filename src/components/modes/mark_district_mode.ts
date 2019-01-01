import {Mode} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';
import store, {RootState} from '@/store/store';
import District from '@/models/district';
import {MutationName} from '@/mutations/mutations';

export class MarkDistrictMode extends Mode {
  private selectedRoads: Road[] = [];

  public selectDot(nextDot: Dot): void {
  }

  public selectRoad(nextRoad: Road): void {
    if (!this.selectedRoads.includes(nextRoad)) {
      this.selectedRoads.push(nextRoad);
      nextRoad.select();
    } else {
      this.selectedRoads.splice(this.selectedRoads.indexOf(nextRoad), 1);
      nextRoad.deselect();
    }
  }

  public onDeleteKey(): void {
  }

  public onEscKey(): void {
    this.selectedRoads.forEach(road => road.deselect());
    this.selectedRoads = [];
  }

  public onEnterKey(): void {
    const newDistrict: District | undefined = District.detectNewDistrict(this.selectedRoads);
    if (newDistrict) {
      store.commit(MutationName.BuildDistrict, newDistrict);
      this.onEscKey();
    }
  }

  private get state(): RootState {
    return store.state as RootState;
  }
}
