import {RootState} from '@/store/store';
import {BUILD_VERSION, FIELD_HEIGHT, FIELD_WIDTH} from '@/config';
import City, {CityState} from '@/models/city';
import {ButtonType} from '@/models/inputs';
import Road, {RoadState, RoadType} from '@/models/road';
import Settings, {SettingsState} from '@/models/settings';
import District, {DistrictState} from '@/models/district';
import Crossroad, {CrossroadState} from '@/models/crossroad';

const PREFIX = 'RDE_';
const UP_TO_DATE_KEY = `${PREFIX}${BUILD_VERSION}`;

interface SerializationState {
  buildVersion: number,
  field: {width: number, height: number},
  city: CityState;
  toolbarState: string;
  roads: RoadState[];
  settings: SettingsState;
  districts: DistrictState[];
  crossroads: CrossroadState[];
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
    buildVersion: BUILD_VERSION,
    field: {width: FIELD_WIDTH, height: FIELD_HEIGHT},
    city: state.city,
    toolbarState: state.toolbarState,
    roads: state.roads,
    settings: state.settings,
    districts: state.districts,
    crossroads: state.crossroads,
  };

  return JSON.stringify(serializationState);
}

function deserializeState(rawState: string): RootState {
  const state: SerializationState = JSON.parse(rawState);

  if (state.buildVersion !== BUILD_VERSION) {
    console.error(`Current BV is ${BUILD_VERSION}, but file BV is ${state.buildVersion}`);
    return initState();
  }

  const roads = (state.roads as RoadState[]).map(s => new Road(s));
  const districts = District.restoreLinks(state.districts as DistrictState[], roads);
  const crossroads = Crossroad.restoreLinks(state.crossroads as CrossroadState[], roads);

  return {
    city: new City(state.city),
    toolbarState: state.toolbarState as ButtonType,
    roads,
    settings: Settings.getInstance().initialize(state.settings),
    districts,
    crossroads,
  };
}

function initState(): RootState {
  const settings: Settings = Settings.getInstance().initialize({
    roadId: 0,
  });

  const roads: Road[] = [
    Road.build({start: {x: 0, y: 0}, end: {x: FIELD_WIDTH - 1, y: 0}}, RoadType.Border),
    Road.build({start: {x: 0, y: 0}, end: {x: 0, y: FIELD_HEIGHT - 1}}, RoadType.Border),
    Road.build({start: {x: FIELD_WIDTH - 1, y: 0}, end: {x: FIELD_WIDTH - 1, y: FIELD_HEIGHT - 1}}, RoadType.Border),
    Road.build({start: {x: 0, y: FIELD_HEIGHT - 1}, end: {x: FIELD_WIDTH - 1, y: FIELD_HEIGHT - 1}}, RoadType.Border),
  ];

  const districts: District[] = [];
  const crossroads = Crossroad.recalculateCrossroads(roads, []);

  return {
    city: new City({name: 'Test City'}),
    toolbarState: ButtonType.BuildRoad,
    roads,
    settings,
    districts,
    crossroads,
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
