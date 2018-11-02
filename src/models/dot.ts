import {Point} from '@/models/geometry';
import {FIELD_HEIGHT, FIELD_WIDTH, POINT_DISTANCE} from '@/config';

export interface DotState {
  shown: boolean;
  selected: boolean;
  gridPosition: Point;
  mapPosition: Point;
}

export class Dot implements DotState {
  public shown: boolean;
  public selected: boolean;
  public gridPosition: Point;
  public mapPosition: Point;

  public static buildArray(): Dot[] {
    const dots: Dot[] = [];

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
        }));
      }
    }

    return dots;
  }

  public static restoreArray(states: DotState[]): Dot[] {
    return states.map(state => new Dot(state));
  }

  constructor(state: DotState) {
    this.shown = state.shown;
    this.selected = state.selected;
    this.gridPosition = state.gridPosition;
    this.mapPosition = state.mapPosition;
  }

  public valueOf(): number {
    return (this.gridPosition.y * FIELD_WIDTH) + this.gridPosition.x;
  }
}

