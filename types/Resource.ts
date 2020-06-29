import { ResourceType } from './ResourceType.ts';
import { Tier } from './Tier.ts';
import { Enchantment } from './Enchantment.ts';
import { tierRawMultiplier } from '../index.ts';

export const RefinedResources: ResourceType[] = ['bar'];
export const RawResources: ResourceType[] = ['ore'];

const enchantmentToNumberMap: { [k: string]: string } = {
  none: '',
  uncommon: '.1',
  rare: '.2',
  exceptional: '.3'
};

const nameMap: {
  [t in Tier]: {
    [rt in ResourceType]: string;
  };
} = {
  2: {
    bar: 'copper bar',
    ore: 'copper ore',
    wood: 'birch log',
    plank: 'birch plank',
    rock: 'limestone',
    'stone block': 'limestone block',
    cloth: 'simple cloth',
    fiber: 'cotton',
    hide: 'rugged hide',
    leather: 'stiff leather'
  },
  3: {
    bar: 'bronze bar',
    ore: 'tin ore',
    wood: 'chestnut log',
    plank: 'chestnut plank',
    rock: 'sandstone',
    'stone block': 'sandstone block',
    cloth: 'neat cloth',
    fiber: 'flax',
    hide: 'thin hide',
    leather: 'thick leather'
  },
  4: {
    bar: 'steel bar',
    ore: 'iron ore',
    wood: 'pine log',
    plank: 'pine plank',
    rock: 'travertine',
    'stone block': 'travertine block',
    cloth: 'fine cloth',
    fiber: 'hemp',
    hide: 'medium hide',
    leather: 'worked leather'
  },
  5: {
    bar: 'titanium steel bar',
    ore: 'titanium ore',
    wood: 'cedar log',
    plank: 'cedar plank',
    rock: 'granite',
    'stone block': 'granite block',
    cloth: 'ornate cloth',
    fiber: 'skyflower',
    hide: 'heavy hide',
    leather: 'cured leather'
  },
  6: {
    bar: 'runite steel bar',
    ore: 'runite ore',
    wood: 'bloodoak log',
    plank: 'bloodoak plank',
    rock: 'slate',
    'stone block': 'slate block',
    cloth: 'lavish cloth',
    fiber: 'redleaf cotton',
    hide: 'robust hide',
    leather: 'hardened leather'
  },
  7: {
    bar: 'meteorite steel bar',
    ore: 'meteorite ore',
    wood: 'ashenbark log',
    plank: 'ashenbark plank',
    rock: 'basalt',
    'stone block': 'basalt block',
    cloth: 'opulent cloth',
    fiber: 'sunflax',
    hide: 'thick hide',
    leather: 'reinforced leather'
  },
  8: {
    bar: 'adamantium steel bar',
    ore: 'adamantium ore',
    wood: 'whitewood log',
    plank: 'whitewood plank',
    rock: 'marble',
    'stone block': 'marble block',
    cloth: 'baroque cloth',
    fiber: 'ghost hemp',
    hide: 'resilient hide',
    leather: 'fortified leather'
  }
};

interface Recipe {
  raw: number;
  refined: number;
}

export class Resource {
  enchantment: Enchantment;
  quantity: number;
  tier: Tier;
  type: ResourceType;
  recipe: Recipe;

  constructor(
    enchantment: Enchantment,
    tier: Tier,
    type: ResourceType,
    quantity?: number
  ) {
    this.enchantment = tier <= 3 ? 'none' : enchantment;
    this.tier = tier;
    this.type = type;
    this.quantity = quantity ?? 0;
    this.recipe = { raw: tierRawMultiplier[tier], refined: +(tier > 2) };
  }

  merge = (other: Resource) => {
    if (
      other.enchantment !== this.enchantment ||
      other.tier !== this.tier ||
      other.type !== this.type
    ) {
      throw `Cannot merge [${other.print()}] with [${this.print()}]`;
    }
    this.quantity += other.quantity;
  };

  print = () =>
    `${this.quantity}${
      this.enchantment === 'none' ? '' : ' ' + this.enchantment
    } ${this.name} (T${this.tier}${
      this.enchantment === 'none'
        ? ''
        : enchantmentToNumberMap[this.enchantment]
    })`;

  get name() {
    return nameMap[this.tier][this.type];
  }

  get isRefined() {
    return RefinedResources.includes(this.type);
  }
}
