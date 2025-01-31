import {
  Side,
  PersonDefinition,
} from "../types";

import {
  ValueError,
} from "./Errors";

export default class Preset {

  #name: string; // The name of the preset.
  #bridgeWidth: number; // The number of people who can cross simultaneously.
  #people: PersonDefinition[]; // The default set of people.
  #torchSide: Side; // The default starting side for the torch.

  constructor(name: string, bridgeWidth: number, people: PersonDefinition[], torchSide: Side) {
    if (name === '') {
      throw new ValueError(
        "PRESET_EMPTY_NAME",
        "The name of your Preset must be a non-empty string",
        {value: name},
      );
    }
    if (bridgeWidth < 2) {
      throw new ValueError(
        "PRESET_BRIDGE_WIDTH_TOO_SMALL",
        "The bridge width in your Preset must be greater than 2",
        {value: bridgeWidth},
      );
    }
    this.#name = name;
    this.#bridgeWidth = bridgeWidth;
    this.#people = people.map((p: PersonDefinition): PersonDefinition => ({...p}));
    this.#torchSide = torchSide;
  }

  get name(): string {
    return this.#name;
  }

  get bridgeWidth(): number {
    return this.#bridgeWidth;
  }

  get people(): PersonDefinition[] {
    return this.#people.map((p: PersonDefinition): PersonDefinition => ({...p}));
  }

  get torchSide(): Side {
    return this.#torchSide;
  }

  equals(preset: Preset): boolean {
    if (this.#bridgeWidth !== preset.bridgeWidth) {
      return false;
    }
    if (this.#torchSide !== preset.torchSide) {
      return false;
    }
    if (this.#people.length !== preset.people.length) {
      return false;
    }
    for (const index in this.#people) {
      if (this.#people[index].name !== preset.people[index].name) {
        return false;
      }
      if (this.#people[index].crossTime !== preset.people[index].crossTime) {
        return false;
      }
      if (this.#people[index].side !== preset.people[index].side) {
        return false;
      }
    }
    return true;
  }

  clone(name?: string) {
    return new Preset(
      name ?? `${this.#name}_copy`,
      this.#bridgeWidth,
      this.#people.map((p: PersonDefinition): PersonDefinition => ({...p})),
      this.#torchSide,
    );
  }
}
