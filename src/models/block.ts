import {
  createPathsFromPoints,
  orderPointsByRoads,
  Path,
  pathInsidePolygon,
  pathWeight,
  Point,
  pointsFromPath,
  pointWeight
} from '@/models/geometry';
import District from '@/models/district';
import {cycledPairs} from '@/models/utils';
import Settings from '@/models/settings';
import {POINT_DISTANCE} from '@/config';
import {Building, ISector, Sector} from '@/models/building';
import RuralLayoutsJson from '@/layouts/rural_residential.json';

export enum BlockShape {
  Square = 1,
  TriangleTopLeft = 2,
  TriangleTopRight = 3,
  TriangleBottomLeft = 4,
  TriangleBottomRight = 5,
}

export enum Density {
  Lowest = 1, // Rural
  Low,    // Suburban
  Medium, // Urban
  High,   // UrbanCenter
  Highest, // UrbanCore
}

export enum Wealth {
  Poor = 1,
  Low = 2,
  Mid = 3,
  High = 4,
}

export enum BlockType {
  Residential = 1,
  Commercial = 2,
  Industrial = 3,
  Forest = 4,
  Park = 5,
  Agricultural = 6,
  Water = 7,
  Wasteland = 8,
}

export enum BlockPattern {
  Chaotic,
}

interface IBlockInfo {
  shape: BlockShape;
  type: string;
  density: string;
  position: number;
  postfix: string;
}

export interface ILayout {
  block: IBlockInfo;
  sectors: ISector[];
}

let ID = 0;

export class Layout implements ILayout {
  public id: number;
  public block: IBlockInfo;
  public sectors: ISector[];

  constructor(state: ILayout) {
    this.block = state.block;
    this.sectors = Sector.parse(state.sectors);
    this.id = ID++;
  }

  get name(): string {
    return `${this.block.type}_${this.block.density}_${this.block.position}${this.block.postfix}`;
  }
}

export interface BlockState {
  readonly id: number;
  readonly position: Point;
  readonly paths: Path[];
  readonly shape: BlockShape;
  type: BlockType;
  density: Density;
  wealth: Wealth;
  buildings: Building[];
  layoutId: number | undefined;
}

export default class Block implements BlockState {
  public id: number;
  public position: Point;
  public paths: Path[];
  public shape: BlockShape;
  public type: BlockType;
  public density: Density;
  public wealth: Wealth;
  public buildings: Building[];
  public layoutId: number | undefined;

  public selected: boolean = false;
  private _layout: Layout | undefined;

  constructor(state: BlockState) {
    this.id = state.id;
    this.position = state.position;
    this.paths = state.paths;
    this.shape = state.shape;
    this.type = state.type;
    this.density = state.density;
    this.wealth = state.wealth;
    this.buildings = state.buildings;
    this.layoutId = state.layoutId;
  }

  public get layout(): Layout | undefined {
    if (this.layoutId !== undefined && this._layout === undefined) {
      this._layout = LAYOUTS.find(l => l.id === this.layoutId);
    }

    return this._layout;
  }

  public set layout(newLayout) {
    if (newLayout !== undefined) {
      this.layoutId = newLayout.id;
    } else {
      this.layoutId = undefined;
    }

    this._layout = newLayout;
  }


  public get classes(): string[] {
    return [
      `district-${this.type}`,
      this.selected ? 'selected' : '',
    ];
  }

  public get svgPoints(): string {
    const pointsCoordinates: string[] = [];

    for (const point of orderPointsByRoads(this.paths)) {
      const x = (point.x + 1) * POINT_DISTANCE;
      const y = (point.y + 1) * POINT_DISTANCE;

      pointsCoordinates.push(`${x},${y}`);
    }

    return pointsCoordinates.join(' ');
  }
}

function findExistingPaths(district: District): Map<string, Path> {
  const paths: Map<string, Path> = new Map();

  district.roads.forEach(road => {
    const points = pointsFromPath(road.path);
    createPathsFromPoints(points, []).map(path => paths.set(pathWeight(path), path));
  });

  return paths;
}

function findPossibleInternalPaths(paths: Map<string, Path>, polygon: Path[]): Path[] {
  paths.forEach((path, key) => {
    paths.forEach((otherPath, otherKey) => {
      if (key !== otherKey) {
        let newPaths: Path[] = [];
        if (path.start.x === otherPath.start.x || path.start.y === otherPath.start.y) {
          newPaths = createPathsFromPoints(pointsFromPath({start: path.start, end: otherPath.start}), []);
        } else if (path.start.x === otherPath.end.x || path.start.y === otherPath.end.y) {
          newPaths = createPathsFromPoints(pointsFromPath({start: path.start, end: otherPath.end}), []);
        }

        newPaths.map(newPath => {
          const newKey = pathWeight(newPath);
          if (paths.has(newKey)) {
            return;
          }

          if (pathInsidePolygon(newPath, polygon)) {
            paths.set(newKey, newPath);
          }
        });
      }
    });
  });

  return [...paths.values()];
}

