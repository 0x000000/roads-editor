import {RootState} from '@/store/index';
import {BUILD_VERSION} from '@/config';
import City, {CityState} from '@/models/city';
import {ButtonType} from '@/models/inputs';
import {Dot, DotState} from '@/models/dot';

const PREFIX = 'RDE_';
const UP_TO_DATE_KEY = `${PREFIX}${BUILD_VERSION}`;

interface SerializationState {
  city: CityState;
  toolbarState: string;
  dots: DotState[];
}

function cleanUpState() {
  for (let i = 0; i < localStorage.length; i++) {
    const key: string = localStorage.key(i) as string;
    if (key.indexOf(PREFIX) === 0 && key !== UP_TO_DATE_KEY) {
      localStorage.removeItem(key);
    }
  }
}

function serializeState(state: RootState): string {
  const serializationState: SerializationState = {
    city: state.city,
    toolbarState: state.toolbarState,
    dots: state.dots,
  };

  return JSON.stringify(state);
}

function deserializeState(rawState: string): RootState {
  const state: SerializationState = JSON.parse(rawState);

  return {
    city: new City(state.city),
    toolbarState: state.toolbarState as ButtonType,
    dots: Dot.restoreArray(state.dots),
  };
}

function initState(): RootState {
  return {
    city: new City({name: 'Test City'}),
    toolbarState: ButtonType.SelectRoad,
    dots: Dot.buildArray(),
  };
}

export function loadState(): RootState {
  cleanUpState();

  const rawState: string | null = localStorage.getItem(UP_TO_DATE_KEY);
  if (rawState) {
    return deserializeState(rawState);
  } else {
    return initState();
  }
}

export function saveState(state: RootState) {
  cleanUpState();

  localStorage.setItem(UP_TO_DATE_KEY, serializeState(state));
}
