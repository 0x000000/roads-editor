import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import City from '@/models/city';
import {loadState} from '@/store/persistence';
import {ButtonType} from '@/models/inputs';
import {mutations} from '@/mutations/mutations';
import Road from '@/models/road';

Vue.use(Vuex);

export interface RootState {
  city: City;
  toolbarState: ButtonType;
  roads: Road[];
}

const store: StoreOptions<RootState> = {
  state: loadState(),
  mutations,
};

export default new Vuex.Store<RootState>(store);
