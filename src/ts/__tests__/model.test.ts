import Preset, { PresetImport } from '../classes/Preset';
import AppModel from '../model';

const mockImportDefaultPresets = () => {
  AppModel.importDefaultPresets = jest.fn(() => {
    return {
      failed: [],
      successful: [
        new Preset(
          "default",
          2,
          [],
          "start",
        ),
      ],
    };
  });
}

mockImportDefaultPresets();

import {ResourceError, ValueError} from '../classes/Errors';

console.log = jest.fn();

describe("Model", () => {

  let model: AppModel;

  describe("Setup and Presets", () => {

    beforeAll(() => {
      AppModel.importDefaultPresets = jest.fn(() => {
        return {
          failed: [],
          successful: [
            new Preset(
              "default",
              2,
              [
                { name: 'Louise', crossTime: 1, side: 'start' },
                { name: 'Mark', crossTime: 2, side: 'start' },
                { name: 'Anne', crossTime: 5, side: 'start' },
                { name: 'John', crossTime: 8, side: 'start' },
              ],
              "start",
            ),
            new Preset(
              "empty",
              2,
              [],
              "start",
            ),
          ],
        };
      });
    });

    beforeEach(() => {
      model = new AppModel();
    });

    afterAll(() => {
      mockImportDefaultPresets();
    });

    it("should assign default preset values upon instantiation of new AppModel object", () => {
      expect(model.getBridgeWidth()).toBe(2);
      expect(model.getPeople()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
        { id: 1, name: 'Mark', crossTime: 2, side: 'start' },
        { id: 2, name: 'Anne', crossTime: 5, side: 'start' },
        { id: 3, name: 'John', crossTime: 8, side: 'start' },
      ]);
      expect(model.getTorchSide()).toBe('start');
    });

    it("should return the active Preset", () => {
      const preset: Preset = model.getActivePreset();
      expect(preset.name).toBe("default");
      expect(preset.bridgeWidth).toBe(2);
      expect(preset.people).toEqual([
        { name: 'Louise', crossTime: 1, side: 'start' },
        { name: 'Mark', crossTime: 2, side: 'start' },
        { name: 'Anne', crossTime: 5, side: 'start' },
        { name: 'John', crossTime: 8, side: 'start' },
      ]);
      expect(preset.torchSide).toBe("start");
    });

    it("should return all presets when the method getPresets() is called", () => {
      const presets: Preset[] = model.getPresets();
      expect(presets.length).toBe(2);
      expect(presets[0].name).toBe("default");
      expect(presets[0].bridgeWidth).toBe(2);
      expect(presets[0].people).toEqual([
        { name: 'Louise', crossTime: 1, side: 'start' },
        { name: 'Mark', crossTime: 2, side: 'start' },
        { name: 'Anne', crossTime: 5, side: 'start' },
        { name: 'John', crossTime: 8, side: 'start' },
      ]);
      expect(presets[0].torchSide).toBe("start");
      expect(presets[1].name).toBe("empty");
      expect(presets[1].bridgeWidth).toBe(2);
      expect(presets[1].people.length).toBe(0);
      expect(presets[1].torchSide).toBe("start");
    });

    it("should create a new Preset from the model's current settings", () => {
      const presets: Preset[] = [];
      presets.push(model.createPresetFromModel('first'));
      expect(presets[0].name).toBe("first");
      expect(presets[0].bridgeWidth).toBe(2);
      expect(presets[0].people).toEqual([
        { name: 'Louise', crossTime: 1, side: 'start' },
        { name: 'Mark', crossTime: 2, side: 'start' },
        { name: 'Anne', crossTime: 5, side: 'start' },
        { name: 'John', crossTime: 8, side: 'start' },
      ]);
      expect(presets[0].torchSide).toBe("start");
      model.setBridgeWidth(3);
      model.removePerson(2);
      model.setTorchSide("end");
      presets.push(model.createPresetFromModel('second'));
      expect(presets[1].name).toBe("second");
      expect(presets[1].bridgeWidth).toBe(3);
      expect(presets[1].people).toEqual([
        { name: 'Louise', crossTime: 1, side: 'start' },
        { name: 'Mark', crossTime: 2, side: 'start' },
        { name: 'John', crossTime: 8, side: 'start' },
      ]);
      expect(presets[1].torchSide).toBe("end");
    });

    it("should save a Preset without confirmation if a Preset with its name doesn't already exist", () => {
      expect(model.savePreset(new Preset('new preset', 4, [], "end"))).toBe(true);
      expect(model.getPreset('new preset').name).toBe("new preset");
      expect(model.getPreset('new preset').bridgeWidth).toBe(4);
      expect(model.getPreset('new preset').people.length).toBe(0);
      expect(model.getPreset('new preset').torchSide).toBe("end");
    });

    it("should fail to save a Preset without confirmation if a Preset with its name already exists", () => {
      expect(model.savePreset(new Preset('default', 4, [], "end"))).toBe(false);
      expect(model.getPreset('default').name).toBe("default");
      expect(model.getPreset('default').bridgeWidth).toBe(2);
      expect(model.getPreset('default').people.length).toBe(4);
      expect(model.getPreset('default').torchSide).toBe("start");
    });

    it("should save a Preset with confirmation", () => {
      expect(model.savePreset(new Preset('default', 4, [], "end"), true)).toBe(true);
      expect(model.getPreset('default').name).toBe("default");
      expect(model.getPreset('default').bridgeWidth).toBe(4);
      expect(model.getPreset('default').people.length).toBe(0);
      expect(model.getPreset('default').torchSide).toBe("end");
    });

    it("should load a Preset into the model directly", () => {
      model.loadPreset(new Preset('direct', 5, [], "end"));
      const activePreset: Preset = model.getActivePreset();
      expect(activePreset.name).toBe('direct');
      expect(activePreset.bridgeWidth).toBe(5);
      expect(activePreset.people.length).toBe(0);
      expect(activePreset.torchSide).toBe("end");
    });

    it("should load a Preset into the model by name", () => {
      model.savePreset(new Preset('alt', 4, [], "end"));
      model.loadPreset('alt');
      const activePreset: Preset = model.getActivePreset();
      expect(activePreset.name).toBe('alt');
      expect(activePreset.bridgeWidth).toBe(4);
      expect(activePreset.people.length).toBe(0);
      expect(activePreset.torchSide).toBe("end");
    });

    it("should throw a ResourceError if the name of the specified Preset is not found", () => {
      let err;
      try {
        model.loadPreset('this preset does not exist');
      } catch (e) {
        err = e;
      }
      expect(err).toBeInstanceOf(ResourceError);
      expect(err).toEqual({
        name: "PRESET_NOT_FOUND",
        message: "The preset \"this preset does not exist\" was not found in the current list of presets.",
      })
    });

    it("should update the active preset with the current model settings", () => {
      model.setBridgeWidth(6);
      expect(model.getActivePreset().bridgeWidth).toBe(2);
      model.updateActivePreset();
      expect(model.getActivePreset().bridgeWidth).toBe(6);
    });


    it("should identify whether the model's settings differ from the active preset", () => {
      expect(model.hasBeenModified()).toBe(false);
      model.setTorchSide("end");
      expect(model.hasBeenModified()).toBe(true);
      model.updateActivePreset(); // active Preset updated to match model settings
      expect(model.hasBeenModified()).toBe(false);
      model.setBridgeWidth(4);
      expect(model.hasBeenModified()).toBe(true);
      model.setBridgeWidth(2); // returned to original value
      expect(model.hasBeenModified()).toBe(false);
      model.addPerson({name: "Steve", crossTime: 5, side: "start"});
      expect(model.hasBeenModified()).toBe(true);
      model.removePerson(4); // remove the last person added, Steve
      expect(model.hasBeenModified()).toBe(false);
    });

  });

  describe("Initialization", () => {

    afterAll(() => {
      mockImportDefaultPresets();
    });

    it("should initialize to the Preset named \"default\"", () => {
      AppModel.importDefaultPresets = jest.fn(() => {
        return {
          failed: [],
          successful: [
            new Preset("preset1", 3, [], "end"),
            new Preset("default", 2, [], "start"), // It should default to this one
          ],
        };
      });
      model = new AppModel();
      expect(model.getBridgeWidth()).toBe(2);
      expect(model.getPeopleAtStart().length).toBe(0);
      expect(model.getPeopleAtEnd().length).toBe(0);
      expect(model.getTorchSide()).toBe('start');
    });

    it("should initialize with the default set of people when specified", () => {
      AppModel.importDefaultPresets = jest.fn(() => {
        return {
          failed: [],
          successful: [
            new Preset("preset1", 3, [], "end"), // It should default to this one
            new Preset("preset2", 2, [], "start"),
          ],
        };
      });
      model = new AppModel();
      expect(model.getBridgeWidth()).toBe(3);
      expect(model.getPeopleAtStart().length).toBe(0);
      expect(model.getPeopleAtEnd().length).toBe(0);
      expect(model.getTorchSide()).toBe('end');
    });

  });

  describe("Attributes", () => {

    beforeEach(() => {
      model = new AppModel();
    });

    describe("Bridge width", () => {

      it("should set to the value specified", () => {
        model.setBridgeWidth(3);
        expect(model.getBridgeWidth()).toBe(3);
        model.setBridgeWidth(5);
        expect(model.getBridgeWidth()).toBe(5);
      });

      it("should throw an error if the bridge width is too small", () => {
        let err;
        try {
          model.setBridgeWidth(-3);
        } catch (e) {
          err = e;
        }
        expect(err).toBeInstanceOf(ValueError);
        expect(err).toEqual({
          name: "BRIDGE_WIDTH_TOO_SMALL",
          message: "The bridge width must be at least 2 for the model to function.",
          data: {value: -3},
        })
      });

    });

  });

  describe("People", () => {

    beforeEach(() => {
      model = new AppModel();
    });

    it("should get an empty list when there are no people", () => {
      expect(model.getPeopleAtStart().length).toBe(0);
      expect(model.getPeopleAtEnd().length).toBe(0);
    });

    it("should add a Person via a PersonDefinition object", () => {
      model.addPerson({
        name: "Joe",
        crossTime: 5,
        side: 'start',
      });
      expect(model.getPeopleAtStart()).toEqual([
        {
          id: 0,
          name: "Joe",
          crossTime: 5,
          side: 'start',
        },
      ]);
      expect(model.getPeopleAtEnd().length).toBe(0);
    });

    it("should add a Person via individual attributes", () => {
      model.addPerson("Jeff", 3, 'end');
      expect(model.getPeopleAtStart().length).toBe(0);
      expect(model.getPeopleAtEnd()).toEqual([
        {
          id: 0,
          name: "Jeff",
          crossTime: 3,
          side: 'end',
        },
      ]);
    });

    it("should automatically add a Person to the start if side is not specified", () => {
      model.addPerson("Jim", 2);
      expect(model.getPeopleAtStart()[0].side).toBe('start');
    });

    it("should add multiple Persons and increment their IDs correctly", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' });
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'start' });
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' });
      expect(model.getPeopleAtStart()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
        { id: 1, name: 'Mark', crossTime: 2, side: 'start' },
        { id: 2, name: 'Anne', crossTime: 5, side: 'start' },
      ]);
    });

    it("should remove a Person", () => {
      const id: number = model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' });
      expect(model.getPeopleAtStart()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
      ]);
      model.removePerson(id);
      expect(model.getPeopleAtStart().length).toBe(0);
    });

    it("should remove a Person from the middle of a list", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' });
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'start' });
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' });
      model.removePerson(model.getPeopleAtStart()[1].id);
      expect(model.getPeopleAtStart()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
        { id: 2, name: 'Anne', crossTime: 5, side: 'start' },
      ]);
    });

    it("should remove multiple Persons", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' });
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'start' });
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' });
      model.removePerson(model.getPeopleAtStart()[1].id);
      model.removePerson(model.getPeopleAtStart()[1].id);
      expect(model.getPeopleAtStart()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
      ]);
    });

    it("should return null when removing a Person that doesn't exist", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' });
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'start' });
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' });
      expect(model.removePerson(5)).toBeNull();
    });

    it("should set the ID to the highest ID in the set of Persons plus one", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'start' }); // ID 1
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' }); // ID 2
      expect(model.getPeopleAtStart().map(p => p.id)).toEqual([0, 1, 2]);
      model.removePerson(1); // remove ID 1 (Mark)
      expect(model.getPeopleAtStart().map(p => p.id)).toEqual([0, 2]);
      model.addPerson({ name: 'Bobby', crossTime: 4, side: 'start' }); // ID 3
      // new Person has ID 3 since the highest is currently 2
      expect(model.getPeopleAtStart().map(p => p.id)).toEqual([0, 2, 3]);
      model.removePerson(3); // remove ID 3 (Bobby)
      expect(model.getPeopleAtStart().map(p => p.id)).toEqual([0, 2]);
      model.addPerson({ name: 'Ginny', crossTime: 3, side: 'start' }); // ID 3
      // new Person again has ID 3 since the highest is again 2
      expect(model.getPeopleAtStart().map(p => p.id)).toEqual([0, 2, 3]);
    });


    it("should get all Persons", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'end' }); // ID 1
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' }); // ID 2
      expect(model.getPeople()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' }, // ID 0
        { id: 1, name: 'Mark', crossTime: 2, side: 'end' }, // ID 1
        { id: 2, name: 'Anne', crossTime: 5, side: 'start' }, // ID 2
      ]);
    });

    it("should get all Persons at the start", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'end' }); // ID 1
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' }); // ID 2
      expect(model.getPeopleAtSide("start")).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
        { id: 2, name: 'Anne', crossTime: 5, side: 'start' },
      ]);
      expect(model.getPeopleAtStart()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
        { id: 2, name: 'Anne', crossTime: 5, side: 'start' },
      ]);
    });

    it("should get all Persons at the end", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'end' }); // ID 1
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' }); // ID 2
      expect(model.getPeopleAtSide("end")).toEqual([
        { id: 1, name: 'Mark', crossTime: 2, side: 'end' },
      ]);
      expect(model.getPeopleAtEnd()).toEqual([
        { id: 1, name: 'Mark', crossTime: 2, side: 'end' },
      ]);
    });

    it("should get a Person based on their ID", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'end' }); // ID 1
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' }); // ID 2
      expect(model.getPersonById(1)).toEqual({ id: 1, name: 'Mark', crossTime: 2, side: 'end' });
      expect(model.getPersonById(0)).toEqual({ id: 0, name: 'Louise', crossTime: 1, side: 'start' });
    });

    it("should get a Person based on their name", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'end' }); // ID 1
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' }); // ID 2
      expect(model.getPersonByName("Anne")).toEqual({ id: 2, name: 'Anne', crossTime: 5, side: 'start' });
      expect(model.getPersonByName("Louise")).toEqual({ id: 0, name: 'Louise', crossTime: 1, side: 'start' });
    });

    it("should return null when getting a Person who doesn't exist", () => {
      expect(model.getPersonById(5000)).toBeUndefined();
      expect(model.getPersonByName("George")).toBeUndefined();
    });

    it("should set a Person's side correctly", () => {
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      model.setPersonSide(0, 'end');
      expect(model.getPersonById(0).side).toBe('end');
      model.addPerson({ name: 'Anne', crossTime: 5, side: 'start' }); // ID 2
      model.setPersonSide(1, 'start');
      expect(model.getPersonById(1).side).toBe('start');
    });

    it("should return null when trying to set the side of a nonexistent Person", () => {
      expect(model.setPersonSide(3000, 'end')).toBeNull();
    });

    it("should not modify the actual Person if the returned Person object is changed", () => {
      // check getPersonById()
      model.addPerson({ name: 'Louise', crossTime: 1, side: 'start' }); // ID 0
      const person = model.getPersonById(0);
      person.name = "Gary";
      person.crossTime = 3;
      person.side = 'end';
      expect(model.getPersonById(0)).not.toEqual(person);
      expect(model.getPersonById(0).name).toBe("Louise");
      expect(model.getPersonById(0).crossTime).toBe(1);
      expect(model.getPersonById(0).side).toBe('start');

      // check getPersonByName()
      model.addPerson({ name: 'Mark', crossTime: 2, side: 'end' }); // ID 1
      const person2 = model.getPersonByName("Mark");
      person2.name = "Doug";
      person2.crossTime = 7;
      person2.side = 'start';
      expect(model.getPersonById(1)).not.toEqual(person);
      expect(model.getPersonById(1).name).toBe("Mark");
      expect(model.getPersonById(1).crossTime).toBe(2);
      expect(model.getPersonById(1).side).toBe('end');
    });

  });

  describe("State", () => {

    beforeEach(() => {
      model = new AppModel();
    });

    it("should get the model state", () => {
      AppModel.importDefaultPresets = jest.fn(() => {
        return {
          failed: [],
          successful: [
            new Preset(
              "default",
              2,
              [
                { name: 'Louise', crossTime: 1, side: 'start' },
                { name: 'Mark', crossTime: 2, side: 'start' },
                { name: 'Anne', crossTime: 5, side: 'start' },
                { name: 'John', crossTime: 8, side: 'start' },
              ],
              'start',
            ),
          ],
        };
      });
      model = new AppModel();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
          { id: 1, name: 'Mark', crossTime: 2, side: 'start' },
          { id: 2, name: 'Anne', crossTime: 5, side: 'start' },
          { id: 3, name: 'John', crossTime: 8, side: 'start' },
        ],
        peopleAtEnd: [],
        timePassed: 0,
        turnsElapsed: 0,
        torchSide: 'start',
      });
      mockImportDefaultPresets();
    });

    it("should increment the time passed", () => {
      expect(model.getState().timePassed).toBe(0);
      model.incrementTimePassed(4);
      expect(model.getState().timePassed).toBe(4);
      model.incrementTimePassed(5);
      expect(model.getState().timePassed).toBe(9);
    });

    it("should increment the turns elapsed", () => {
      expect(model.getState().turnsElapsed).toBe(0);
      model.incrementTurnsElapsed();
      expect(model.getState().turnsElapsed).toBe(1);
      model.incrementTurnsElapsed(3);
      expect(model.getState().turnsElapsed).toBe(4);
      model.incrementTurnsElapsed();
      expect(model.getState().turnsElapsed).toBe(5);
    });

    it("should set the torch side", () => {
      expect(model.getState().torchSide).toBe('start');
      model.setTorchSide('end');
      expect(model.getState().torchSide).toBe('end');
      model.setTorchSide('start');
      expect(model.getState().torchSide).toBe('start');
    });

    it("should not modify the actual state if the returned state is changed", () => {
      const state = model.getState();
      state.timePassed = 8;
      state.turnsElapsed = 5;
      expect(model.getState()).not.toEqual(state);
      expect(model.getState().timePassed).toBe(0);
      expect(model.getState().turnsElapsed).toBe(0);
    });

  });

  describe("Execution", () => {

    beforeEach(() => {
      model = new AppModel();
    });

    it("should instantly complete if no Persons present", () => {
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [],
        timePassed: 0,
        turnsElapsed: 0,
        torchSide: 'start',
      });
    });

    it("should instantly complete if nobody starts with torch", () => {
      model.addPerson("Leroy", 3, 'start');
      model.setTorchSide('end'); // torch starts at the end
      expect(model.getState()).toEqual({
        finalState: true,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Leroy', crossTime: 3, side: 'start' },
        ],
        peopleAtEnd: [],
        timePassed: 0,
        turnsElapsed: 0,
        torchSide: 'end',
      });
    });

    it("should complete very simple model #1", () => {
      // A single person crossing in a single turn.
      model.addPerson("Jerry", 2, 'start');
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Jerry', crossTime: 2, side: 'start' },
        ],
        peopleAtEnd: [],
        timePassed: 0,
        turnsElapsed: 0,
        torchSide: 'start',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [
          { id: 0, name: 'Jerry', crossTime: 2, side: 'end' },
        ],
        timePassed: 2,
        turnsElapsed: 1,
        torchSide: 'end',
      });
    });

    it("should complete very simple model #2", () => {
      // Two people crossing in a single turn.
      model.addPerson("Jerry", 2, 'start');
      model.addPerson("Alfonso", 3, 'start');
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Jerry', crossTime: 2, side: 'start' },
          { id: 1, name: 'Alfonso', crossTime: 3, side: 'start' },
        ],
        peopleAtEnd: [],
        timePassed: 0,
        turnsElapsed: 0,
        torchSide: 'start',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [
          { id: 0, name: 'Jerry', crossTime: 2, side: 'end' },
          { id: 1, name: 'Alfonso', crossTime: 3, side: 'end' },
        ],
        timePassed: 3,
        turnsElapsed: 1,
        torchSide: 'end',
      });
    });

    it("should complete simple model #1", () => {
      // Three people at the starting side.
      model.addPerson("Jerry", 2, 'start');
      model.addPerson("Alfonso", 3, 'start');
      model.addPerson("Leonardo", 1, 'start');
      model.stepForward();
      // Leonardo, the fastest, crosses with Alfonso, the slowest
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Jerry', crossTime: 2, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Alfonso', crossTime: 3, side: 'end' },
          { id: 2, name: 'Leonardo', crossTime: 1, side: 'end' },
        ],
        timePassed: 3,
        turnsElapsed: 1,
        torchSide: 'end',
      });
      model.stepForward();
      // Leonardo, being the fastest, returns quickly with the torch
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Jerry', crossTime: 2, side: 'start' },
          { id: 2, name: 'Leonardo', crossTime: 1, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Alfonso', crossTime: 3, side: 'end' },
        ],
        timePassed: 4,
        turnsElapsed: 2,
        torchSide: 'start',
      });
      model.stepForward();
      // Leonard crosses with Jerry, completing the execution
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [
          { id: 0, name: 'Jerry', crossTime: 2, side: 'end' },
          { id: 1, name: 'Alfonso', crossTime: 3, side: 'end' },
          { id: 2, name: 'Leonardo', crossTime: 1, side: 'end' },
        ],
        timePassed: 6,
        turnsElapsed: 3,
        torchSide: 'end',
      });
    });

    it("should complete medium model #1", () => {
      model.addPerson("Alfred", 3, 'start');
      model.addPerson("Borris", 7, 'start');
      model.addPerson("Calvin", 8, 'start');
      model.addPerson("Daniela", 2, 'start');
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
          { id: 1, name: 'Borris', crossTime: 7, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 8,
        turnsElapsed: 1,
        torchSide: 'end',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
          { id: 1, name: 'Borris', crossTime: 7, side: 'start' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
        ],
        timePassed: 10,
        turnsElapsed: 2,
        torchSide: 'start',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 17,
        turnsElapsed: 3,
        torchSide: 'end',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
        ],
        timePassed: 19,
        turnsElapsed: 4,
        torchSide: 'start',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'end' },
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 22,
        turnsElapsed: 5,
        torchSide: 'end',
      });
    });

    it("should complete medium model #1, but with bridge width 3", () => {
      model.addPerson("Alfred", 3, 'start');
      model.addPerson("Borris", 7, 'start');
      model.addPerson("Calvin", 8, 'start');
      model.addPerson("Daniela", 2, 'start');
      model.setBridgeWidth(3);
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 8,
        turnsElapsed: 1,
        torchSide: 'end',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
        ],
        timePassed: 10,
        turnsElapsed: 2,
        torchSide: 'start',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'end' },
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 13,
        turnsElapsed: 3,
        torchSide: 'end',
      });
    });

    it("should complete when slowest Person starts at the other side", () => {
      // In this case, it should continue normally. We can essentially
      // ignore Calvin's presence in this execution.
      model.addPerson("Alfred", 3, 'start');
      model.addPerson("Borris", 7, 'start');
      model.addPerson("Calvin", 8, 'end');
      model.addPerson("Daniela", 2, 'start');
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 7,
        turnsElapsed: 1,
        torchSide: 'end',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
        ],
        timePassed: 9,
        turnsElapsed: 2,
        torchSide: 'start',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'end' },
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 12,
        turnsElapsed: 3,
        torchSide: 'end',
      });
    });

    it("should complete when slowest Person starts at the other side", () => {
      // In this case, we send Borris and Calvin, the two slowest, first.
      // This is because our fastest, Daniela, is already on the other side,
      // and we'll want to send her back with the torch anyway.
      // If we were to send Alfred, the second fastest, with Calvin, then
      // we'd still have to then send back Daniela and walk Borris over
      // with her, which is slower than sending Borris and Calvin at the
      // same time right at the start.
      model.addPerson("Alfred", 3, 'start');
      model.addPerson("Borris", 7, 'start');
      model.addPerson("Calvin", 8, 'start');
      model.addPerson("Daniela", 2, 'end');
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 8,
        turnsElapsed: 1,
        torchSide: 'end',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: false,
        successful: false,
        peopleAtStart: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'start' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'start' },
        ],
        peopleAtEnd: [
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
        ],
        timePassed: 10,
        turnsElapsed: 2,
        torchSide: 'start',
      });
      model.stepForward();
      expect(model.getState()).toEqual({
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [
          { id: 0, name: 'Alfred', crossTime: 3, side: 'end' },
          { id: 1, name: 'Borris', crossTime: 7, side: 'end' },
          { id: 2, name: 'Calvin', crossTime: 8, side: 'end' },
          { id: 3, name: 'Daniela', crossTime: 2, side: 'end' },
        ],
        timePassed: 13,
        turnsElapsed: 3,
        torchSide: 'end',
      });
    });

  });

});
