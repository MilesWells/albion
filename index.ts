import Resource from "./Resource.ts";
import ResourceTotals from "./ResourceTotals.ts";

export type ResourceType =
  | "ore"
  | "bar"
  | "rock"
  | "stone block"
  | "wood"
  | "plank";

export type Enchantment = "none" | "uncommon" | "rare" | "exceptional";
export type Tier = 2 | 3 | 4 | 5 | 6;

const enchantmentMap: { [k: number]: Enchantment } = {
  0: "none",
  1: "uncommon",
  2: "rare",
  3: "exceptional",
};

const enchantmentToNumberMap: { [k: string]: number } = {
  "none": 0,
  "uncommon": 1,
  "rare": 2,
  "exceptional": 3,
};

const rawToRefinedMap: { [k: string]: ResourceType } = {
  "ore": "bar",
  "bar": "bar",
  "rock": "stone block",
  "stone block": "stone block",
  "wood": "plank",
  "plank": "plank",
};

const refinedToRawMap: { [k: string]: ResourceType } = {
  "bar": "ore",
  "ore": "ore",
  "stone block": "rock",
  "rock": "rock",
  "plank": "wood",
  "wood": "wood",
};

export const tierRawMultiplier: { [k: number]: number } = {
  2: 2,
  3: 2,
  4: 2,
  5: 3,
  6: 4,
};

const args = [...Deno.args];

if (args.length === 0 || args[0] === "help") {
  console.log(`[Have][Type][Tier].[Enchantment]\ne.g. 100ore4.1`);
  Deno.exit();
}

function parseArg(arg: string) {
  try {
    const pattern = arg.includes(".")
      ? /(\d+)(\D+)(\d)\.(\d)/
      : /(\d+)(\D+)(\d)/;

    let [, have, type, tier, enchantment] = arg.match(pattern)?.reduce(
      (acc, cur) => acc.concat(cur),
      <string[]> [],
    ) ?? [];

    if (
      have === undefined || type === undefined || tier === undefined
    ) {
      throw new Error("have, type, and tier must be provided");
    }

    enchantment = isNaN(+enchantment)
      ? enchantmentMap[0]
      : enchantmentMap[+enchantment];

    return new Resource(
      <Enchantment> enchantment,
      <Tier> +tier,
      <ResourceType> type,
      <number> +have,
    );
  } catch (err) {
    console.log(err);
    throw `Malformed input [${arg}] ${err}`;
  }
}

const resourceHaves: Resource[] = [];
const errors: string[] = [];

for (const arg of args) {
  try {
    const resource = parseArg(arg);
    resourceHaves.push(resource);
  } catch (err) {
    errors.push(err);
  }
}

if (errors.length > 0) {
  console.log("There were errors:");
  errors.map((value) => console.log(value));
  Deno.exit();
}

function tierBelow(tier: Tier): Tier {
  return <Tier> ((<number> tier) - 1);
}

const totals = new ResourceTotals();

// add refined resources we already have
resourceHaves.reduce(
  (_, cur) => cur.isRefined ? totals.craft(cur) : totals,
  totals,
);

function calculate(
  { isRefined, enchantment, tier, type, quantity: have }: Resource,
): ResourceTotals {
  // if passed a refined resource, switch to calculating raw
  if (isRefined) {
    return calculate(
      new Resource(
        enchantment,
        tier,
        refinedToRawMap[type],
        have * tierRawMultiplier[tier],
      ),
    );
  }

  const make = Math.ceil(have / tierRawMultiplier[tier]);

  totals.addNeed(
    new Resource(enchantment, tierBelow(tier), rawToRefinedMap[type], make),
  );

  totals.craft(
    new Resource(
      enchantment,
      tier,
      rawToRefinedMap[type],
      make,
    ),
  );

  if (have % tierRawMultiplier[tier] !== 0) {
    totals.addNeed(
      new Resource(
        enchantment,
        tier,
        type,
        tierRawMultiplier[tier] - (have % tierRawMultiplier[tier]),
      ),
    );
  }

  return totals;
}

// sort resources by type -> tier -> refined/raw -> enchantment
function sortResource(
  { type: typeA, tier: tierA, isRefined: aRefined, enchantment: aEnchantment }:
    Resource,
  { type: typeB, tier: tierB, isRefined: bRefined, enchantment: bEnchantment }:
    Resource,
): number {
  if (typeA < typeB) return 1;
  else if (typeA === typeB) {
    if (tierA > tierB) return 1;
    else if (tierA === tierB) {
      if (aRefined === bRefined) {
        return enchantmentToNumberMap[aEnchantment] >
          enchantmentToNumberMap[bEnchantment]
          ? 1
          : -1;
      }
      return aRefined ? 1 : -1;
    }
  }
  return -1;
}

const sortedHaves = resourceHaves.sort(sortResource);

console.log("You have:");
console.log(sortedHaves.map((r) => r.print()).join("\n"));

const resourceNeeds = sortedHaves.reduce(
  (_, cur) => cur.isRefined ? totals : calculate(cur),
  totals,
);

console.log(
  "\nTo use all your resources, you need to buy:",
);
console.log(
  resourceNeeds.resources.sort(sortResource).map((rh) => rh.print()).join("\n"),
);
