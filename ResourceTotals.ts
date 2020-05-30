import Resource from "./Resource.ts";

export default class ResourceTotals {
  #resources: Resource[] = [];

  add = (resource: Resource) => {
    const existingResource = this.#resources.find((r) =>
      r.type === resource.type && r.tier === resource.tier &&
      r.enchantment === resource.enchantment
    );

    if (!existingResource) this.#resources.push(resource);
    else existingResource.merge(resource);

    return this;
  };

  get resources() {
    return this.#resources;
  }
}
