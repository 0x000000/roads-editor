import {Mode} from '@/components/modes';
import {Dot} from '@/models/dot';
import Road from '@/models/road';
import {MutationName} from '@/mutations/mutations';
import store from '@/store/store';

export class BuildRoadMode extends Mode {

  public selectDot(nextDot: Dot): void {
    if (this.map.selectedDot === undefined) { // pick first point
      this.map.selectedDot = nextDot;
      this.map.selectedDot.selected = true;

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
    } else if (this.map.selectedDot) { // pick second point
      if (this.map.selectedDot !== nextDot) { // do not reset selection
        this.map.selectedRoad = undefined;
        store.commit(
          MutationName.BuildRoad,
          {start: nextDot.gridPosition, end: this.map.selectedDot.gridPosition}
        );
      }

      this.map.dots.forEach((dot: Dot) => dot.shown = true);
      this.map.selectedDot.selected = false;
      this.map.selectedDot = undefined;
    }
  }

  public selectRoad(nextRoad: Road): void {
    if (this.map.selectedRoad) {
      this.map.selectedRoad.deselect();
    }

    if (this.map.selectedRoad !== nextRoad) {
      this.map.selectedRoad = nextRoad;
      this.map.selectedRoad.select();
    } else {
      this.map.selectedRoad = undefined;
    }
  }

  public onDeleteKey(): void {
    if (this.map.selectedRoad) {
      store.commit(MutationName.DeleteRoad, this.map.selectedRoad);
      this.map.selectedRoad = undefined;
    }
  }
}
