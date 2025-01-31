import {
  PersonDefinition,
} from "../../types";

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

});
