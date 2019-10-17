import times from "lodash/times";
import {BuildingSize, BuildingSlotSize, BuildingType, IBuildingVariant} from '@/models/building';
import {random} from '@/models/utils';

const SizeWidth = {
  [BuildingSize.S]: r(6, 9), // 1-2 floors
  [BuildingSize.M]: r(6, 9), // 2-5 floors
  [BuildingSize.L]: r(6, 9), // 5-10 floors
  [BuildingSize.XL]: r(6, 9), // 10-25 floors
  [BuildingSize.XXL]: r(6, 9), // 25-70 floors
  [BuildingSize.XXXL]: r(6, 9), // 70-150 floors
};

interface Range {
  min: number;
  max: number;
}

interface BuildingTemplate {
  count: number;
  slotSize: BuildingSlotSize;
  type: BuildingType;
  size: BuildingSize;
  width: Range;
  height: Range;
  maxAngle: number;
}

function decide(range: Range): number {
  return random(range.min, range.max);
}

function r(min: number, max: number): Range {
  return {min, max};
}

const Templates: BuildingTemplate[] = [
  {count: 5, slotSize: '1x1', type: BuildingType.Residential, size: BuildingSize.S, width: r(18, 22), height: r(13, 17), maxAngle: 179}
];

export function generateBuildingVariants(): IBuildingVariant[] {
  const variants: IBuildingVariant[] = [];
  let index = 0;

  Templates.map(template => {
    times(template.count).forEach(() => {
      variants.push({
        name: `${index++}`,
        type: template.type,
        slotSize: template.slotSize,
        maxAngle: template.maxAngle,
        size: template.size,
        length: decide(SizeWidth[template.size]),
        width: decide(template.width),
        height: decide(template.height),
      });
    });
  });

  return variants;
}
