import {RootState} from '@/store/store';
import {MutationTree} from 'vuex';
import {ButtonType} from '@/models/inputs';
import {saveState} from '@/store/persistence';
import {Path} from '@/models/geometry';
import Road from '@/models/road';

export enum MutationName {
  ChangeToolbarState = 'ChangeToolbarState',
  BuildRoad = 'BuildRoad',
  DeleteRoad = 'DeleteRoad',
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
};
