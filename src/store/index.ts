import Vue from 'vue';
import Vuex, {StoreOptions} from 'vuex';
import City from '@/models/city';
import {loadState} from '@/store/persistence';
import {ButtonType} from '@/models/inputs';
import {mutations} from '@/mutations';
import {Dot} from '@/models/dot';

Vue.use(Vuex);

export interface RootState {
  city: City;
  toolbarState: ButtonType;
  dots: Dot[];
}

const store: StoreOptions<RootState> = {
  state: loadState(),
  mutations,
};

export default new Vuex.Store<RootState>(store);
