import { Resource } from './Resource.ts';

const findResource = (resource: Resource, array: Resource[]) => {
  return array.find(
    (r) =>
      r.type === resource.type &&
      r.tier === resource.tier &&
      r.enchantment === resource.enchantment
  );
};

export class ResourceTotals {
  #need: Resource[] = [];
  #crafted: Resource[] = [];

  #addToArray = (resource: Resource, array: Resource[]) => {
    const existingResource = findResource(resource, array);

    if (!existingResource) array.push(resource);
    else existingResource.merge(resource);

    return this;
  };

  remove = (resource: Resource) => {
    const existingResource = findResource(resource, this.#crafted);

    if (!existingResource) {
      throw new Error('Cannot remove resource that does not already exist');
    }

    // trying to remove more than we have
    if (resource.quantity > existingResource.quantity) {
      const idx = this.#crafted.indexOf(existingResource);
      this.#crafted = [
        ...this.#crafted.slice(0, idx),
        ...this.#crafted.slice(idx + 1)
      ];

      // repurpose Resource already in scope (now removed from array)
      existingResource.quantity = resource.quantity - existingResource.quantity;
      this.#addToArray(existingResource, this.#need);
    } else existingResource.quantity -= resource.quantity;

    return this;
  };

  addNeed = (resource: Resource) => {
    const craftedResource = findResource(resource, this.#crafted);

    if (craftedResource) return this.remove(resource);

    return this.#addToArray(resource, this.#need);
  };

  craft = (resource: Resource) => this.#addToArray(resource, this.#crafted);

  get resources() {
    return this.#need;
  }

  get print() {
    console.table([...this.#crafted]);
    return undefined;
  }
}
