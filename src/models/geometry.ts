import {FIELD_HEIGHT, FIELD_WIDTH} from '@/config';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Rect {
  readonly width: number;
  readonly height: number;
}

export interface Path {
  readonly start: Point;
  readonly end: Point;
}

function pointWeight(point: Point): number {
  return (point.y * FIELD_WIDTH) + point.x;
}

export function normalizePath(path: Path): Path {
  const from = pointWeight(path.start);
  const to = pointWeight(path.end);

  if (from > to) { // make sure that @from is closer to 0,0 than @to
    return {start: {x: path.end.x, y: path.end.y}, end: {x: path.start.x, y: path.start.y}};
  } else {
    return {start: {x: path.start.x, y: path.start.y}, end: {x: path.end.x, y: path.end.y}};
  }
}

export function comparePoints(point1: Point, point2: Point): number {
  return pointWeight(point1) - pointWeight(point2);
}

export function belongsTo(point: Point, path: Path): boolean {
  const a = path.start;
  const b = path.end;
  const c = point;

  const crossProduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
  if (Math.abs(crossProduct) !== 0) {
    return false;
  }

  const dotProduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y) * (b.y - a.y);
  if (dotProduct < 0) {
    return false;
  }

  const squaredLen = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
  if (dotProduct > squaredLen) {
    return false;
  }

  return true;
}
