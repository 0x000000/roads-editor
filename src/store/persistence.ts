import {RootState} from '@/store/store';
import {BUILD_VERSION, FIELD_HEIGHT, FIELD_WIDTH} from '@/config';
import City, {CityState} from '@/models/city';
import {ButtonType} from '@/models/inputs';
import Road, {RoadState, RoadType} from '@/models/road';
import Settings, {SettingsState} from '@/models/settings';
import District, {NormalizedDistrictState} from '@/models/district';
import Crossroad, {NormalizedCrossroadState} from '@/models/crossroad';
import {IBuildingVariant} from '@/models/building';

const PREFIX = 'RDE_';
const UP_TO_DATE_KEY = `${PREFIX}${BUILD_VERSION}`;

interface SerializationState {
  buildVersion: number;
  field: {width: number, height: number};
  city: CityState;
  toolbarState: string;
  roads: RoadState[];
  settings: SettingsState;
  districts: NormalizedDistrictState[];
  crossroads: NormalizedCrossroadState[];
  buildingVariants: IBuildingVariant[];
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
    districts: District.normalizeLinks(state.districts),
    crossroads: Crossroad.normalizeLinks(state.crossroads),
    buildingVariants: state.buildingVariants,
  };

  return JSON.stringify(serializationState);
}

function deserializeState(rawState: string): RootState {
  const state: SerializationState = JSON.parse(rawState);

  if (state.buildVersion !== BUILD_VERSION) {
    alert(`Current BV is ${BUILD_VERSION}, but file BV is ${state.buildVersion}`);
    return initState();
  }

  const roads = (state.roads as RoadState[]).map(s => new Road(s));
  const districts = District.restoreLinks(state.districts as NormalizedDistrictState[], roads);
  const crossroads = Crossroad.restoreLinks(state.crossroads as NormalizedCrossroadState[], roads);

  return {
    city: new City(state.city),
    toolbarState: state.toolbarState as ButtonType,
    roads,
    settings: Settings.getInstance().initialize(state.settings),
    districts,
    crossroads,
    buildingVariants: state.buildingVariants,
  };
}

function initState(): RootState {
  const settings: Settings = Settings.getInstance().initialize({
    roadId: 0,
    districtId: 0,
    blockId: 0,
    buildingId: 0,
  });

  return {
    city: new City({name: 'Test City'}),
    toolbarState: ButtonType.BuildRoad,
    roads: [],
    settings,
    districts: [],
    crossroads: [],
    buildingVariants: [],
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
