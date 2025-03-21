import {
  PersonDefinition,
} from "../../types";

import {
  ObjectError,
  ValueError
} from "../Errors";

import Preset, { PresetImport } from "../Preset";

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

  describe("Import", () => {

    const importData = [
      {
        name: "first_preset",
        bridgeWidth: 2,
        people: [],
        torchSide: "start",
      },
      {
        name: "second_preset",
        bridgeWidth: 2,
        people: [
          { name: "Ashely", crossTime: 5, side: "start" },
          { name: "Orwell", crossTime: 6, side: "start" },
          { name: "Jacob", crossTime: 4, side: "start" },
        ],
        torchSide: "start",
      },
      {
        name: "third_preset",
        bridgeWidth: 4,
        people: [
          { name: "Darth Vader", crossTime: 68, side: "end" },
          { name: "Luke Skywalker", crossTime: 70, side: "start" },
          { name: "Emperor Palpatine", crossTime: 66, side: "end" },
          { name: "Han Solo", crossTime: 72, side: "start" },
          { name: "Chewbacca", crossTime: 76, side: "start" },
          { name: "Leia Organa", crossTime: 34, side: "start" },
          { name: "R2D2", crossTime: 10, side: "start" },
          { name: "C-3PO", crossTime: 150, side: "start" },
        ],
        torchSide: "end",
      },
    ];

    it("should import valid preset data without errors", () => {
      const presetImport: PresetImport = Preset.importPresetObjects(importData);
      expect(presetImport.successful.length).toBe(3);
      expect(presetImport.failed.length).toBe(0);
      const s: Preset[] = presetImport.successful;
      expect(s[0].name).toBe("first_preset");
      expect(s[0].bridgeWidth).toBe(2);
      expect(s[0].people.length).toBe(0);
      expect(s[0].torchSide).toBe("start");
      expect(s[1].name).toBe("second_preset");
      expect(s[1].bridgeWidth).toBe(2);
      expect(s[1].people.length).toBe(3);
      expect(s[1].people[0]).toEqual({ name: "Ashely", crossTime: 5, side: "start" });
      expect(s[1].people[1]).toEqual({ name: "Orwell", crossTime: 6, side: "start" });
      expect(s[1].people[2]).toEqual({ name: "Jacob", crossTime: 4, side: "start" });
      expect(s[1].torchSide).toBe("start");
      expect(s[2].name).toBe("third_preset");
      expect(s[2].bridgeWidth).toBe(4);
      expect(s[2].people.length).toBe(8);
      expect(s[2].people[0]).toEqual({ name: "Darth Vader", crossTime: 68, side: "end" });
      expect(s[2].people[1]).toEqual({ name: "Luke Skywalker", crossTime: 70, side: "start" });
      expect(s[2].people[2]).toEqual({ name: "Emperor Palpatine", crossTime: 66, side: "end" });
      expect(s[2].people[3]).toEqual({ name: "Han Solo", crossTime: 72, side: "start" });
      expect(s[2].people[4]).toEqual({ name: "Chewbacca", crossTime: 76, side: "start" });
      expect(s[2].people[5]).toEqual({ name: "Leia Organa", crossTime: 34, side: "start" });
      expect(s[2].people[6]).toEqual({ name: "R2D2", crossTime: 10, side: "start" });
      expect(s[2].people[7]).toEqual({ name: "C-3PO", crossTime: 150, side: "start" });
      expect(s[2].torchSide).toBe("end");
    });

    it("should return an ObjectError if the imported preset has no name", () => {
      const data = [
        {
          bridgeWidth: importData[0].bridgeWidth,
          people: importData[0].people,
          torchSide: importData[0].torchSide,
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_MISSING_NAME");
      expect(presetImport.failed[0][0].message).toBe("The imported Preset is missing the `name` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if the imported preset has an invalid name", () => {
      const data = [
        {
          name: 42,
          bridgeWidth: importData[0].bridgeWidth,
          people: importData[0].people,
          torchSide: importData[0].torchSide,
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_INVALID_NAME");
      expect(presetImport.failed[0][0].message).toBe("The `name` property of imported Preset is not of type string.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if the imported preset has no bridgeWidth", () => {
      const data = [
        {
          name: "test-preset",
          people: importData[0].people,
          torchSide: importData[0].torchSide,
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_MISSING_BRIDGE_WIDTH");
      expect(presetImport.failed[0][0].message).toBe("The imported Preset is missing the `bridgeWidth` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if the imported preset has an invalid bridgeWidth", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: "2",
          people: importData[0].people,
          torchSide: importData[0].torchSide,
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_INVALID_BRIDGE_WIDTH");
      expect(presetImport.failed[0][0].message).toBe("The `bridgeWidth` property of imported Preset is not of type number.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if the imported preset has no people property", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          torchSide: importData[0].torchSide,
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_MISSING_PEOPLE");
      expect(presetImport.failed[0][0].message).toBe("The imported Preset is missing the `people` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if the imported preset has an invalid people property", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: "Jim",
          torchSide: importData[0].torchSide,
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_INVALID_PEOPLE");
      expect(presetImport.failed[0][0].message).toBe("The `people` property of imported Preset is not an array.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if the imported preset has no torchSide", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: [],
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_MISSING_TORCH_SIDE");
      expect(presetImport.failed[0][0].message).toBe("The imported Preset is missing the `torchSide` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if the imported preset has an invalid torchSide", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: [],
          torchSide: 0,
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_INVALID_TORCH_SIDE");
      expect(presetImport.failed[0][0].message).toBe("The `torchSide` property of imported Preset is not \"start\" or \"end\".");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
    });

    it("should return an ObjectError if one of the imported people is not an object", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: ["Dave"],
          torchSide: "start",
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_PERSON_INVALID");
      expect(presetImport.failed[0][0].message).toBe("A Person in the imported Preset is not of type object.");
      expect(presetImport.failed[0][0].data.object).toEqual("Dave");
    });

    it("should return an ObjectError if one of the imported people has no name", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: [
            { crossTime: 5 },
          ],
          torchSide: "start",
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_PERSON_MISSING_NAME");
      expect(presetImport.failed[0][0].message).toBe("A Person in the imported Preset is missing the `name` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0].people[0]);
    });

    it("should return an ObjectError if one of the imported people has an invalid name", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: [
            { name: 7, crossTime: 5 },
          ],
          torchSide: "start",
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_PERSON_INVALID_NAME");
      expect(presetImport.failed[0][0].message).toBe("A Person in the imported Preset has an invalid `name` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0].people[0]);
    });

    it("should return an ObjectError if one of the imported people has no crossTime", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: [
            { name: "Popeye", side: "end" },
          ],
          torchSide: "start",
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_PERSON_MISSING_CROSS_TIME");
      expect(presetImport.failed[0][0].message).toBe("A Person in the imported Preset is missing the `crossTime` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0].people[0]);
    });

    it("should return an ObjectError if one of the imported people has an invalid crossTime", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: [
            { name: "Geralt", crossTime: "fast", side: "start" },
          ],
          torchSide: "start",
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_PERSON_INVALID_CROSS_TIME");
      expect(presetImport.failed[0][0].message).toBe("A Person in the imported Preset has an invalid `crossTime` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0].people[0]);
    });

    it("should return an ObjectError if one of the imported people has an invalid side", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: 2,
          people: [
            { name: "Sonic", crossTime: 1, side: "halfway" },
          ],
          torchSide: "start",
        }
      ];
      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_PERSON_INVALID_SIDE");
      expect(presetImport.failed[0][0].message).toBe("A Person in the imported Preset has an invalid `side` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0].people[0]);
    });

    it("should check for multiple errors at once", () => {

      const data = [
        {
          bridgeWidth: importData[0].bridgeWidth,
          people: null,
          torchSide: "beginning",
        },
        importData[1], // this one is correct
        {
          name: importData[2].name,
          bridgeWidth: importData[2].bridgeWidth,
          people: [
            ...importData[2].people.slice(0, 3),
            { crossTime: 72, side: "start" },
            { name: "Chewbacca", crossTime: "76" },
            ...importData[2].people.slice(5),
          ],
          torchSide: "end",
        },
      ];

      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(1);
      expect(presetImport.successful[0]).toBeInstanceOf(Preset);
      expect(presetImport.successful[0].name).toBe(data[1].name);
      expect(presetImport.successful[0].bridgeWidth).toBe(data[1].bridgeWidth);
      expect(presetImport.successful[0].people).toEqual(data[1].people);
      expect(presetImport.successful[0].torchSide).toBe(data[1].torchSide);

      expect(presetImport.failed.length).toBe(2);
      expect(Array.isArray(presetImport.failed[0])).toBe(true);
      expect(presetImport.failed[0].length).toBe(3);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_MISSING_NAME");
      expect(presetImport.failed[0][0].message).toBe("The imported Preset is missing the `name` property.");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
      expect(presetImport.failed[0][1]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][1].name).toBe("PRESET_INVALID_PEOPLE");
      expect(presetImport.failed[0][1].message).toBe("The `people` property of imported Preset is not an array.");
      expect(presetImport.failed[0][1].data.object).toEqual(data[0]);
      expect(presetImport.failed[0][2]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][2].name).toBe("PRESET_INVALID_TORCH_SIDE");
      expect(presetImport.failed[0][2].message).toBe("The `torchSide` property of imported Preset is not \"start\" or \"end\".");
      expect(presetImport.failed[0][2].data.object).toEqual(data[0]);

      expect(Array.isArray(presetImport.failed[1])).toBe(true);
      expect(presetImport.failed[1].length).toBe(2);
      expect(presetImport.failed[1][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[1][0].name).toBe("PRESET_PERSON_MISSING_NAME");
      expect(presetImport.failed[1][0].message).toBe("A Person in the imported Preset is missing the `name` property.");
      expect(presetImport.failed[1][0].data.object).toEqual(data[2].people[3]);
      expect(presetImport.failed[1][1]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[1][1].name).toBe("PRESET_PERSON_INVALID_CROSS_TIME");
      expect(presetImport.failed[1][1].message).toBe("A Person in the imported Preset has an invalid `crossTime` property.");
      expect(presetImport.failed[1][1].data.object).toEqual(data[2].people[4]);

    });

    it("should return an ObjectError when failing to instantiate Preset object during import", () => {
      const data = [
        {
          name: "test-preset",
          bridgeWidth: -3, // does not fail import, but fails instantiation
          people: [
            { name: "Baloo", crossTime: 7, side: "start" },
          ],
          torchSide: "start",
        },
      ];

      const presetImport: PresetImport = Preset.importPresetObjects(data);
      expect(presetImport.successful.length).toBe(0);
      expect(presetImport.failed.length).toBe(1);
      expect(presetImport.failed[0].length).toBe(1);
      expect(presetImport.failed[0][0]).toBeInstanceOf(ObjectError);
      expect(presetImport.failed[0][0].name).toBe("PRESET_BRIDGE_WIDTH_TOO_SMALL");
      expect(presetImport.failed[0][0].message).toBe("The bridge width in your Preset must be greater than 2");
      expect(presetImport.failed[0][0].data.object).toEqual(data[0]);
      expect(presetImport.failed[0][0].data.value).toEqual(-3);
    });

  })

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
      expect(original.people[0]).not.toBe(clone.people[0]); // the people are also cloned
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
