import {
  PersonDefinition,
} from "../../types";

import {
  ValueError
} from "../Errors";

import Preset from "../Preset";

describe("class Preset", () => {

  describe("Initialization", () => {

    it("should initialize with provided values", () => {
      const people: PersonDefinition[] = [
        { name: "Zazu", crossTime: 7 },
        { name: "Mufasa", crossTime: 6 },
        { name: "Scar", crossTime: 5 },
      ];
      const preset: Preset = new Preset('preset1', 2, people, 'start');
      expect(preset.name).toBe('preset1');
      expect(preset.bridgeWidth).toBe(2);
      expect(preset.people).toEqual(people);
      expect(preset.people).not.toBe(people);
      expect(preset.torchSide).toBe('start');
    });

    it("cannot have an empty string as name", () => {
      let error;
      try {
        new Preset('', 2, [], 'start');
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ValueError);
      expect(error).toEqual({
        name: "PRESET_EMPTY_NAME",
        message: "The name of your Preset must be a non-empty string",
        data: {value: ''},
      });
    });

    it("cannot have a bridge width less than 2", () => {
      let error;
      try {
        new Preset('small bridge', 1, [], 'start');
      } catch (e) {
        error = e;
      }
      expect(error).toBeInstanceOf(ValueError);
      expect(error).toEqual({
        name: "PRESET_BRIDGE_WIDTH_TOO_SMALL",
        message: "The bridge width in your Preset must be greater than 2",
        data: {value: 1},
      });
    });

  });

  describe("Comparison", () => {

    it("should compare equality of basic attributes between two Presets", () => {
      const preset1: Preset = new Preset('preset1', 2, [], 'start');
      const preset2: Preset = new Preset('preset2', 2, [], 'start');
      const preset3: Preset = new Preset('preset3', 3, [], 'start');
      const preset4: Preset = new Preset('preset4', 2, [], 'end');
      expect(preset1.equals(preset2)).toBe(true);
      expect(preset1.equals(preset3)).toBe(false);
      expect(preset1.equals(preset4)).toBe(false);
    });

    it("should compare equality of People", () => {
      const firstPeople: PersonDefinition[] = [
        { name: "Optimus Prime", crossTime: 13, side: "start" },
        { name: "Megatron", crossTime: 12, side: "end" },
      ];
      const secondPeople: PersonDefinition[] = [
        { name: "Optimus Prime", crossTime: 13, side: "start" },
        { name: "Starscream", crossTime: 12, side: "end" },
      ];
      const thirdPeople: PersonDefinition[] = [
        { name: "Optimus Prime", crossTime: 13, side: "start" },
        { name: "Megatron", crossTime: 11, side: "end" },
      ];
      const fourthPeople: PersonDefinition[] = [
        { name: "Optimus Prime", crossTime: 13, side: "end" },
        { name: "Megatron", crossTime: 12, side: "end" },
      ];
      const fifthPeople: PersonDefinition[] = [
        { name: "Optimus Prime", crossTime: 13, side: "start" },
        { name: "Megatron", crossTime: 12, side: "end" },
        { name: "Bumblebee", crossTime: 8, side: "start" },
      ];
      const preset1: Preset = new Preset('preset1', 2, firstPeople, "start");
      const preset2: Preset = new Preset('preset2', 2, firstPeople, "start");
      const preset3: Preset = new Preset('preset3', 2, secondPeople, "start");
      const preset4: Preset = new Preset('preset4', 2, thirdPeople, "start");
      const preset5: Preset = new Preset('preset5', 2, fourthPeople, "start");
      const preset6: Preset = new Preset('preset6', 2, fifthPeople, "start");
      expect(preset1.equals(preset2)).toBe(true);
      expect(preset2.equals(preset1)).toBe(true);
      expect(preset1.equals(preset3)).toBe(false);
      expect(preset3.equals(preset1)).toBe(false);
      expect(preset1.equals(preset4)).toBe(false);
      expect(preset4.equals(preset1)).toBe(false);
      expect(preset1.equals(preset5)).toBe(false);
      expect(preset5.equals(preset1)).toBe(false);
      expect(preset1.equals(preset6)).toBe(false);
      expect(preset6.equals(preset1)).toBe(false);
    });

  });

  describe("Generation", () => {

    it("should generate a clone", () => {
      const people: PersonDefinition[] = [
        { name: "Jango Fett", crossTime: 66, side: "start" },
      ];
      const original: Preset = new Preset("original", 3, people, "start");
      const clone: Preset = original.clone("clone");
      expect(original.equals(clone)).toBe(true);
      expect(clone.equals(original)).toBe(true);
      expect(original.bridgeWidth).toBe(clone.bridgeWidth);
      expect(original.people).toEqual(clone.people);
      expect(original.torchSide).toBe(clone.torchSide);
      expect(original.name).not.toBe(clone.name); // only the name is different
      expect(clone.name).toBe("clone");

      const clone2: Preset = original.clone(); // no name this time
      expect(clone2.name).toBe("original_copy");

      const clone3: Preset = clone2.clone();
      expect(clone3.name).toBe("original_copy_copy");
    });

  });

});
