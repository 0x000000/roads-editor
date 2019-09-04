import Road from '@/models/road';
import {
  Point,
  pointWeight,
  orderPointsByRoads
} from '@/models/geometry';
import {POINT_DISTANCE} from '@/config';
import Block, {detectBlocks} from '@/models/block';
import Settings from '@/models/settings';

export enum DistrictShape {
  Linear,
}

export interface DistrictState {
  readonly id: number;
  readonly roads: Road[];
  blocks: Block[];
  shape: DistrictShape;
}

export interface NormalizedDistrictState {
  readonly id: number;
  readonly roadIds: number[];
  blocks: Block[];
  shape: DistrictShape;
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
      const district = new District({
        id: Settings.getInstance().nextDistrictId,
        roads,
        blocks: [],
        shape: DistrictShape.Linear,
      });

      district.blocks = detectBlocks(district);
      return district;
    } else {
      return undefined;
    }
  }

  public static districtExists(roads: Road[], districts: District[]): boolean {
    const districtHash = roads.map(r => r.id).sort().join(',');
    return districts.some(d => d.hash === districtHash);
  }

  public static normalizeLinks(districts: DistrictState[]): NormalizedDistrictState[] {
    return districts.map(district => {
      return {
        id: district.id,
        roadIds: district.roads.map(r => r.id),
        blocks: district.blocks.map(b => new Block(b)),
        shape: district.shape,
      };
    });
  }

  public static restoreLinks(districts: NormalizedDistrictState[], roads: Road[]): District[] {
    return districts.map(state => {
      const linkedState: DistrictState = {
        id: state.id,
        roads: roads.filter(r => state.roadIds.includes(r.id)),
        blocks: state.blocks.map(b => new Block(b)),
        shape: state.shape,
      };

      return new District(linkedState);
    });
  }

  public static detectMissingRoads(districts: District[], missingRoads: Road[]): District[] {
    const affectedDistricts = new Set<District>();

    missingRoads.forEach(r => {
      districts.filter(d => d.hasRoad(r)).forEach(d => affectedDistricts.add(d));
    });

    return [...affectedDistricts.values()];
  }

  public id: number;
  public roads: Road[];
  public points: Point[];
  public shape: DistrictShape;

  public selected: boolean = false;
  public hash: string;
  public blocks: Block[];

  constructor(state: DistrictState) {
    this.id = state.id;
    this.roads = state.roads;
    this.points = orderPointsByRoads(this.roads.map(r => r.path));
    this.blocks = state.blocks;
    this.shape = state.shape;

    this.hash = this.roads.map(r => r.id).sort().join(',');
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

  public get classes(): string[] {
    return [
      `district-6`,
      this.selected ? 'selected' : '',
    ];
  }
}
