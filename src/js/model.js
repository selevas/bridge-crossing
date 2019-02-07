window.appModel = function() {

  /**
   * Initializes the model.
   *
   * This function should be called whenever the user wishes to reset the
   * program, including at the very beginning when the program first loads.
   *
   * @return void
   */
  this.init = () => {
    console.log( "Model initialized!" );
  }

};

window.appModel.call( window.appModel );
