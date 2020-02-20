import {BuildingSize, BuildingType, IBuildingVariant} from '@/models/building';

export const VARIANTS: IBuildingVariant[] =
  [
    {name: 'R00', type: BuildingType.Residential, slotSize: '1x1', size: BuildingSize.S, residents: 100, jobs: 0, maxAngle: 179, length: 6, width: 21, height: 13},
    {name: 'R01', type: BuildingType.Residential, slotSize: '1x1', size: BuildingSize.S, residents: 100, jobs: 0, maxAngle: 179, length: 6, width: 22, height: 16},
    {name: 'R02', type: BuildingType.Residential, slotSize: '1x1', size: BuildingSize.S, residents: 100, jobs: 0, maxAngle: 179, length: 7, width: 18, height: 16},
    {name: 'R03', type: BuildingType.Residential, slotSize: '1x1', size: BuildingSize.S, residents: 100, jobs: 0, maxAngle: 179, length: 6, width: 22, height: 14},
    {name: 'R04', type: BuildingType.Residential, slotSize: '1x1', size: BuildingSize.S, residents: 100, jobs: 0, maxAngle: 179, length: 9, width: 18, height: 14},
  ];
