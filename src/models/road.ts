import {belongsTo, comparePoints, normalizePath, Path, Point} from '@/models/geometry';
import {POINT_DISTANCE} from '@/config';
import {intersectionPoint, mergePaths, pointWeight} from './geometry';

export enum RoadType {
  Border = 'Border',
  Highway = 'Highway',
  Street = 'Street',
}

export interface RoadState {
  type: RoadType;
  name: string;
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
  public type: RoadType;
  public name: string;
  public path: Path;
  private selected: boolean = false;

  public static recalculateNetwork(newPath: Path, oldRoads: Road[]): Road[] {
    newPath = normalizePath(newPath);

    const intersections: Intersection[] = oldRoads.map(road => road.intersectWith(newPath));
    if (intersections.some(i => i.result === IntersectionResult.Impossible)) {
      return oldRoads; // crossing outside of the dot position
    }

    const newRoads: Road[] = [];
    const intersectionPoints: Map<number, Point> = new Map();
    intersections.forEach(i => {
      if (i.result === IntersectionResult.Intersected) {
        if (
          comparePoints(i.point, i.road.path.start) === 0 ||
          comparePoints(i.point, i.road.path.end) === 0
        ) {
          newRoads.push(i.road);
        } else {
          newRoads.push(...i.road.splitBy(i.point));
          intersectionPoints.set(pointWeight(i.point), i.point);
        }
      } else {
        newRoads.push(i.road);
      }
    });

    intersectionPoints.set(pointWeight(newPath.start), newPath.start);
    intersectionPoints.set(pointWeight(newPath.end), newPath.end);

    const points = [...intersectionPoints.values()].sort(comparePoints);
    for (let step = 0; step < points.length - 1; step++) {
      newRoads.push(new Road({path: {start: points[step], end: points[step + 1]}, name: '', type: RoadType.Street}));
    }

    return this.rejoinLines(newRoads);
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

  constructor(state: RoadState) {
    this.name = state.name;
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

  public select() {
    this.selected = true;
  }

  public deselect() {
    this.selected = false;
  }

  private splitBy(point: Point): Road[] {
    return [
      new Road({path: {start: this.path.start, end: point}, name: this.name, type: this.type}),
      new Road({path: {start: point, end: this.path.end}, name: this.name, type: this.type}),
    ];
  }

  private mergeWith(road: Road): Road {
    return new Road({path: mergePaths(this.path, road.path), name: this.name, type: this.type});
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
}
