import { Enchantment, Tier, ResourceType, tierRawMultiplier } from "./index.ts";

export const RefinedResources: ResourceType[] = ["bar"];
export const RawResources: ResourceType[] = ["ore"];

const enchantmentToNumberMap: { [k: string]: string } = {
  "none": "",
  "uncommon": ".1",
  "rare": ".2",
  "exceptional": ".3",
};

const nameMap: {
  [t in Tier]: {
    [rt in ResourceType]: string;
  };
} = {
  2: {
    "bar": "copper bar",
    "ore": "copper ore",
    "wood": "birch log",
    "plank": "birch plank",
    "rock": "limestone",
    "stone block": "limestone block",
  },
  3: {
    "bar": "bronze bar",
    "ore": "tin ore",
    "wood": "chestnut log",
    "plank": "chestnut plank",
    "rock": "sandstone",
    "stone block": "sandstone block",
  },
  4: {
    "bar": "steel bar",
    "ore": "iron ore",
    "wood": "pine log",
    "plank": "pine plank",
    "rock": "travertine",
    "stone block": "travertine block",
  },
  5: {
    "bar": "titanium steel bar",
    "ore": "titanium ore",
    "wood": "cedar log",
    "plank": "cedar plank",
    "rock": "granite",
    "stone block": "granite block",
  },
  6: {
    "bar": "runite steel bar",
    "ore": "runite ore",
    "wood": "bloodoak log",
    "plank": "bloodoak plank",
    "rock": "slate",
    "stone block": "slate block",
  },
};

interface Recipe {
  raw: number;
  refined: number;
}

export default class Resource {
  enchantment: Enchantment;
  quantity: number;
  tier: Tier;
  type: ResourceType;
  recipe: Recipe;

  constructor(
    enchantment: Enchantment,
    tier: Tier,
    type: ResourceType,
    quantity?: number,
  ) {
    this.enchantment = tier <= 3 ? "none" : enchantment;
    this.tier = tier;
    this.type = type;
    this.quantity = quantity ?? 0;
    this.recipe = { raw: tierRawMultiplier[tier], refined: +(tier > 2) };
  }
  merge = (other: Resource) => {
    if (
      other.enchantment !== this.enchantment || other.tier !== this.tier ||
      other.type !== this.type
    ) {
      throw `Cannot merge [${other.print()}] with [${this.print()}]`;
    }
    this.quantity += other.quantity;
  };
  print = () =>
    `${this.quantity}${
      this.enchantment === "none" ? "" : " " + this.enchantment
    } ${this.name} (T${this.tier}${
      this.enchantment === "none"
        ? ""
        : enchantmentToNumberMap[this.enchantment]
    })`;

  get name() {
    return nameMap[this.tier][this.type];
  }

  get isRefined() {
    return RefinedResources.includes(this.type);
  }
}
