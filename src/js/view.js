window.appView = function() {

  /**
   * Alias for window.appController, so I don't have to type it out every time
   * I want to send something its way.
   */
  const controller = window.appController;

  /**
   * A person object.
   *
   * @typedef {Object} Person
   * @property {Object} appearance - The object containing appearance values. Colors are stored as 6-digit hexidecimal values.
   * @property {string} [appearance.color] - The color of the person. Only used if people are dots.
   * @property {string} [appearance.skinColor] - The color of the person's skin.
   * @property {string} [appearance.hairColor] - The color of the person's hair.
   * @property {string} [appearance.shirtColor] - The color of the person's shirt.
   * @property {string} [appearance.pantsColor] - The color of the person's pants.
   * @property {string} element - The element corresponding to the person.
   * @property {string} name - The person's name.
   * @property {string} side - The side the person is on.
   * @property {number} xStartPos - The X position of the element at the start, relative to the main view.
   * @property {number} xEndPos - The X position of the element at the end, relative to the main view.
   */

  let people = [];

  const peopleToCross = [];
  const timeToBeginCrossing = 500;
  const timeToFinishCrossing = 500;
  let timePassed = 0;
  let timeToCross = 0;
  let stage = 0;

  const xBridgePositions = [];

  let yStartPos;
  let yStartBridgePos;
  let yEndPos;
  let yEndBridgePos;

  /**
   * The elements object.
   *
   * Stores all the DOM elements that need to be manipulated in some way.
   *
   * Most properties of el will be added during the execution of the start()
   * function, but they are listed below for reference.
   *
   * @property {HTMLElement} app - The top-level element of the application (body).
   * @property {HTMLElement} h1 - The title element.
   * @property {HTMLElement} mainView - The area enclosing all buttons and interactive content.
   * @property {HTMLElement} bridge - The element representing the bridge.
   * @property {HTMLElement} start - The element representing the start area.
   * @property {HTMLElement} end - The element representing the end area.
   * @property {HTMLElement[]} people - The elements representing each person.
   * @property {HTMLElement} coordsLayer - The coordinates layer for the main view. When switching to horizontal, it is rotated 90 degrees, thus keeping animation coordinates correct.
   * @property {HTMLElement} settings - The wrapper for the application's various settings controls.
   * @property {HTMLElement} resetButton - The button to reset the application.
   * @property {HTMLElement} startButton - The button to start the application.
   * @property {HTMLElement} pauseButton - The button to pause the application.
   */
  const el = {
    app: document.getElementById('app'),
  };

  const dimensions = {
    mainViewWidth: 300,
    bridgeWidth: 150,
    startHeight: 100,
    startWidth: 300,
    endHeight: 100,
    endWidth: 300,
    personHeight: 40,
    personWidth: 40,
  };

  let isPlaying = false;

  //let orientation;


  // Getters


  this.getPeople = () => people;


  // Actions


  this.createTextElement = (tagName, text = null) => {
    const ele = document.createElement( tagName );
    if ( text != null && text !== '' ) ele.appendChild( document.createTextNode( text ) );
    return ele;
  };

  /**
   * Creates a new person for the view.
   *
   * @param {number} id - The ID of the person assigned by the model.
   * @param {string} name - The name of the person.
   * @param {string} side - The side the person is currently on.
   *
   * @return {Person} - The newly created person.
   */
  this.createPerson = (id, name, side) => {
    const newPerson = {
      id: id,
      name: name,
      side: side,
      element: document.createElement('div'),
      color: Math.floor( Math.random()*16777215 ).toString(16),
    };
    newPerson.element.classList.add('person');
    newPerson.element.style.backgroundColor = '#' + newPerson.color;
    newPerson.element.style.height = dimensions.personHeight + 'px';
    newPerson.element.style.width = dimensions.personWidth + 'px';
    el.mainView.appendChild( newPerson.element );
    // TODO: Generate appearance
    return newPerson;
  };

  this.refreshXPositions = () => {
    const xStartIncrement = dimensions.startWidth / ( people.length + 1 );
    let xStartPos = ( ( dimensions.mainViewWidth - dimensions.startWidth ) / 2 ) + xStartIncrement - ( dimensions.personWidth / 2 );
    const xEndIncrement = dimensions.endWidth / ( people.length + 1 );
    let xEndPos = ( ( dimensions.mainViewWidth - dimensions.endWidth ) / 2 ) + xEndIncrement - ( dimensions.personWidth / 2 );
    people.forEach( person => {
      person.xStartPos = xStartPos;
      person.xEndPos = xEndPos;
      xStartPos += xStartIncrement;
      xEndPos += xEndIncrement;
    });
  };

  /**
   * Rotates the orientation of the main view.
   *
   * If the orientation parameter is supplied, it will set the rotation to
   * match. Otherwise, it will toggle the rotation between horizontal and
   * vertical.
   *
   * @param {string} [newOrientation] - Which orientation to rotate the main view to. Accepts 'horizontal' or 'vertical'.
   *
   * @return {string} - The new orientation.
   */
  /*this.rotate = (newOrientation = null) => {
    if ( newOrientation === null ) newOrientation = (orientation === 'horizontal' ? 'vertical' : 'horizontal');
    if ( newOrientation === 'horizontal' ) {
      el.mainView.style.height = `${el.app.clientWidth}px`;
      el.mainView.style.transform = 'rotate3d(0,0,1,-90deg)';
    }
    else if ( newOrientation === 'vertical' ) {
      el.mainView.style.height = `${el.app.clientHeight}px`;
      el.mainView.style.transform = null;
    }
    else {
      throw 'invalid_orientation';
    }
    orientation = newOrientation;
    return newOrientation;
  };*/

  /**
   * Checks the size of the body and returns the optimal orientation of the app.
   *
   * If the body is shorter than 500 pixels, then a vertical orientation
   * probably won't fit very well, and so 'horizontal' is returned. However, if
   * the width is less than the height, even when the height is less than 500
   * pixels, then it should still maintain vertical orientation, albeit scaled
   * down.
   *
   * @return {string} - 'horizontal' or 'vertical'
   */
  /*this.getOptimalOrientation = () => {
    if ( el.app.clientHeight < 500 && el.app.clientWidth >= el.app.clientHeight ) return 'horizontal';
    return 'vertical';
  };*/

  /**
   * Initiates a crossing of people across the bridge.
   *
   * It first assigns who will get to carry the torch.
   *
   * TODO: Describe the rest of the function.
   */
  this.startAcross = () => {
    stage = 1;
    peopleToCross.forEach( (person, index) => this.move( person, index ) );
    setTimeout( this.crossingStageComplete, timeToBeginCrossing );
  };

  this.crossingStageComplete = () => {
    console.log( "Crossing Stage Complete: showing 'this'" );
    console.log( this );
    switch ( stage ) {
      case 1:
        stage = 2;
        peopleToCross.forEach( (person, index) => this.move( person, index ) );
        setTimeout( this.crossingStageComplete, timeToCross * 1000 );
        break;
      case 2:
        stage = 3;
        peopleToCross.forEach( (person, index) => this.move( person, index ) );
        setTimeout( this.crossingStageComplete, timeToFinishCrossing );
        break;
      case 3:
        stage = 0;
        if ( isPlaying ) controller.stepForward();
        break;
    }
  };

  this.move = (person, index) => {
    let yPos, xPos;
    switch ( stage ) {
      case 1:
        yPos = ( person.side === 'start' ? yStartBridgePos : yEndBridgePos );
        person.element.style.transition = `transform ${timeToBeginCrossing}ms ease-in 0s`;
        person.element.style.transform = `translate3d(${xBridgePositions[index]}px, ${yPos}px, 0)`;
        break;
      case 2:
        yPos = ( person.side === 'start' ? yEndBridgePos : yStartBridgePos );
        person.element.style.transition = `transform ${timeToCross}s linear 0`;
        person.element.style.transform = `translate3d(${xBridgePositions[index]}px, ${yPos}px, 0)`;
        break;
      case 3:
        yPos = ( person.side === 'start' ? yEndPos : yStartPos );
        xPos = ( person.side === 'start' ? person.xEndPos : person.xStartPos );
        person.element.style.transition = `transform ${timeToFinishCrossing}ms ease-out 0s`;
        person.element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        break;
    }
  };

  /**
   * Initiates the next translation for the given person.
   *
   * This function fires on the transitionend event attached to the main view.
   * It 
  const nextMove = event => {

  };

  /**
   * Updates the view.
   *
   * This is the function called by the controller each time the model updates
   * its state.
   *
   * It first compares its people to the model's. If there are any in the view
   * not in the model, it removes them and their elements. If there are any in
   * the model that are not in the view, it adds them to the view.
   *
   * @param {object} state - The object containing model state information.
   *
   * TODO: Add model properties to @param list
   *
   * @return void
   */
  this.update = state => {

    console.log( "View now updating!" );

    console.log( state );

    if ( state.timePassed === 0 ) timePassed = 0;

    modelPeople = state.peopleAtStart.concat( state.peopleAtEnd ).sort( (a, b) => a.id - b.id );
    people.sort( (a, b) => a.id - b.id );
    const newPeople = [];
    peopleToCross.length = 0;

    let i = 0, j = 0;

    while ( i < modelPeople.length || j < people.length ) {
      if ( j >= people.length || modelPeople[i].id < people[j].id ) {
        // model has a person view doesn't, therefore add it
        newPeople.push( this.createPerson( modelPeople[i].id, modelPeople[i].name, modelPeople[i].side ) );
        i++;
      }
      else if ( i >= modelPeople.length || modelPeople[i].id > people[j].id ) {
        // view has a person model doesn't, therefore delete it
        people.splice(j, 1);
        j++;
      }
      else {
        // same person; compare side to view to determine if person needs to cross
        if ( modelPeople[i].side !== people[j].side ) {
          peopleToCross.push( people[j] );
        }
        i++; j++;
      }
    }

    if ( newPeople.length > 0 ) {
      people = people.concat( newPeople ).sort( (a, b) => a.id - b.id );
      this.refreshXPositions();
    }

    if ( isPlaying && peopleToCross.length > 0 ) {
      xBridgePositions.length = 0;
      let xIncrement = dimensions.bridgeWidth / ( peopleToCross.length + 1 );
      let xPos = ( ( dimensions.mainViewWidth - dimensions.bridgeWidth ) / 2 ) + xIncrement - ( dimensions.personWidth / 2);
      for ( let i = 0; i < peopleToCross.length; i++ ) {
        xBridgePositions.push( xPos );
        xPos += xIncrement;
      }
      timeToCross = state.timePassed - timePassed;
      this.startAcross();
    }

    console.log( "View updated!" );
  };

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
      el.h1 = this.createTextElement( 'h1', 'Bridge Crossing' );
      el.mainView = document.createElement('div');
      el.bridge = document.createElement('div');
      el.start = document.createElement('div');
      el.end = document.createElement('div');
      el.coordsLayer = document.createElement('div');
      el.settings = document.createElement('div');
      el.resetButton = this.createTextElement('button', 'Reset');
      el.startButton = this.createTextElement('button', 'Start');
      el.pauseButton = this.createTextElement('button', 'Pause');

      // Note that el.people isn't added yet. We need to wait until the model
      // sends the initialized state before we know how many people to generate.

      el.mainView.classList.add('main-view');
      el.bridge.classList.add('bridge');
      el.start.classList.add('start');
      el.end.classList.add('end');
      el.coordsLayer.classList.add('main-view-coords-layer');
      el.settings.classList.add('settings');
      el.resetButton.classList.add('settings-button');
      el.startButton.classList.add('settings-button');
      el.pauseButton.classList.add('settings-button');

      el.resetButton.setAttribute('id', 'reset');

      el.mainView.style.width = dimensions.mainViewWidth + 'px';
      el.bridge.style.width = dimensions.bridgeWidth + 'px';
      el.start.style.height = dimensions.startHeight + 'px';
      el.start.style.width = dimensions.startWidth + 'px';
      el.end.style.height = dimensions.endHeight + 'px';
      el.end.style.width = dimensions.endWidth + 'px';

      el.app.appendChild( el.h1 );
      el.app.appendChild( el.mainView );
      el.mainView.appendChild( el.start );
      el.mainView.appendChild( el.bridge );
      el.mainView.appendChild( el.end );
      el.mainView.appendChild( el.coordsLayer );
      
      el.app.appendChild( el.settings );
      el.settings.appendChild( el.resetButton );
      el.settings.appendChild( el.startButton );
      el.settings.appendChild( el.pauseButton );

      el.app.addEventListener( 'transitionend', event => {

      });

      yStartPos = ( dimensions.startHeight / 2 ) - ( dimensions.personHeight / 2 ) ;
      yStartBridgePos = dimensions.startHeight - ( dimensions.personHeight / 2 );
      yEndBridgePos = el.mainView.clientHeight - dimensions.endHeight - ( dimensions.personHeight / 2 );
      yEndPos = el.mainView.clientHeight - ( dimensions.endHeight / 2 ) - ( dimensions.personHeight / 2 );

      setTimeout( () => { resolve('The view is ready!'); }, 500 );
    });

    (async () => {
      controller.init();
      await loadView;
      // subscribing to the controller lets the view receive model updates
      controller.subscribe( this );
    })();

  })(); // fire this as soon as it is declared

};
