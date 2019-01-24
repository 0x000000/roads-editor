import {Mode} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';
import {MutationName} from '@/mutations/mutations';
import store from '@/store/store';

export class BuildRoadMode extends Mode {
  private selectedDot: Dot | undefined;
  private selectedRoads: Road[] = [];

  public selectDot(nextDot: Dot): void {
    if (this.selectedDot === undefined) { // pick first point
      this.selectedDot = nextDot;
      this.selectedDot.selected = true;

      this.map.dots.forEach((currentDot: Dot) => {
        if (
          nextDot.gridPosition.x === currentDot.gridPosition.x ||
          nextDot.gridPosition.y === currentDot.gridPosition.y ||
          Math.abs(nextDot.gridPosition.x - currentDot.gridPosition.x) ===
          Math.abs(nextDot.gridPosition.y - currentDot.gridPosition.y)
        ) {
          currentDot.shown = true;
        } else {
          currentDot.shown = false;
        }
      });
    } else if (this.selectedDot) { // pick second point
      if (this.selectedDot !== nextDot) { // do not reset selection

        this.resetSelectedRoads();

        store.commit(
          MutationName.BuildRoad,
          {start: nextDot.gridPosition, end: this.selectedDot.gridPosition}
        );
      }

      this.map.dots.forEach((dot: Dot) => dot.shown = true);
      this.selectedDot.selected = false;
      this.selectedDot = undefined;
    }
  }

  public selectRoad(nextRoad: Road): void {
    const selectedIndex = this.selectedRoads.indexOf(nextRoad);

    if (selectedIndex > -1 && nextRoad.selected === true) {
      this.selectedRoads[selectedIndex].selected = false;
      this.selectedRoads.splice(selectedIndex, 0);
    } else {
      nextRoad.selected = true;
      this.selectedRoads.push(nextRoad);
    }
  }

  public onDeleteKey(): void {
    if (this.selectedRoads.length === 1) {
      store.commit(MutationName.DeleteRoad, this.selectedRoads[0]);
      this.selectedRoads = [];
    }
  }

  public onRoadMouseover(road: Road) {
    this.selectRoad(road);
  }

  public onEscKey() {
    if (this.selectedDot) {
      this.selectedDot.selected = false;
      this.selectedDot = undefined;
      this.map.dots.forEach((dot: Dot) => dot.shown = true);
    }

    this.resetSelectedRoads();
  }

  private resetSelectedRoads() {
    this.selectedRoads.forEach(r => r.selected = false);
    this.selectedRoads = [];
  }
}
