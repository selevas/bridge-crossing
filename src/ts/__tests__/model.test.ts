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

});
