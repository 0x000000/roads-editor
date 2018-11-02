import {Point} from '@/models/geometry';
import {FIELD_HEIGHT, FIELD_WIDTH, POINT_DISTANCE} from '@/config';

export interface DotState {
  shown: boolean;
  selected: boolean;
  gridPosition: Point;
  mapPosition: Point;
  index: number;
}

export class Dot implements DotState {
  public shown: boolean;
  public selected: boolean;
  public gridPosition: Point;
  public mapPosition: Point;
  public index: number;

  public static buildArray(): Dot[] {
    const dots: Dot[] = [];
    let index: number = 0;

    for (let y = 0; y < FIELD_HEIGHT; y++) {
      for (let x = 0; x < FIELD_WIDTH; x++) {
        const gridPosition: Point = {x, y};
        const mapPosition: Point = {
          x: (x + 1) * POINT_DISTANCE,
          y: (y + 1) * POINT_DISTANCE,
        };

        dots.push(new Dot({
          gridPosition,
          mapPosition,
          shown: true,
          selected: false,
          index: index++,
        }));
      }
    }

    return dots;
  }

  constructor(state: DotState) {
    this.shown = state.shown;
    this.selected = state.selected;
    this.gridPosition = state.gridPosition;
    this.mapPosition = state.mapPosition;
    this.index = state.index;
  }

  public valueOf(): number {
    return (this.gridPosition.y * FIELD_WIDTH) + this.gridPosition.x;
  }
}

