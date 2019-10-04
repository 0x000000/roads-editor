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
  [{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"a"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":53},"topLeftPosition":{"x":39,"y":39},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":95,"y":53},"topLeftPosition":{"x":81,"y":39},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":95,"y":81},"topLeftPosition":{"x":81,"y":67},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":137,"y":53},"topLeftPosition":{"x":123,"y":39},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":137,"y":81},"topLeftPosition":{"x":123,"y":67},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":165,"y":53},"topLeftPosition":{"x":151,"y":39},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":165,"y":81},"topLeftPosition":{"x":151,"y":67},"rotation":0}],"size":"2x2"}]},{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"a_mirror"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":53},"topLeftPosition":{"x":39,"y":39},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":95},"topLeftPosition":{"x":39,"y":81},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":81,"y":95},"topLeftPosition":{"x":67,"y":81},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":137},"topLeftPosition":{"x":39,"y":123},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":81,"y":137},"topLeftPosition":{"x":67,"y":123},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":53,"y":165},"topLeftPosition":{"x":39,"y":151},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":81,"y":165},"topLeftPosition":{"x":67,"y":151},"rotation":0}],"size":"2x2"}]},{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"b"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":53},"topLeftPosition":{"x":333,"y":39},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":95},"topLeftPosition":{"x":333,"y":81},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":319,"y":95},"topLeftPosition":{"x":305,"y":81},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":137},"topLeftPosition":{"x":333,"y":123},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":319,"y":137},"topLeftPosition":{"x":305,"y":123},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":347,"y":165},"topLeftPosition":{"x":333,"y":151},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":319,"y":165},"topLeftPosition":{"x":305,"y":151},"rotation":0}],"size":"2x2"}]},{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"b_mirror"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":53},"topLeftPosition":{"x":333,"y":39},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":305,"y":53},"topLeftPosition":{"x":291,"y":39},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":305,"y":81},"topLeftPosition":{"x":291,"y":67},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":263,"y":53},"topLeftPosition":{"x":249,"y":39},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":263,"y":81},"topLeftPosition":{"x":249,"y":67},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":235,"y":53},"topLeftPosition":{"x":221,"y":39},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":235,"y":81},"topLeftPosition":{"x":221,"y":67},"rotation":0}],"size":"2x2"}]},{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"c"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":347},"topLeftPosition":{"x":333,"y":333},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":305,"y":347},"topLeftPosition":{"x":291,"y":333},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":305,"y":319},"topLeftPosition":{"x":291,"y":305},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":263,"y":347},"topLeftPosition":{"x":249,"y":333},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":263,"y":319},"topLeftPosition":{"x":249,"y":305},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":235,"y":347},"topLeftPosition":{"x":221,"y":333},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":235,"y":319},"topLeftPosition":{"x":221,"y":305},"rotation":0}],"size":"2x2"}]},{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"c_mirror"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":347},"topLeftPosition":{"x":333,"y":333},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":305},"topLeftPosition":{"x":333,"y":291},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":319,"y":305},"topLeftPosition":{"x":305,"y":291},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":347,"y":263},"topLeftPosition":{"x":333,"y":249},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":319,"y":263},"topLeftPosition":{"x":305,"y":249},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":347,"y":235},"topLeftPosition":{"x":333,"y":221},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":319,"y":235},"topLeftPosition":{"x":305,"y":221},"rotation":0}],"size":"2x2"}]},{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"d"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":347},"topLeftPosition":{"x":39,"y":333},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":305},"topLeftPosition":{"x":39,"y":291},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":81,"y":305},"topLeftPosition":{"x":67,"y":291},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":263},"topLeftPosition":{"x":39,"y":249},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":81,"y":263},"topLeftPosition":{"x":67,"y":249},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":53,"y":235},"topLeftPosition":{"x":39,"y":221},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":81,"y":235},"topLeftPosition":{"x":67,"y":221},"rotation":0}],"size":"2x2"}]},{"block":{"shape":1,"type":"Res","density":"Low","position":11,"postfix":"d_mirror"},"sectors":[{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":53,"y":347},"topLeftPosition":{"x":39,"y":333},"rotation":0}],"size":"1x1"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":95,"y":347},"topLeftPosition":{"x":81,"y":333},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":95,"y":319},"topLeftPosition":{"x":81,"y":305},"rotation":0}],"size":"1x2"},{"slots":[{"relativePosition":{"x":0,"y":0},"absolutePosition":{"x":137,"y":347},"topLeftPosition":{"x":123,"y":333},"rotation":0},{"relativePosition":{"x":0,"y":1},"absolutePosition":{"x":137,"y":319},"topLeftPosition":{"x":123,"y":305},"rotation":0},{"relativePosition":{"x":1,"y":0},"absolutePosition":{"x":165,"y":347},"topLeftPosition":{"x":151,"y":333},"rotation":0},{"relativePosition":{"x":1,"y":1},"absolutePosition":{"x":165,"y":319},"topLeftPosition":{"x":151,"y":305},"rotation":0}],"size":"2x2"}]}]
);
