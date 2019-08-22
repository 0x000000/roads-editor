import {
  Path,
  Point,
  createPathsFromPoints,
  pathInsidePolygon,
  pathWeight,
  pointsFromPath, pointWeight
} from '@/models/geometry';
import District from '@/models/district';
import {cycledPairs} from '@/models/utils';
import Settings from '@/models/settings';

export enum BlockShape {
  Square = 1,
  TriangleTopLeft = 2,
  TriangleTopRight = 3,
  TriangleBottomLeft = 4,
  TriangleBottomRight = 5,
}

export default interface Block {
  readonly id: number;
  readonly position: Point;
  readonly paths: Path[];
  readonly shape: BlockShape;
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
    pointWeight({x: topLeftPoint.x,     y: topLeftPoint.y + 1}),
  ]);
}

function triangleTopLeftPattern(topLeftPoint: Point): number[][] {
  return inPairs([
    pointWeight(topLeftPoint),
    pointWeight({x: topLeftPoint.x + 1, y: topLeftPoint.y}),
    pointWeight({x: topLeftPoint.x,     y: topLeftPoint.y + 1}),
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
    pointWeight({x: topLeftPoint.x,     y: topLeftPoint.y + 1}),
  ]);
}

function triangleBottomRightPattern(topLeftPoint: Point): number[][] {
  return inPairs([
    pointWeight(topLeftPoint),
    pointWeight({x: topLeftPoint.x,     y: topLeftPoint.y + 1}),
    pointWeight({x: topLeftPoint.x - 1, y: topLeftPoint.y + 1}),
  ]);
}

function detectBlock(vertices: Map<number, Point>, paths: Path[]): Block[] {
  const blocks: Block[] = [];
  const sortedWeights = [...vertices.keys()].sort((a, b) => a - b);
  const pathWeights: number[][] = paths.map(path => [pointWeight(path.start), pointWeight(path.end)]);

  const shapes = [
    {type: BlockShape.TriangleBottomRight, pattern: triangleBottomRightPattern, stop: false},
    {type: BlockShape.TriangleTopLeft, pattern: triangleTopLeftPattern, stop: true},
    {type: BlockShape.TriangleTopRight, pattern: triangleTopRightPattern, stop: true},
    {type: BlockShape.TriangleBottomLeft, pattern: triangleBottomLeftPattern, stop: true},
    {type: BlockShape.Square, pattern: squarePattern, stop: true},
  ];

  sortedWeights.forEach(pWeight => {
    const topPoint = vertices.get(pWeight) as Point;

    for (const {type, pattern, stop} of shapes) {
      const points = pattern(topPoint);

      const allPointsFound = points.every(pair => !!pathWeights.find(pp => pp[0] === pair[0] && pp[1] === pair[1]));
      if (allPointsFound) {
        blocks.push({
          id: Settings.getInstance().nextBlockId,
          position: topPoint,
          shape: type,
          paths: points.map(pair => {
            return ({start: vertices.get(pair[0]) as Point, end: vertices.get(pair[1])  as Point});
          }),
        });

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

