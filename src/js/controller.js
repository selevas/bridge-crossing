window.appController = function() {

  /**
   * Initializes the controller.
   *
   * This function is called by the view to initialize the model.
   *
   * @return void
   */
  this.init = () => {
    window.appModel.init();
    console.log( "Controller initialized!" );
  }

};

window.appController.call( window.appController );
