import Road from '@/models/road';
import {comparePoints, Path, Point, pointWeight} from '@/models/geometry';
import {POINT_DISTANCE} from '@/config';

export interface DistrictState {
  roads: Road[];
  type: DistrictType;
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
      return new District({roads, type: DistrictType.Wasteland});
    } else {
      return undefined;
    }
  }

  public roads: Road[];
  public points: Point[];
  public type: DistrictType;
  public selected: boolean = false;

  constructor(state: DistrictState) {
    this.roads = state.roads;
    this.type = state.type || DistrictType.Wasteland;
    this.points = this.orderedPoints(this.roads);
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
