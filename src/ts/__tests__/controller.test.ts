import AppController from '../controller';
import AppView from '../view';

console.log = jest.fn();

describe("Controller", () => {

  let controller: AppController;
  let views: AppView[];

  describe("Setup and configuration", () => {

    beforeEach(() => {
      views = [
        {update: jest.fn()},
        {update: jest.fn()},
        {update: jest.fn()},
      ];
    });

    it("should automatically subscribe views passed to its constructor", () => {
      controller = new AppController([views[0], views[2]]);
      const state = {
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [],
        timePassed: 0,
        turnsElapsed: 0,
        torchSide: 'start',
      };
      expect(views[0].update).toHaveBeenCalledWith(state);
      expect(views[1].update).not.toHaveBeenCalled();
      expect(views[2].update).toHaveBeenCalledWith(state);
    });

    it("should no longer broadcast to unsubscribed views", () => {
      controller = new AppController([...views]);
      const state = {
        finalState: true,
        successful: true,
        peopleAtStart: [],
        peopleAtEnd: [],
        timePassed: 0,
        turnsElapsed: 0,
        torchSide: 'start',
      };
      expect(views[0].update).toHaveBeenCalledWith(state);
      expect(views[1].update).toHaveBeenCalledWith(state);
      expect(views[2].update).toHaveBeenCalledWith(state);
      controller.unsubscribe(views[1]);
      controller.unsubscribe(views[0]);
      controller.stepForward();
      expect(views[0].update).toHaveBeenCalledTimes(1);
      expect(views[1].update).toHaveBeenCalledTimes(1);
      expect(views[2].update).toHaveBeenCalledTimes(2);
    });

  });

});
