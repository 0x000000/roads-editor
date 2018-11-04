import {Point} from '@/models/geometry';
import {FIELD_HEIGHT, FIELD_WIDTH, POINT_DISTANCE} from '@/config';

export interface DotState {
  shown: boolean;
  selected: boolean;
  gridPosition: Point;
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
        dots.push(new Dot({
          gridPosition: {x, y},
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
    this.index = state.index;

    this.mapPosition = {
      x: (this.gridPosition.x + 1) * POINT_DISTANCE,
      y: (this.gridPosition.y + 1) * POINT_DISTANCE,
    };
  }
}

