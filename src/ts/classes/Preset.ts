import {
  Side,
  PersonDefinition,
} from "../types";

export default class Preset {

  #name: string; // The name of the preset.
  #bridgeWidth: number; // The number of people who can cross simultaneously.
  #people: PersonDefinition[]; // The default set of people.
  #torchSide: Side; // The default starting side for the torch.

  constructor(name: string, bridgeWidth: number, people: PersonDefinition[] = [], torchSide: Side = 'start') {
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

}
