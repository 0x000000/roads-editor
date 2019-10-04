import {Path, Point} from '@/models/geometry';

export enum BuildingType {
  Residential = 1,
}

export enum BuildingSize {
  S = 1, // 1-2 floors
  M = 2, // 2-5 floors
  L = 3, // 5-10 floors
  XL = 4, // 10-25 floors
  XXL = 5, // 25 - 70 floors
  XXXL = 6, // 70-150 floors
}

export interface ISlot {
  absolutePosition: Point;
  relativePosition: Point;
  topLeftPosition: Point;
  rotation: number;
}

export interface ISector {
  slots: ISlot[];
  size: string;
}

export class Slot implements ISlot {
  public absolutePosition: Point;
  public relativePosition: Point;
  public topLeftPosition: Point;
  public rotation: number;

  constructor(slot: ISlot) {
    this.absolutePosition = slot.absolutePosition;
    this.relativePosition = slot.relativePosition;
    this.topLeftPosition = slot.topLeftPosition;
    this.rotation = slot.rotation;
  }
}

export class Sector implements ISector {
  public size: string;
  public slots: Slot[];

  public static parse(sectors: ISector[]): Sector[] {
    return sectors.map(sector => {
      return new Sector({
        size: sector.size,
        slots: sector.slots.map(slot => new Slot(slot)),
      });
    });
  }

  constructor(sector: ISector) {
    this.size = sector.size;
    this.slots = sector.slots;
  }
}

export interface BuildingState {
  readonly id: number;
  center: Point;
  rotationAngle: number;
  walls: Path[];
  height: number;
}

export default class Building implements BuildingState {
  public id: number;
  public center: Point;
  public rotationAngle: number;
  public walls: Path[];
  public height: number;

  constructor(state: BuildingState) {
    this.id = state.id;
    this.center = state.center;
    this.rotationAngle = state.rotationAngle;
    this.walls = state.walls;
    this.height = state.height;
  }
}

