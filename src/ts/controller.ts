import type {
  Side,
  TimeInMinutes,
  ModelState,
  View,
} from "./types";

import AppModel from 'model';

window.appController = function(): void {

  const model: AppModel = new AppModel();

  const subscribedViews: View[] = [];

  /**
   * Adds a view to the subscription list.
   *
   * This is the mechanism by which views sign up to receive updates from the
   * model. Upon subscribing, they are immediately provided with the current
   * state of the model.
   *
   * The only requirement is that the view object must have an update()
   * function.
   *
   * @param {Object} view - The newly subscribing view.
   *
   * @return void
   */
  this.subscribe = (view: View): void => {
    subscribedViews.push(view);
    view.update( model.getState() );
  };

  /**
   * Removes a view from the subscription list.
   *
   * @see window.appController.subscribe()
   *
   * @param {Object} view - The view to be removed.
   *
   * @return void
   */
  this.unsubscribe = (view: View): void => {
    // TODO: Double check this function... it doesn't seem right.
    let index: number;
    subscribedViews.find( (v, i) => { index = i; return v === view; } );
    subscribedViews.splice( index, 1 );
  };

  /**
   * Broadcasts data to all registered views.
   *
   * This permits a single change to the model to update multiple views that
   * have subscribed to the controller.
   *
   * A separate copy of the state data is sent to each view, so that one view
   * cannot alter the copy of another.
   *
   * @private
   *
   * @param {Object} state - The new state of the model.
   *
   * @return void
   */
  const broadcast = (data: ModelState): void => {
    // TODO: Change the stringify/parse into spread operator.
    subscribedViews.forEach( view => view.update( JSON.parse(JSON.stringify(data)) ) );
  };

  /**
   * Sends the state to a single view.
   *
   * @param {Object} view - The view to be updated.
   *
   * @return void
   */
  this.sendUpdate = (view: View): void => view.update( model.getState() );

  /**
   * Returns the state of the model.
   *
   * @return {Object} - The current state of the model.
   */
  this.getUpdate = (): ModelState => model.getState();

  /**
   * Requests the bridge width from the model.
   *
   * @return {number} - The default bridge width.
   */
  this.getBridgeWidth = (): number => model.getDefaultBridgeWidth();

  /**
   * Tells the model to reset.
   *
   * @return void
   */
  this.resetModel = (): void => broadcast( model.init() );

  /**
   * Tells the model to add a person to its starting set.
   *
   * @return void
   */
  this.addPerson = (name: string, crossTime: TimeInMinutes): void => {
    model.addPerson(name, crossTime);
    broadcast( model.init() );
  }

  /**
   * Tells the model to remove a person from its starting set.
   *
   * @return void
   */
  this.removePerson = (id: number): void => {
    model.removePerson(id);
    broadcast( model.init() );
  }

  /**
   * Moves the specified person to the specified side.
   *
   * @param {number} personId - The ID of the person to move, based on his index in the model's current array.
   * @param {string} side - The side to move the person to. Accepts 'start' or 'end'.
   *
   * @return void
   */
  this.movePerson = (personId: number, side: Side): void => {
    model.setPersonSide( personId, side );
    broadcast( model.getState() );
  };

  /**
   * Tells the model to set a new default bridge width.
   *
   * @return void
   */
  this.setBridgeWidth = (bridgeWidth: number): void => {
    model.setBridgeWidth( bridgeWidth );
    broadcast( model.init() );
  }

  /**
   * Tells the model to step forward one turn.
   *
   * @return void
   */
  this.stepForward = (): void => broadcast( model.stepForward() );

  /**
   * Initializes the controller.
   *
   * This function is called by the view to initialize the model.
   *
   * @return void
   */
  this.init = (): void => {
    broadcast( model.init() );
  };

};

window.appController.call( window.appController );
