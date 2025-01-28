import AppModel from '../model';

import {ValueError} from '../classes/Errors';

describe("Model", () => {

  let model: AppModel;

  describe("Setup and Configuration", () => {

    beforeEach(() => {
      model = new AppModel();
    });

    it("should assign default values upon instantiation of new AppModel object", () => {
      expect(model.getDefaultBridgeWidth()).toBe(2);
      expect(model.getDefaultPeople()).toEqual([
        { name: 'Louise', crossTime: 1, side: 'start' },
        { name: 'Mark', crossTime: 2, side: 'start' },
        { name: 'Anne', crossTime: 5, side: 'start' },
        { name: 'John', crossTime: 8, side: 'start' },
      ]);
      expect(model.getDefaultTorchSide()).toBe('start');
    });

    it("should return all defaults when the method getAllDefaults() is called", () => {
      expect(model.getAllDefaults()).toEqual({
        bridgeWidth: 2,
        people: [
          { name: 'Louise', crossTime: 1, side: 'start' },
          { name: 'Mark', crossTime: 2, side: 'start' },
          { name: 'Anne', crossTime: 5, side: 'start' },
          { name: 'John', crossTime: 8, side: 'start' },
        ],
        torchSide: 'start',
      });
    });

  });

  describe("Initialization", () => {

    beforeEach(() => {
      model = new AppModel();
    });

    it("should initialize to the default values and no people by default", () => {
      model.init();
      expect(model.getBridgeWidth()).toBe(2);
      expect(model.getPeopleAtStart().length).toBe(0);
      expect(model.getPeopleAtEnd().length).toBe(0);
      expect(model.getTorchSide()).toBe('start');
    });

    it("should initialize with the default set of people when specified", () => {
      model.init({includePeople: true});
      expect(model.getBridgeWidth()).toBe(2);
      expect(model.getPeopleAtStart()).toEqual([
        { id: 0, name: 'Louise', crossTime: 1, side: 'start' },
        { id: 1, name: 'Mark', crossTime: 2, side: 'start' },
        { id: 2, name: 'Anne', crossTime: 5, side: 'start' },
        { id: 3, name: 'John', crossTime: 8, side: 'start' },
      ]);
      expect(model.getPeopleAtEnd().length).toBe(0);
      expect(model.getTorchSide()).toBe('start');
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
      model.init();
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
      model.init({includePeople: true});
    });

    it("should get the model state", () => {
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
      model.init();
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

  });

});
