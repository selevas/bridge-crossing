window.appController = function() {

  const model = window.appModel;

  const subscribedViews = [];

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
  this.subscribe = view => {
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
  this.unsubscribe = view => {
    let index = null;
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
  const broadcast = data => {
    subscribedViews.forEach( view => view.update( JSON.parse(JSON.stringify(data)) ) );
  };

  /**
   * Sends the state to a single view.
   *
   * @param {Object} view - The view to be updated.
   *
   * @return void
   */
  this.sendUpdate = view => view.update( model.getState() );

  /**
   * Returns the state of the model.
   *
   * @return {Object} - The current state of the model.
   */
  this.getUpdate = () => model.getState();

  /**
   * Requests the bridge width from the model.
   *
   * @return {number} - The default bridge width.
   */
  this.getBridgeWidth = () => model.getDefaultBridgeWidth();

  /**
   * Tells the model to reset.
   *
   * @return void
   */
  this.resetModel = () => broadcast( model.init() );

  /**
   * Tells the model to add a person to its starting set.
   *
   * @return void
   */
  this.addPerson = (name, crossTime) => {
    model.addPerson(name, crossTime);
    broadcast( model.init() );
  }

  /**
   * Tells the model to remove a person from its starting set.
   *
   * @return void
   */
  this.removePerson = id => {
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
  this.movePerson = (personId, side) => {
    model.setPersonSide( personId, side );
    broadcast( model.getState() );
  };

  /**
   * Tells the model to set a new default bridge width.
   *
   * @return void
   */
  this.setBridgeWidth = bridgeWidth => {
    model.setBridgeWidth( bridgeWidth );
    broadcast( model.init() );
  }

  /**
   * Tells the model to step forward one turn.
   *
   * @return void
   */
  this.stepForward = () => broadcast( model.stepForward() );

  /**
   * Initializes the controller.
   *
   * This function is called by the view to initialize the model.
   *
   * @return void
   */
  this.init = () => {
    broadcast( model.init() );
  };

};

window.appController.call( window.appController );
