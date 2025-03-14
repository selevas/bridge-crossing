import type {
  Side,
  TimeInMinutes,
  PersonID,
  ModelState,
} from "./types";

import AppModel from './model';
import AppView from './view';

export default class AppController {

  #model: AppModel;
  #subscribedViews: AppView[];

  constructor(views: AppView[] = []) {
    this.#model = new AppModel();
    this.#model.init();
    this.#subscribedViews = [];
    for (const view of views) {
      this.subscribe(view);
    }
  }

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
  subscribe(view: AppView): void {
    this.#subscribedViews.push(view);
    view.update( this.#model.getState() );
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
  unsubscribe(view: AppView): void {
    const index: number = this.#subscribedViews.findIndex( (v: AppView) => v === view);
    if (index === -1) {
      return;
    }
    this.#subscribedViews.splice( index, 1 );
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
  #broadcast(data: ModelState): void {
    this.#subscribedViews.forEach( view => view.update( {...data} ) );
  };

  /**
   * Sends the state to a single view.
   *
   * @param {Object} view - The view to be updated.
   *
   * @return void
   */
  #sendUpdate(view: AppView): void {
    return view.update( this.#model.getState() );
  }

  /**
   * Returns the state of the model.
   *
   * @return {Object} - The current state of the model.
   */
  #getUpdate(): ModelState {
    return this.#model.getState();
  }

  /**
   * Requests the bridge width from the model.
   *
   * @return {number} - The default bridge width.
   */
  #getBridgeWidth(): number {
    return this.#model.getBridgeWidth();
  }

  /**
   * Tells the model to reset.
   *
   * @return void
   */
  resetModel(): void {
    this.#broadcast( this.#model.init() );
  }

  /**
   * Tells the model to add a person to its starting set.
   *
   * @return void
   */
  addPerson(name: string, crossTime: TimeInMinutes): void {
    this.#model.addPerson(name, crossTime);
    this.#broadcast( this.#model.init() );
  }

  /**
   * Tells the model to remove a person from its starting set.
   *
   * @param {PersonID} id - The ID of the person to remove.
   *
   * @return void
   */
  removePerson(id: PersonID): void {
    this.#model.removePerson(id);
    this.#broadcast( this.#model.init() );
  }

  /**
   * Moves the specified person to the specified side.
   *
   * @param {number} personId - The ID of the person to move, based on his index in the model's current array.
   * @param {string} side - The side to move the person to. Accepts 'start' or 'end'.
   *
   * @return void
   */
  movePerson(personId: PersonID, side: Side): void {
    this.#model.setPersonSide( personId, side );
    this.#broadcast( this.#model.getState() );
  };

  /**
   * Tells the model to set a new default bridge width.
   *
   * @return void
   */
  setBridgeWidth(bridgeWidth: number): void {
    this.#model.setBridgeWidth( bridgeWidth );
    this.#broadcast( this.#model.init() );
  }

  /**
   * Tells the model to step forward one turn.
   *
   * @return void
   */
  stepForward(): void {
    this.#broadcast( this.#model.stepForward() );
  }

  /**
   * Initializes the controller.
   *
   * This function is called by the view to initialize the model.
   *
   * @return void
   */
  init(): void {
    this.#broadcast( this.#model.init() );
  };

};
