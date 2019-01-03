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

export function pointWeight(point: Point): number {
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
  return dotProduct <= squaredLen;
}

export function intersectionPoint(path1: Path, path2: Path): Point {
  const [x1, y1, x2, y2] = [path1.start.x, path1.start.y, path1.end.x, path1.end.y];
  const [x3, y3, x4, y4] = [path2.start.x, path2.start.y, path2.end.x, path2.end.y];

  const sub = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / sub;
  const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / sub;

  return {x, y};
}

export function mergePaths(path1: Path, path2: Path): Path {
  path1 = normalizePath(path1);
  path2 = normalizePath(path2);

  const start = pointWeight(path1.start) <= pointWeight(path2.start) ? path1.start : path2.start;
  const end = pointWeight(path1.end) >= pointWeight(path2.end) ? path1.end : path2.end;

  return {start, end};
}