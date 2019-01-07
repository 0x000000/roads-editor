import {Mode} from '@/components/modes';
import District from '@/models/district';
import store from '@/store/store';
import {MutationName} from '@/mutations/mutations';

export class EditDistrictMode extends Mode {
  private selectedDistrict: District | undefined;

  public selectDistrict(nextDistrict: District) {
    if (this.selectedDistrict) {
      this.selectedDistrict.selected = false;
    }

    if (this.selectedDistrict !== nextDistrict) {
      this.selectedDistrict = nextDistrict;
      this.selectedDistrict.selected = true;
    } else {
      this.selectedDistrict.selected = false;
      this.selectedDistrict = undefined;
    }
  }

  public onDeleteKey(): void {
    if (this.selectedDistrict) {
      store.commit(MutationName.DeleteDistrict, this.selectedDistrict);
    }
  }

  public onEscKey(): void {
    if (this.selectedDistrict) {
      this.selectedDistrict.selected = false;
      this.selectedDistrict = undefined;
    }
  }
}
