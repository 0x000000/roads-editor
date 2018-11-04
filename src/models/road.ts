import {belongsTo, comparePoints, normalizePath, Path, Point} from '@/models/geometry';
import {POINT_DISTANCE} from '@/config';

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
    const intersectionPoints: Set<Point> = new Set();
    intersections.forEach(i => {
      if (i.result === IntersectionResult.Intersected) {
        newRoads.push(...i.road.splitBy(i.point));
        intersectionPoints.add(i.point);
      } else {
        newRoads.push(i.road);
      }
    });

    intersectionPoints.add(newPath.start);
    intersectionPoints.add(newPath.end);

    const points = [...intersectionPoints].sort(comparePoints);
    for (let step = 0; step < points.length - 1; step++) {
      newRoads.push(new Road({path: {start: points[step], end: points[step + 1]}, name: '', type: RoadType.Street}));
    }

    return newRoads;
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

  private intersectWith(otherPath: Path): Intersection {
    const [x1, y1, x2, y2] = [this.path.start.x, this.path.start.y, this.path.end.x, this.path.end.y];
    const [x3, y3, x4, y4] = [otherPath.start.x, otherPath.start.y, otherPath.end.x, otherPath.end.y];

    const sub = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / sub;
    const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / sub;
    if (Number.isNaN(x) || Number.isNaN(y)) {
      return {road: this, point: EMPTY_POINT, result: IntersectionResult.None};
    }

    if (x % 1 > 0 || y % 1 > 0) { // crossing outside of the dot position
      return {road: this, point: EMPTY_POINT, result: IntersectionResult.Impossible};
    }

    if (belongsTo({x, y}, otherPath) && belongsTo({x, y}, this.path)) {
      return {road: this, point: {x, y}, result: IntersectionResult.Intersected};
    } else {
      return {road: this, point: EMPTY_POINT, result: IntersectionResult.None};
    }
  }
}
