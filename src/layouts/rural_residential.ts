import {Point} from '@/models/geometry';
import {BlockShape} from '@/models/block';
import {Sector} from '@/models/building';

export interface BuildingSlot {
  position: Point;
  pivot: Point;
  rotation: number;
  size: string;
  width: number;
  height: number;
}

interface Block {
  shape: BlockShape;
  type: string;
  density: string;
  position: number;
  postfix: string;
}

export interface IBlockImport {
  block: Block;
  sectors: Sector[];
}

let ID = 0;

export class BlockImport implements IBlockImport {
  public id: number;
  public block: Block;
  public sectors: Sector[];

  public static fromJson(states: IBlockImport[]): BlockImport[] {
    return states.map(state => new BlockImport(state));
  }

  constructor(state: IBlockImport) {
    this.block = state.block;
    this.sectors = Sector.parse(state.sectors);
    this.id = ID++;
  }

  get name(): string {
    return `${this.block.type}_${this.block.density}_${this.block.position}${this.block.postfix}`;
  }
}

/* tslint:disable */
export const RuralLayouts: BlockImport[] = BlockImport.fromJson(
  [{
    'block': {'shape': 1, 'type': 'Res', 'density': 'Low', 'position': 11, 'postfix': 'a'},
    'sectors': [{
      'id': 0,
      'slots': [{
        'id': 0,
        'relativePosition': {'x': 0, 'y': 0},
        'absolutePosition': {'x': 53, 'y': 53},
        'topLeftPosition': {'x': 39, 'y': 39},
        'rotation': 0
      }],
      'size': '1x1'
    }, {
      'id': 1,
      'slots': [{
        'id': 0,
        'relativePosition': {'x': 0, 'y': 0},
        'absolutePosition': {'x': 95, 'y': 53},
        'topLeftPosition': {'x': 81, 'y': 39},
        'rotation': 0
      }, {
        'id': 1,
        'relativePosition': {'x': 0, 'y': 1},
        'absolutePosition': {'x': 95, 'y': 81},
        'topLeftPosition': {'x': 81, 'y': 67},
        'rotation': 0
      }],
      'size': '1x2'
    }, {
      'id': 2,
      'slots': [{
        'id': 0,
        'relativePosition': {'x': 0, 'y': 0},
        'absolutePosition': {'x': 137, 'y': 53},
        'topLeftPosition': {'x': 123, 'y': 39},
        'rotation': 0
      }, {
        'id': 1,
        'relativePosition': {'x': 0, 'y': 1},
        'absolutePosition': {'x': 137, 'y': 81},
        'topLeftPosition': {'x': 123, 'y': 67},
        'rotation': 0
      }, {
        'id': 2,
        'relativePosition': {'x': 1, 'y': 0},
        'absolutePosition': {'x': 165, 'y': 53},
        'topLeftPosition': {'x': 151, 'y': 39},
        'rotation': 0
      }, {
        'id': 3,
        'relativePosition': {'x': 1, 'y': 1},
        'absolutePosition': {'x': 165, 'y': 81},
        'topLeftPosition': {'x': 151, 'y': 67},
        'rotation': 0
      }],
      'size': '2x2'
    }]
  }]
);
