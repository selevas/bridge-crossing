import {
  Side,
  PersonDefinition,
} from "../types";

import {
  ObjectError,
  ValueError,
} from "./Errors";

export interface PresetImport {
  successful: Preset[]; // The Presets that imported successfully
  failed: ObjectError[][]; // Errors for each object that failed to import.
}

export default class Preset {

  /**
   * Generates an array of Presets from an array of Preset-like objects.
   *
   * The purpose of this static method is to read preset information from
   * an external source (such as a JSON file) and return them as a set of
   * Preset objects.
   *
   * The resulting object contains two properties: One with a list of
   * Preset objects that were successfully created, another with a list
   * of ObjectErrors for Presets that couldn't be created.
   *
   * @static
   *
   * @param {object[]} presets - The array of Preset-like objects.
   *
   * @return {PresetImport} - The resulting array of Preset objects
   *                          and ObjectErrors.
   */
  static importPresetObjects(presets: {[id: string]: any}[]): PresetImport {
    const failed: ObjectError[][] = [];
    const successful: Preset[] = [];
    for (const preset of presets) {
      try {
        successful.push(new Preset(
          preset.name,
          preset.bridgeWidth,
          preset.people,
          preset.torchSide,
        ));
      } catch (e) {
        if (e instanceof ValueError) {
          const err = new ObjectError(
            e.name,
            e.message,
            {object: preset},
          );
          err.data.value = e.data.value;
          failed.push([err]);
        }
        if (e instanceof ObjectError) {
          failed.push([e]);
        } else {
          throw e;
        }
      }
    }
    return { successful, failed };
  }

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
