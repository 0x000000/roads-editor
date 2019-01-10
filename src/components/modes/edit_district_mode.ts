import {Mode} from '@/components/modes';
import District, {DistrictType} from '@/models/district';
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

  public onKey(key: string) {
    if (!this.selectedDistrict) { return; }

    switch (key) {
      case 'shift+r': this.selectedDistrict.type = DistrictType.Residential; break;
      case 'shift+c': this.selectedDistrict.type = DistrictType.Commercial; break;
      case 'shift+i': this.selectedDistrict.type = DistrictType.Industrial; break;
      case 'shift+f': this.selectedDistrict.type = DistrictType.Forest; break;
      case 'shift+w': this.selectedDistrict.type = DistrictType.Water; break;
    }
  }

  public onEscKey(): void {
    if (this.selectedDistrict) {
      this.selectedDistrict.selected = false;
      this.selectedDistrict = undefined;
    }
  }
}
