import Road from '@/models/road';
import {comparePoints, Path, Point, pointWeight} from '@/models/geometry';
import {POINT_DISTANCE} from '@/config';

export const RecommendedPopulationByDensity = {
  1: 5,
  2: 10,
  3: 20,
  4: 30,
  5: 40,
};

export type Density = 1 | 2 | 3 | 4 | 5;
export type Wealth  = 1 | 2 | 3 | 4 | 5;

export interface DistrictTier {
  density: Density;
  wealth: Wealth;
  maxPopulation: number;
}

export interface DistrictState {
  roads: Road[];
  type: DistrictType;
  t1: DistrictTier;
  t2: DistrictTier;
  t3: DistrictTier;
}

export enum DistrictType {
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Forest = 'Forest',
  Wasteland = 'Wasteland',
  Water = 'Water',
}


export default class District implements DistrictState {
  public static detectNewDistrict(roads: Road[]): District | undefined {
    const pointsPairs: Map<number, number> = new Map();

    roads.forEach(road => {
      const {start, end} = road.path;
      const startKey = pointWeight(start);
      const endKey = pointWeight(end);

      pointsPairs.set(startKey, (pointsPairs.get(startKey) || 0) + 1);
      pointsPairs.set(endKey, (pointsPairs.get(endKey) || 0) + 1);
    });

    const pointsEqualsRoads = pointsPairs.size === roads.length;
    const eachPointHasPair = [...pointsPairs.values()].every(v => v === 2);

    if (pointsEqualsRoads && eachPointHasPair) {
      return new District({
        roads,
        type: DistrictType.Wasteland,
        t1: {density: 1, wealth: 1, maxPopulation: 5},
        t2: {density: 1, wealth: 1, maxPopulation: 5},
        t3: {density: 1, wealth: 1, maxPopulation: 5},
      });
    } else {
      return undefined;
    }
  }

  public static districtExists(roads: Road[], districts: District[]): boolean {
    const districtId = roads.map(r => r.id).sort().join(',');
    return districts.some(d => d.id === districtId);
  }

  public static restoreLinks(districtsState: DistrictState[], roads: Road[]): District[] {
    return districtsState.map(state => {
      state.roads = state.roads.map(sr => {
        return roads.find(r => r.id === sr.id) as Road;
      });

      return new District(state);
    });
  }

  public static detectMissingRoads(districts: District[], missingRoads: Road[]): District[] {
    const affectedDistricts = new Set<District>();

    missingRoads.forEach(r => {
      districts.filter(d => d.hasRoad(r)).forEach(d => affectedDistricts.add(d));
    });

    return [...affectedDistricts.values()];
  }

  public roads: Road[];
  public points: Point[];
  public type: DistrictType;
  public t1: DistrictTier;
  public t2: DistrictTier;
  public t3: DistrictTier;

  public selected: boolean = false;
  public id: string;

  constructor(state: DistrictState) {
    this.roads = state.roads;
    this.type = state.type || DistrictType.Wasteland;
    this.points = this.orderedPoints(this.roads);
    this.t1 = state.t1;
    this.t2 = state.t2;
    this.t3 = state.t3;

    this.id = this.roads.map(r => r.id).sort().join(",");
  }

  public hasRoad(road: Road): boolean {
    return this.roads.includes(road);
  }

  public get svgPoints(): string {
    const pointsCoordinates: string[] = [];

    for (const point of this.points) {
      const x = (point.x + 1) * POINT_DISTANCE;
      const y = (point.y + 1) * POINT_DISTANCE;

      pointsCoordinates.push(`${x},${y}`);
    }

    return pointsCoordinates.join(' ');
  }

  public get classes(): string {
    return [
      `district-${this.type.toLowerCase()}`,
      this.selected ? 'selected' : '',
    ].join(' ');
  }

  private orderedPoints(roads: Road[]): Point[] {
    const sortedRoads: Road[] = [roads[0]];
    const lastPoint = roads[0].path.start;
    let nextPoint = roads[0].path.end;

    const points: Point[] = [nextPoint];

    while (comparePoints(nextPoint, lastPoint) !== 0) {
      let nextRoad: Road | undefined;
      roads.forEach(r => {
        if (sortedRoads.includes(r)) {
          return;
        }

        if (comparePoints(r.path.start, nextPoint) === 0) {
          nextPoint = r.path.end;
          points.push(nextPoint);

          nextRoad = r;
          return;
        }

        if (comparePoints(r.path.end, nextPoint) === 0) {
          nextPoint = r.path.start;
          points.push(nextPoint);

          nextRoad = r;
          return;
        }
      });

      if (nextRoad) {
        sortedRoads.push(nextRoad);
      }
    }

    return points;
  }
}
