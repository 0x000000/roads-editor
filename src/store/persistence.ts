import {RootState} from '@/store/store';
import {BUILD_VERSION, FIELD_HEIGHT, FIELD_WIDTH} from '@/config';
import City, {CityState} from '@/models/city';
import {ButtonType} from '@/models/inputs';
import Road, {RoadState, RoadType} from '@/models/road';

const PREFIX = 'RDE_';
const UP_TO_DATE_KEY = `${PREFIX}${BUILD_VERSION}`;

interface SerializationState {
  city: CityState;
  toolbarState: string;
  roads: RoadState[];
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
    roads: state.roads,
  };

  return JSON.stringify(state);
}

function deserializeState(rawState: string): RootState {
  const state: SerializationState = JSON.parse(rawState);

  return {
    city: new City(state.city),
    toolbarState: state.toolbarState as ButtonType,
    roads: (state.roads as RoadState[]).map(s => new Road(s)),
  };
}

function initState(): RootState {
  const roads: Road[] = [
    new Road({
      type: RoadType.Border, name: '',
      path: {start: {x: 0, y: 0}, end: {x: FIELD_WIDTH - 1, y: 0}},
    }),
    new Road({
      type: RoadType.Border, name: '',
      path: {start: {x: 0, y: 0}, end: {x: 0, y: FIELD_HEIGHT - 1}},
    }),
    new Road({
      type: RoadType.Border, name: '',
      path: {start: {x: FIELD_WIDTH - 1, y: 0}, end: {x: FIELD_WIDTH - 1, y: FIELD_HEIGHT - 1}},
    }),
    new Road({
      type: RoadType.Border, name: '',
      path: {start: {x: 0, y: FIELD_HEIGHT - 1}, end: {x: FIELD_WIDTH - 1, y: FIELD_HEIGHT - 1}},
    }),
  ];

  return {
    city: new City({name: 'Test City'}),
    toolbarState: ButtonType.BuildRoad,
    roads,
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
