import {RootState} from '@/store/store';
import {MutationTree} from 'vuex';
import {ButtonType} from '@/models/inputs';
import {saveState} from '@/store/persistence';

export enum MutationName {
  ChangeToolbarState = 'ChangeToolbarState',
}

export const mutations: MutationTree<RootState> = {
  [MutationName.ChangeToolbarState]: (state, type: ButtonType) => {
    state.toolbarState = type;
    saveState(state);
  },
};
