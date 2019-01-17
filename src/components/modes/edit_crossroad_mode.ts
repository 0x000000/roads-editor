import {Mode} from '@/components/modes';
import Crossroad from '@/models/crossroad';

export class BuildCrossroadMode extends Mode {
  private selectedCrossroad: Crossroad | undefined;

  public selectCrossroad(nextCrossroad: Crossroad) {
    if (this.selectedCrossroad) {
      this.selectedCrossroad.selected = false;
    }

    if (this.selectedCrossroad !== nextCrossroad) {
      this.selectedCrossroad = nextCrossroad;
      this.selectedCrossroad.selected = true;
    } else {
      this.selectedCrossroad.selected = false;
      this.selectedCrossroad = undefined;
    }
  }

  public onEscKey(): void {
    if (this.selectedCrossroad) {
      this.selectedCrossroad.selected = false;
      this.selectedCrossroad = undefined;
    }
  }
}
