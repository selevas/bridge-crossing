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
      const errors: ObjectError[] = [];
      if (typeof preset.name === "undefined") {
        errors.push(new ObjectError(
          "PRESET_MISSING_NAME",
          "The imported Preset is missing the `name` property.",
          {object: preset},
        ));
      }
      else if (typeof preset.name !== "string") {
        errors.push(new ObjectError(
          "PRESET_INVALID_NAME",
          "The `name` property of imported Preset is not of type string.",
          {object: preset},
        ));
      }
      if (typeof preset.bridgeWidth === "undefined") {
        errors.push(new ObjectError(
          "PRESET_MISSING_BRIDGE_WIDTH",
          "The imported Preset is missing the `bridgeWidth` property.",
          {object: preset},
        ));
      }
      else if (typeof preset.bridgeWidth !== "number") {
        errors.push(new ObjectError(
          "PRESET_INVALID_BRIDGE_WIDTH",
          "The `bridgeWidth` property of imported Preset is not of type number.",
          {object: preset},
        ));
      }
      if (typeof preset.people === "undefined") {
        errors.push(new ObjectError(
          "PRESET_MISSING_PEOPLE",
          "The imported Preset is missing the `people` property.",
          {object: preset},
        ));
      }
      else if (false === Array.isArray(preset.people)) {
        errors.push(new ObjectError(
          "PRESET_INVALID_PEOPLE",
          "The `people` property of imported Preset is not an array.",
          {object: preset},
        ));
      }
      else {
        for (const person of preset.people) {
          if (typeof person !== "object") {
            errors.push(new ObjectError(
              "PRESET_PERSON_INVALID",
              "A Person in the imported Preset is not of type object.",
              {object: person},
            ));
          }
          if (typeof person.name === "undefined") {
            errors.push(new ObjectError(
              "PRESET_PERSON_MISSING_NAME",
              "A Person in the imported Preset is missing the `name` property.",
              {object: person},
            ));
          }
          else if (typeof person.name !== "string") {
            errors.push(new ObjectError(
              "PRESET_PERSON_INVALID_NAME",
              "A Person in the imported Preset has an invalid `name` property.",
              {object: person},
            ));
          }
          if (typeof person.crossTime === "undefined") {
            errors.push(new ObjectError(
              "PRESET_PERSON_MISSING_CROSS_TIME",
              "A Person in the imported Preset is missing the `crossTime` property.",
              {object: person},
            ));
          }
          else if (typeof person.crossTime !== "number") {
            errors.push(new ObjectError(
              "PRESET_PERSON_INVALID_CROSS_TIME",
              "A Person in the imported Preset has an invalid `crossTime` property.",
              {object: person},
            ));
          }
          if (typeof person.side !== "undefined" && false === ['start', 'end'].includes(person.side)) {
            errors.push(new ObjectError(
              "PRESET_PERSON_INVALID_SIDE",
              "A Person in the imported Preset has an invalid `side` property.",
              {object: person},
            ));
          }
        }
      }
      if (typeof preset.torchSide === "undefined") {
        errors.push(new ObjectError(
          "PRESET_MISSING_TORCH_SIDE",
          "The imported Preset is missing the `torchSide` property.",
          {object: preset},
        ));
      }
      else if (false === ['start', 'end'].includes(preset.torchSide)) {
        errors.push(new ObjectError(
          "PRESET_INVALID_TORCH_SIDE",
          "The `torchSide` property of imported Preset is not \"start\" or \"end\".",
          {object: preset},
        ));
      }
      if (errors.length > 0) {
        failed.push(errors);
        continue;
      }
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
