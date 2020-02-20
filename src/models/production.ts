export enum RawDeposits {
  Soil,
  Minerals,
  Chemicals,
  Water,
}

export enum ProductType {
  None,

  // Raw materials
  Chemicals,
  Minerals,
  Biomass,
  Water,

  // Industrial production
  Food,
  Technics,
  GeneralGoods,
  Energy,

  // Services
  Entertainment,
  Support,
  Research,
  SewageDisposal,
  WasteDisposal,
  FireFighting,
  Security,
  Health,
  Education,
}

export type Quality = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface IProduct {
  type: ProductType;
  quality: Quality;
}
