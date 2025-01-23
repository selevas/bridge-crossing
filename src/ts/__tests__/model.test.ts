import AppModel from '../model';

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

  });

});
