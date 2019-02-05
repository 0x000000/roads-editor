import {belongsTo, comparePoints, normalizePath, Path, Point} from '@/models/geometry';
import {POINT_DISTANCE} from '@/config';
import {intersectionPoint, mergePaths, pointWeight} from './geometry';
import Settings from '@/models/settings';

export enum RoadType {
  Highway = 'Highway',
  Street = 'Street',
  WaterWay = 'WaterWay',
}

export interface RoadState {
  id: number;
  type: RoadType;
  path: Path;
}

enum IntersectionResult {
  Intersected,
  Impossible,
  None,
}

interface Intersection {
  road: Road;
  point: Point;
  result: IntersectionResult;
}

const EMPTY_POINT: Point = {x: Infinity, y: Infinity};

export default class Road implements RoadState {
  public id: number;
  public type: RoadType;
  public path: Path;
  public selected: boolean = false;

  public static recalculateNetwork(newPath: Path, oldRoads: Road[]): Road[] {
    newPath = normalizePath(newPath);

    const intersections: Intersection[] = oldRoads.map(road => road.intersectWith(newPath));
    if (intersections.some(i => i.result === IntersectionResult.Impossible)) {
      return oldRoads; // crossing outside of the dot position
    }

    const newRoads = new Set<Road>();
    const touchedRoads = new Set<Road>();

    const intersectionPoints: Map<number, Point> = new Map();
    intersections.forEach(i => {
      if (i.result === IntersectionResult.Intersected) {
        if (
          comparePoints(i.point, i.road.path.start) === 0 ||
          comparePoints(i.point, i.road.path.end) === 0
        ) {
          newRoads.add(i.road);
          touchedRoads.add(i.road); // this road doesn't directly modified but needs to be changed anyway
        } else {
          i.road.splitBy(i.point).forEach(r => newRoads.add(r));
        }

        intersectionPoints.set(pointWeight(i.point), i.point);
      } else {
        newRoads.add(i.road);
      }
    });

    intersectionPoints.set(pointWeight(newPath.start), newPath.start);
    intersectionPoints.set(pointWeight(newPath.end), newPath.end);

    const points = [...intersectionPoints.values()].sort(comparePoints);
    for (let step = 0; step < points.length - 1; step++) {
      newRoads.add(Road.build({start: points[step], end: points[step + 1]}, RoadType.Street));
    }

    const completedRoads: Road[] = [...newRoads.values()].map(road => {
      if (touchedRoads.has(road)) { // change id to refresh all refs for this road
        return road.clone();
      } else {
        return road;
      }
    });

    return this.rejoinLines(completedRoads);
  }

  public static rejoinLines(oldRoads: Road[]): Road[] {
    const roads: Map<number, Road[]> = new Map();
    const pointsSize: Map<number, number> = new Map();

    oldRoads.forEach(road => {
      const startKey: number = pointWeight(road.path.start);
      const endKey: number = pointWeight(road.path.end);

      roads.set(startKey, (roads.get(startKey) || []).concat(road));
      roads.set(endKey, (roads.get(endKey) || []).concat(road));

      pointsSize.set(startKey, (pointsSize.get(startKey) || 0) + 1);
      pointsSize.set(endKey, (pointsSize.get(endKey) || 0) + 1);
    });

    const roadsToMerge: Road[][] = [];
    [...pointsSize.keys()].filter(key => pointsSize.get(key) === 2).forEach(key => {
      roadsToMerge.push(roads.get(key) as Road[]);
    });

    roadsToMerge.forEach(roadsPair => {
      const [road1, road2] = roadsPair;
      const point = intersectionPoint(road1.path, road2.path);
      if (Number.isNaN(point.x) && Number.isNaN(point.y)) {
        oldRoads.splice(oldRoads.indexOf(road1), 1);
        oldRoads.splice(oldRoads.indexOf(road2), 1);
        oldRoads.push(road1.mergeWith(road2));
      }
    });

    return oldRoads;
  }

  public static deleteRoad(road: Road, roads: Road[]): Road[] {
    roads.splice(roads.indexOf(road), 1);
    return this.rejoinLines(roads);
  }

  public static build(path: Path, type: RoadType): Road {
    const id = Settings.getInstance().nextRoadId;
    return new Road({path, type, id});
  }

  constructor(state: RoadState) {
    this.id = state.id;
    this.type = state.type;
    this.path = normalizePath(state.path);
  }

  public get classes(): string {
    return [
      `type-${this.type.toString().toLowerCase()}`,
      this.selected ? 'selected' : '',
    ].join(' ');
  }

  public get d() {
    const fromX: number = (this.path.start.x + 1) * POINT_DISTANCE;
    const fromY: number = (this.path.start.y + 1) * POINT_DISTANCE;
    const toX: number = (this.path.end.x + 1) * POINT_DISTANCE;
    const toY: number = (this.path.end.y + 1) * POINT_DISTANCE;

    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }

  private splitBy(point: Point): Road[] {
    return [
      Road.build({start: this.path.start, end: point}, this.type),
      Road.build({start: point, end: this.path.end}, this.type),
    ];
  }

  private mergeWith(road: Road): Road {
    return Road.build(mergePaths(this.path, road.path), this.type);
  }

  private intersectWith(otherPath: Path): Intersection {
    const point = intersectionPoint(this.path, otherPath);

    if (Number.isNaN(point.x) || Number.isNaN(point.y)) {
      return {road: this, point: EMPTY_POINT, result: IntersectionResult.None};
    }

    if (belongsTo(point, otherPath) && belongsTo(point, this.path)) {
      if (point.x % 1 > 0 || point.y % 1 > 0) { // crossing outside of the dot position
        return {road: this, point: EMPTY_POINT, result: IntersectionResult.Impossible};
      } else {
        return {road: this, point, result: IntersectionResult.Intersected};
      }
    } else {
      return {road: this, point: EMPTY_POINT, result: IntersectionResult.None};
    }
  }

  private clone() {
    return Road.build(this.path, this.type);
  }
}