function fetchVertices(paths: Path[]): Map<number, Point> {
  const points: Map<number, Point> = new Map();

  paths.forEach(path => {
    points.set(pointWeight(path.start), path.start);
    points.set(pointWeight(path.end), path.end);
  });

  return points;
}

function inPairs(points: number[]): number[][] {
  return cycledPairs<number>(points).map(pair => {
    return [pair.start, pair.end].sort((a, b) => a - b);
  });
}

function squarePattern(topLeftPoint: Point): number[][] {
  return inPairs([
    pointWeight(topLeftPoint),
    pointWeight({x: topLeftPoint.x + 1, y: topLeftPoint.y}),
    pointWeight({x: topLeftPoint.x + 1, y: topLeftPoint.y + 1}),
    pointWeight({x: topLeftPoint.x, y: topLeftPoint.y + 1}),
  ]);
}

function triangleTopLeftPattern(topLeftPoint: Point): number[][] {
  return inPairs([
    pointWeight(topLeftPoint),
    pointWeight({x: topLeftPoint.x + 1, y: topLeftPoint.y}),
    pointWeight({x: topLeftPoint.x, y: topLeftPoint.y + 1}),
  ]);
}

function triangleTopRightPattern(topLeftPoint: Point): number[][] {
  return inPairs([
    pointWeight(topLeftPoint),
    pointWeight({x: topLeftPoint.x + 1, y: topLeftPoint.y}),
    pointWeight({x: topLeftPoint.x + 1, y: topLeftPoint.y + 1}),
  ]);
}

function triangleBottomLeftPattern(topLeftPoint: Point): number[][] {
  return inPairs([
    pointWeight(topLeftPoint),
    pointWeight({x: topLeftPoint.x + 1, y: topLeftPoint.y + 1}),
    pointWeight({x: topLeftPoint.x, y: topLeftPoint.y + 1}),
  ]);
}

function triangleBottomRightPattern(topLeftPoint: Point): number[][] {
  return inPairs([
    pointWeight(topLeftPoint),
    pointWeight({x: topLeftPoint.x, y: topLeftPoint.y + 1}),
    pointWeight({x: topLeftPoint.x - 1, y: topLeftPoint.y + 1}),
  ]);
}

function detectBlock(vertices: Map<number, Point>, paths: Path[]): Block[] {
  const blocks: Block[] = [];
  const sortedWeights = [...vertices.keys()].sort((a, b) => a - b);
  const pathWeights: number[][] = paths.map(path => [pointWeight(path.start), pointWeight(path.end)]);

  const shapes = [
    {shape: BlockShape.TriangleBottomRight, pattern: triangleBottomRightPattern, stop: false},
    {shape: BlockShape.TriangleTopLeft, pattern: triangleTopLeftPattern, stop: true},
    {shape: BlockShape.TriangleTopRight, pattern: triangleTopRightPattern, stop: true},
    {shape: BlockShape.TriangleBottomLeft, pattern: triangleBottomLeftPattern, stop: true},
    {shape: BlockShape.Square, pattern: squarePattern, stop: true},
  ];

  sortedWeights.forEach(pWeight => {
    const topPoint = vertices.get(pWeight) as Point;

    for (const {shape, pattern, stop} of shapes) {
      const points = pattern(topPoint);

      const allPointsFound = points.every(pair => !!pathWeights.find(pp => pp[0] === pair[0] && pp[1] === pair[1]));
      if (allPointsFound) {
        blocks.push(new Block({
          id: Settings.getInstance().nextBlockId,
          position: topPoint,
          type: BlockType.Wasteland,
          shape,
          paths: points.map(pair => {
            return ({start: vertices.get(pair[0]) as Point, end: vertices.get(pair[1]) as Point});
          }),
          density: Density.Lowest,
          wealth: Wealth.Poor,
          buildings: [],
          layoutId: undefined,
        }));

        if (stop) {
          break;
        }
      }
    }
  });

  return blocks;
}

export function detectBlocks(district: District): Block[] {
  const polygon = district.roads.map(r => r.path);

  const paths = findPossibleInternalPaths(findExistingPaths(district), polygon);
  const vertices = fetchVertices(paths);
  return detectBlock(vertices, paths);
}

export var LAYOUTS: Layout[] = [];
LAYOUTS = LAYOUTS.concat(
  (RuralLayoutsJson as ILayout[]).map(l => new Layout(l))
);

