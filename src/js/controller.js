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
   * Updates the state for a single view.
   *
   * @param {Object} view - The view to be updated.
   *
   * @return void
   */
  this.getUpdate = view => view.update( model.getState() );

  /**
   * Tells the model to reset.
   *
   * @return void
   */
  this.resetModel = () => broadcast( model.init() );

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
