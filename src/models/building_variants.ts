import {BuildingType, IBuildingVariant} from '@/models/building';

export const VARIANTS: IBuildingVariant[] =
  [
    {name: '0', type: BuildingType.Residential, slotSize: '1x1', residents: 1, jobs: 0, maxAngle: 179, size: 1, length: 6, width: 21, height: 13},
    {name: '1', type: BuildingType.Residential, slotSize: '1x1', residents: 1, jobs: 0, maxAngle: 179, size: 1, length: 6, width: 22, height: 16},
    {name: '2', type: BuildingType.Residential, slotSize: '1x1', residents: 1, jobs: 0, maxAngle: 179, size: 1, length: 7, width: 18, height: 16},
    {name: '3', type: BuildingType.Residential, slotSize: '1x1', residents: 1, jobs: 0, maxAngle: 179, size: 1, length: 6, width: 22, height: 14},
    {name: '4', type: BuildingType.Residential, slotSize: '1x1', residents: 1, jobs: 0, maxAngle: 179, size: 1, length: 9, width: 18, height: 14},
  ];
