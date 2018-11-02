import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import City from '@/models/city';
import {loadState} from '@/store/persistence';

Vue.use(Vuex);

export interface RootState {
  city: City;
}

const store: StoreOptions<RootState> = {
  state: loadState(),
  mutations: {},
};

export default new Vuex.Store<RootState>(store);
