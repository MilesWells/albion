import { Enchantment, Tier, ResourceType } from "./index.ts";

export const RefinedResources: Readonly<ResourceType[]> = ["bar"] as const;
export const RawResources: Readonly<ResourceType[]> = ["ore"] as const;

const nameMap: {
  [t in Tier]: {
    [rt in ResourceType]: string;
  };
} = {
  3: {
    "bar": "bronze bar",
    "ore": "tin ore",
  },
  4: {
    "bar": "steel bar",
    "ore": "iron ore",
  },
  5: {
    "bar": "titanium steel bar",
    "ore": "titanium ore",
  },
};

interface Recipe {
  raw: number;
  refined: number;
}

export default class Resource {
  enchantment: Enchantment;
  have: number;
  tier: Tier;
  type: ResourceType;
  recipe: Recipe;

  constructor(
    enchantment: Enchantment,
    tier: Tier,
    type: ResourceType,
    have?: number,
  ) {
    this.enchantment = tier === 3 ? "none" : enchantment;
    this.tier = tier;
    this.type = type;
    this.have = have ?? 0;
    if (this.tier >= 5) {
      this.recipe = { raw: 3, refined: 1 };
    } else {
      this.recipe = { raw: 2, refined: 1 };
    }
  }
  merge = (other: Resource) => {
    if (
      other.enchantment !== this.enchantment || other.tier !== this.tier ||
      other.type !== this.type
    ) {
      throw `Cannot merge [${other.print()}] with [${this.print()}]`;
    }
    this.have += other.have;
  };
  print = () =>
    `${this.have}${
      this.enchantment === "none" ? "" : " " + this.enchantment
    } ${this.name}`;

  get name() {
    return nameMap[this.tier][this.type];
  }

  get isRefined() {
    return this.type in RefinedResources;
  }
}
