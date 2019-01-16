import {Point, pointWeight} from '@/models/geometry';
import Road from '@/models/road';
import {Dot} from '@/models/dot';
import {DistrictState} from '@/models/district';

// NW N NE
// W  +  E
// SW S SE
export type Directions = 'N' | 'S' | 'W' | 'E' | 'NW' | 'NE' | 'SW' | 'SE';

export interface Connection {
  road: Road;
  direction: Directions;
}

export interface CrossroadState {
  position: Point;
  connections: Connection[];
}

export default class Crossroad implements CrossroadState {
  public static recalculateCrossroads(newRoads: Road[], oldCrossroads: Crossroad[]): Crossroad[] {
    const newCrossroads: number[] = [];
    const crossroadsHash: Map<number, Crossroad> = new Map();
    oldCrossroads.forEach(c => {
      c.connections = [];
      crossroadsHash.set(pointWeight(c.position), c);
    });

    newRoads.forEach(road => {
      [road.path.start, road.path.end].forEach(path => {
        const pathKey = pointWeight(path);
        const detectedCross = crossroadsHash.get(pathKey);

        if (detectedCross) {
          if (!detectedCross.hasRoad(road)) {
            detectedCross.addConnection(road);
          }

        } else {
          const newCross = new Crossroad({
            position: path,
            connections: [],
          });

          newCross.addConnection(road);
          crossroadsHash.set(pathKey, newCross);
        }

        if (!newCrossroads.includes(pathKey)) {
          newCrossroads.push(pathKey);
        }
      });
    });

    console.log(newCrossroads);
    console.log(crossroadsHash);

    // filter only crossroads with 2+ connected roads
    return newCrossroads.map(key => {
      const cross = crossroadsHash.get(key) as Crossroad;
      if (cross.connections.length > 1) {
        return cross;
      } else {
        return undefined;
      }
    }).filter(c => c !== undefined) as Crossroad[];
  }


  public static restoreLinks(crossroadsState: CrossroadState[], roads: Road[]): Crossroad[] {
    return crossroadsState.map(state => {
      const cross = new Crossroad(state);
      cross.connections = cross.connections.map(connection => {
        return {
          road: roads.find(r => r.id === connection.road.id) as Road,
          direction: connection.direction,
        };
      });

      return cross;
    });
  }

  public connections: Connection[];
  public position: Point;
  public dot: Dot;

  constructor(state: CrossroadState) {
    this.connections = state.connections;
    this.position = state.position;
    this.dot = new Dot(this.position);
  }

  public addConnection(road: Road) {
    this.connections.push({road, direction: 'N'});
  }

  public hasRoad(road: Road): boolean {
    return this.connections.map(c => c.road).includes(road);
  }
}
