import times from 'lodash/times';
import {
  Building,
  BuildingSize,
  BuildingSlotSize,
  BuildingType,
  IBuildingVariant,
  ISector,
  ISlot
} from '@/models/building';
import {calculateChances, decide, r, random, Range, sample, selectByChance} from '@/models/utils';
import Block from '@/models/block';
import {VARIANTS} from '@/models/building_variants';
import District from '@/models/district';
import {DistrictShape} from '@/models/block_generator';

const SizeWidth = {
  [BuildingSize.S]: r(6, 9), // 1-2 floors
  [BuildingSize.M]: r(6, 9), // 2-5 floors
  [BuildingSize.L]: r(6, 9), // 5-10 floors
  [BuildingSize.XL]: r(6, 9), // 10-25 floors
  [BuildingSize.XXL]: r(6, 9), // 25-70 floors
  [BuildingSize.XXXL]: r(6, 9), // 70-150 floors
};

interface BuildingTemplate {
  count: number;
  slotSize: BuildingSlotSize;
  type: BuildingType;
  size: BuildingSize;
  width: Range;
  height: Range;
  maxAngle: number;
}

interface TargetSlot {
  size: BuildingSlotSize;
  relatedSlots: ISlot[];
}

const Templates: BuildingTemplate[] = [
  {
    count: 5,
    slotSize: '1x1',
    type: BuildingType.Residential,
    size: BuildingSize.S,
    width: r(18, 22),
    height: r(13, 17),
    maxAngle: 179,
  },
  // {todo:
  //   count: 5,
  //   slotSize: '2x2',
  //   type: BuildingType.Agriculture,
  //   size: BuildingSize.S,
  //
  // }
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

enum SplitStrategy {
  SmallestChunks = 1,
}

function splitSlots(sector: ISector, strategy: SplitStrategy): TargetSlot[] {
  return sector.slots.map(slot => {
    return {
      size: '1x1',
      relatedSlots: [slot],
    };
  });
}

const ANGLE_CHANCE = calculateChances('35,30,35', 0, 45, 90);
const ADDITIONAL_ANGLE_CHANCE = calculateChances('30,30,25,10,5', 0, 1, 2, 3, 4);
const ADDITIONAL_ANGLE_SIGN = calculateChances('50,50', -1, +1);

function calcRotation(districtShape: DistrictShape, slotSize: BuildingSlotSize, prevValue: number | undefined): number {
  switch (districtShape) {
    case DistrictShape.Linear: {
       if (prevValue === undefined) {
         return selectByChance(ANGLE_CHANCE);
       } else {
         return prevValue + (selectByChance(ADDITIONAL_ANGLE_CHANCE) * selectByChance(ADDITIONAL_ANGLE_SIGN));
       }
    } break;

    default: return 0;
  }
}

let ID = 0;

function calcResidentialBlock(district: District, block: Block, sectors: ISector[]): Building[] {
  const buildings: Building[] = [];
  let rotationAngle: number | undefined;

  sectors.forEach(sector => {
    splitSlots(sector, SplitStrategy.SmallestChunks).forEach(targetSlot => {
      const variants = VARIANTS.filter(v => {
        return v.type === BuildingType.Residential && v.slotSize === targetSlot.size;
      });

      if (variants.length === 0) {
        throw new Error('Variants is empty');
      }

      const variant = sample(variants);
      const topLeftSlot = targetSlot.relatedSlots[0];
      const center = {
        x: topLeftSlot.absolutePosition.x - Math.floor(variant.width / 2),
        y: topLeftSlot.absolutePosition.y - Math.floor(variant.height / 2),
      };
      rotationAngle = calcRotation(district.shape, variant.slotSize, rotationAngle);

      buildings.push(new Building({
        id: ID++, //todo: <<<<<<<<<<<<<<<<
        address: {
          districtId: district.id,
          blockId: block.id,
          sectorId: sector.id,
          slotIds: targetSlot.relatedSlots.map(s => s.id),
        },
        rotationAngle,
        variant,
        center,
      }));
    });
  });

  return buildings;
}

// function calcAgriculturalBlock(block: Block) {//todo:
//   sectors.sort(
//     (s1, s2) => s1.size.localeCompare(s2.size) * -1
//   )
// }
// function calcIndustrialBlock(block: Block, sectors: ISector[]) {}
// function calcCommercialBlock(block: Block, sectors: ISector[]) {}
// function calcForestBlock(block: Block, sectors: ISector[]) {}
// function calcParkBlock(block: Block, sectors: ISector[]) {}
// function calcWastelandBlock(block: Block, sectors: ISector[]) {}

export function generateBuildingsForBlock(district: District, block: Block): Building[] {
  if (!block.layout) {
    return [];
  }

  return calcResidentialBlock(district, block, block.layout.sectors);
}
