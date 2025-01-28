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

  });

});
