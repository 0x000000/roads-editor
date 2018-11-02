import {RootState} from '@/store/index';
import {BUILD_VERSION} from '@/config';
import City, {CityState} from '@/models/city';

const PREFIX = 'RDE_';
const UP_TO_DATE_KEY = `${PREFIX}${BUILD_VERSION}`;

export interface Persistent<State> {
  load(rawState: State): void;
  save(): State;
}

interface SerializationState {
  city: CityState,
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
    city: state.city.save(),
  };

  return JSON.stringify(serializationState);
}

function deserializeState(rawState: string): RootState {
  const state: SerializationState = JSON.parse(rawState);

  return {
    city: new City(state.city),
  };
}

function initState(): RootState {
  return {
    city: new City({name: 'Test City'}),
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
