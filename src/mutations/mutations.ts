import {RootState} from '@/store/store';
import {MutationTree} from 'vuex';
import {ButtonType} from '@/models/inputs';
import {loadState, saveState} from '@/store/persistence';
import {Path} from '@/models/geometry';
import Road from '@/models/road';
import District from '@/models/district';
import difference from 'lodash/difference';
import Crossroad, {CrossroadState} from '@/models/crossroad';

export enum MutationName {
  ChangeToolbarState = 'ChangeToolbarState',
  BuildRoad = 'BuildRoad',
  DeleteRoad = 'DeleteRoad',
  BuildDistrict = 'BuildDistrict',
  DeleteDistrict = 'DeleteDistrict',
  SaveState = 'SaveState',
}

function filterDistricts(districts: District[], newRoads: Road[], oldRoads: Road[]): District[] {
  const districtToDelete = District.detectMissingRoads(
    districts,
    difference(oldRoads, newRoads)
  );

  return districts.filter(d => !districtToDelete.includes(d));
}

export const mutations: MutationTree<RootState> = {
  [MutationName.ChangeToolbarState]: (state, type: ButtonType) => {
    state.toolbarState = type;
    saveState(state);
  },
  [MutationName.BuildRoad]: (state, path: Path) => {
    const oldRoads = state.roads;
    const newRoads = Road.recalculateNetwork(path, [...state.roads]);

    state.districts = filterDistricts(state.districts, newRoads, oldRoads);
    state.roads = newRoads;
    state.crossroads = Crossroad.recalculateCrossroads(newRoads, state.crossroads);

    saveState(state);
  },
  [MutationName.DeleteRoad]: (state, road: Road) => {
    const oldRoads = state.roads;
    const newRoads = Road.deleteRoad(road, [...state.roads]);

    state.districts = filterDistricts(state.districts, newRoads, oldRoads);
    state.roads = newRoads;
    state.crossroads = Crossroad.recalculateCrossroads(newRoads, state.crossroads);

    saveState(state);
  },
  [MutationName.BuildDistrict]: (state, district: District) => {
    state.districts.push(district);
    saveState(state);
  },
  [MutationName.DeleteDistrict]: (state, district: District) => {
    state.districts.splice(state.districts.indexOf(district), 1);
    saveState(state);
  },
  [MutationName.SaveState]: (state) => {
    saveState(state);
  },
};
