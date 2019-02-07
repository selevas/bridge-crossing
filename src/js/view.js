window.appView = function() {

  /**
   * Alias for window.appController, so I don't have to type it out every time
   * I want to send something its way.
   */
  const controller = window.appController;

  /**
   * Starts the view.
   *
   * This function is called by the DOM once it has finished loading. It should
   * show a loading screen or something similar to keep the user at least
   * partially entertained while the program gets ready. Of course, this isn't
   * really necessary for a program of this size, but I'm designing it with
   * scalability in mind.
   *
   * Once the function finishes, it will call the controller's init() function,
   * which will in turn initialize the model.
   *
   * @return void
   */
  (this.start = () => {

    let loadView = new Promise( resolve => {

      // TODO: Set up basic view + loading animation

      // This setTimeout is to confirm that the view's initialization is
      // properly waiting for the promise to resolve.
      // Delete it when we're done setting up this.start().
      setTimeout( () => { resolve('Time is up!'); }, 3000 );
    });

    (async () => {
      // call the controller's init() function while the view loads
      const model = await controller.init();
      // wait for the view to finish loading, if it hasn't already
      await loadView;
      this.init( model );
    })();

  })(); // fire this as soon as it is declared

  /**
   * Initializes the view.
   *
   * This function initializes the view based on the state of the model that is
   * passed to it. The view always begins paused.
   *
   * This function may be called multiple times during the course of the
   * application's lifetime, particularly when the model is reset.
   *
   * @param {object} model - The object containing model state information.
   *
   * TODO: Add model properties to @param list
   *
   * @return void
   */
  this.init = model => {

    // TODO: Add initialization code

    console.log( "View initialized!" );
  };

  // TODO: Implement view

};
