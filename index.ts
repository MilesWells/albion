import Resource, { RawResources, RefinedResources } from "./Resource.ts";
import ResourceTotals from "./ResourceTotals.ts";

export type ResourceType = "ore" | "bar";

export type Enchantment = "none" | "uncommon" | "rare" | "exceptional";
export type Tier = 3 | 4 | 5;

const enchantmentMap: { [k: number]: Enchantment } = {
  0: "none",
  1: "uncommon",
  2: "rare",
  3: "exceptional",
};

const rawToRefinedMap: { [k: string]: ResourceType } = {
  "ore": "bar",
  "bar": "bar",
};

const refinedToRawMap: { [k: string]: ResourceType } = {
  "bar": "ore",
  "ore": "ore",
};

const tierRawMultiplier: { [k: number]: number } = {
  3: 2,
  4: 2,
  5: 3,
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

function calculate(
  { isRefined, enchantment, tier, type, have }: Resource,
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

  // buying all tier 3 and below resources needed already refined so we can skip calculating tier 3
  if (tier === 3) return totals;

  const make = Math.ceil(have / tierRawMultiplier[tier]);
  const refinedAddition = new Resource(
    enchantment,
    tierBelow(tier),
    rawToRefinedMap[type],
    make,
  );
  
  totals.add(refinedAddition);

  if (have % tierRawMultiplier[tier] !== 0) totals.add(new Resource(
    enchantment,
    tier,
    type,
    tierRawMultiplier[tier] - (have % tierRawMultiplier[tier]),
  ));

  return calculate(refinedAddition);
}

console.log("You have:");
console.log(resourceHaves.map((rh) => rh.print()).join("\n"));

const resourceNeeds = resourceHaves.reduce((_, cur) => calculate(cur), totals);

console.log("\nTo use all your resources, you need to buy:");
console.log(resourceNeeds.resources.map((rh) => rh.print()).join("\n"));
