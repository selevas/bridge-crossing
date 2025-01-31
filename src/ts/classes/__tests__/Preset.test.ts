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

});
