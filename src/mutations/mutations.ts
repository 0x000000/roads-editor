import {RootState} from '@/store/store';
import {MutationTree} from 'vuex';
import {ButtonType} from '@/models/inputs';
import {saveState} from '@/store/persistence';
import {Path} from '@/models/geometry';
import Road from '@/models/road';
import District from '@/models/district';

export enum MutationName {
  ChangeToolbarState = 'ChangeToolbarState',
  BuildRoad = 'BuildRoad',
  DeleteRoad = 'DeleteRoad',
  BuildDistrict = 'BuildDistrict',
  SaveState = 'SaveState',
}

export const mutations: MutationTree<RootState> = {
  [MutationName.ChangeToolbarState]: (state, type: ButtonType) => {
    state.toolbarState = type;
    saveState(state);
  },
  [MutationName.BuildRoad]: (state, path: Path) => {
    state.roads = Road.recalculateNetwork(path, state.roads);
    saveState(state);
  },
  [MutationName.DeleteRoad]: (state, road: Road) => {
    state.roads = Road.deleteRoad(road, state.roads);
    saveState(state);
  },
  [MutationName.BuildDistrict]: (state, district: District) => {
    state.districts.push(district);
    saveState(state);
  },
  [MutationName.SaveState]: (state) => {
    saveState(state);
  },
};
