import {Point} from '@/models/geometry';
import {FIELD_HEIGHT, FIELD_WIDTH, POINT_DISTANCE} from '@/config';

export class Dot {
  public shown: boolean;
  public selected: boolean;
  public gridPosition: Point;
  public mapPosition: Point;

  public static buildArray(): Dot[] {
    const dots: Dot[] = [];

    for (let y = 0; y < FIELD_HEIGHT; y++) {
      for (let x = 0; x < FIELD_WIDTH; x++) {
        dots.push(new Dot({x, y}));
      }
    }

    return dots;
  }

  constructor(gridPosition: Point) {
    this.shown = true;
    this.selected = false;
    this.gridPosition = gridPosition;

    this.mapPosition = {
      x: (this.gridPosition.x + 1) * POINT_DISTANCE,
      y: (this.gridPosition.y + 1) * POINT_DISTANCE,
    };
  }
}

