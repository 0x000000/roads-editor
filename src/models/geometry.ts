import {FIELD_WIDTH, FIELD_HEIGHT} from '@/config';

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

export enum LineDirection {
  Vertical = 1,
  Horizontal = 2,
  Diagonal = 3,
  DiagonalReverse = 4,
}

export function pointWeight(point: Point): number {
  return (point.y * FIELD_WIDTH) + point.x;
}

export function pathWeight(path: Path): string {
  return `${pointWeight(path.start)},${pointWeight(path.end)}`;
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

export function detectDirection(path: Path): LineDirection {
  const start: Point = path.start;
  const end: Point = path.end;

  switch (true) {
    case start.x === end.x: return LineDirection.Vertical;
    case start.y === end.y: return LineDirection.Horizontal;
    case start.x < end.x:   return LineDirection.Diagonal;
    default:                return LineDirection.DiagonalReverse;
  }
}

/* tslint:disable */
export function pointsFromPath(path: Path): Point[] {
  path = normalizePath(path);
  const points: Point[] = [];

  const start: Point = path.start;
  const end: Point = path.end;

  switch (detectDirection(path)) {
    case LineDirection.Vertical: { // |
      const offset = Math.abs(end.y - start.y);
      for (let i = 0; i <= offset; i++) {
        points.push({x: start.x, y: start.y + i});
      }
    }
    break;

    case LineDirection.Horizontal: { // -
      const offset = Math.abs(end.x - start.x);
      for (let i = 0; i <= offset; i++) {
        points.push({x: start.x + i, y: start.y});
      }
    }
    break;

    case LineDirection.Diagonal: { // \
      const offset = Math.abs(end.x - start.x);
      for (let i = 0; i <= offset; i++) {
        points.push({x: start.x + i, y: start.y + i});
      }
    }
    break;

    default: { // /
      const offset = Math.abs(start.x - end.x);
      for (let i = 0; i <= offset; i++) {
        points.push({x: start.x - i, y: start.y + i});
      }
    }
  }

  return points;
}
/* tslint:enable */


export function createPathsFromPoints(points: Point[], paths: Path[]): Path[] {
  const start: Point | undefined = points.shift();
  const end: Point | undefined = points[0];

  if (start !== undefined && end !== undefined) {
    paths.push(normalizePath({start, end}));
    return createPathsFromPoints(points, paths);
  }

  return paths;
}

function middlePoint(path: Path): Point {
  if (path.start.x === path.end.x) {
    return {
      x: path.start.x,
      y: path.start.y + (Math.abs(path.start.y - path.end.y) / 2),
    };
  } else {
    return {
      x: path.start.x + (Math.abs(path.start.x - path.end.x) / 2),
      y: path.start.y,
    };
  }
}

function pointInsidePolygon(point: Point, paths: Path[]): boolean {
  const intersections: boolean[] = [false, false, false, false];
  const rays: Path[] = [
    {start: point, end: {x: FIELD_WIDTH + 1, y: point.y}},
    {start: {x: -1, y: point.y}, end: point},
    {start: {x: point.x, y: -1}, end: point},
    {start: point, end: {x: point.x, y: FIELD_HEIGHT + 1}},
  ];

  for (const polygonPath of paths) {
    for (let j = 0; j < rays.length; j++) {
      const intersection = intersectionPoint(polygonPath, rays[j]);
      const possibleCrossing = belongsTo(intersection, polygonPath) &&
                               belongsTo(intersection, rays[j]);
      if (possibleCrossing) {
        intersections[j] = true;
      }
    }
  }

  return intersections.every(i => i);
}

export function pathInsidePolygon(path: Path, paths: Path[]): boolean {
  return pointInsidePolygon(middlePoint(path), paths) &&
         pointInsidePolygon(path.start, paths) &&
         pointInsidePolygon(path.end, paths);
}
