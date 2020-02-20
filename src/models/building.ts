import {Point} from '@/models/geometry';
import {ProductType} from '@/models/production';

export type BuildingSlotSize = '1x1' | '1x2' | '2x2' | '2x3' | '2x4' | '3x3' | '3x4' | '4x4';

export enum BuildingType {
  Residential = 1,
  Commercial,
  Industrial,
  Agriculture,
  Park,
  Forest,
  HQ,
}

export enum BuildingSize {
  S = 1, // 1-2 floors
  M = 2, // 2-5 floors
  L = 3, // 5-10 floors
  XL = 4, // 10-25 floors
  XXL = 5, // 25-70 floors
  XXXL = 6, // 70-150 floors
}

export interface IBuildingVariant {
  name: string;
  slotSize: BuildingSlotSize;
  type: BuildingType;
  size: number;
  length: number;
  width: number;
  height: number;
  maxAngle: number;
  residents: number;
  jobs: number;
}

export interface ISlot {
  id: number;
  absolutePosition: Point;
  relativePosition: Point;
  topLeftPosition: Point;
  rotation: number;
}

export interface ISector {
  id: number;
  slots: ISlot[];
  size: BuildingSlotSize;
}

export class Slot implements ISlot {
  public id: number;
  public absolutePosition: Point;
  public relativePosition: Point;
  public topLeftPosition: Point;
  public rotation: number;

  constructor(slot: ISlot) {
    this.id = slot.id;
    this.absolutePosition = slot.absolutePosition;
    this.relativePosition = slot.relativePosition;
    this.topLeftPosition = slot.topLeftPosition;
    this.rotation = slot.rotation;
  }
}

export class Sector implements ISector {
  public id: number;
  public size: BuildingSlotSize;
  public slots: Slot[];

  public static parse(sectors: ISector[]): Sector[] {
    return sectors.map(sector => {
      return new Sector({
        id: sector.id,
        size: sector.size,
        slots: sector.slots.map(slot => new Slot(slot)),
      });
    });
  }

  constructor(sector: ISector) {
    this.id = sector.id;
    this.size = sector.size;
    this.slots = sector.slots;
  }
}

export interface Address {
  districtId: number;
  blockId: number;
  sectorId: number;
  slotIds: number[];
}


export interface IBuilding {
  readonly id: number;
  center: Point;
  centerDiff: Point;
  rotationAngle: number;
  variant: IBuildingVariant;
  address: Address;
  productType: ProductType;
}

export class Building implements IBuilding {
  public id: number;
  public center: Point;
  public rotationAngle: number;
  public variant: IBuildingVariant;
  public address: Address;
  public centerDiff: Point;
  public productType: ProductType;

  public selected: boolean = false;

  constructor(state: IBuilding) {
    this.id = state.id;
    this.center = state.center;
    this.rotationAngle = state.rotationAngle;
    this.variant = state.variant;
    this.address = state.address;
    this.centerDiff = state.centerDiff;
    this.productType = state.productType;
  }

  public get classes(): string[] {
    return ['building', this.selected ? 'selected' : ''];
  }
}

