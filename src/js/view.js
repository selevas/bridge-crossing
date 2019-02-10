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
  let currentTimeoutObject = null;
  let timer = 0;
  let timerInterval = 100;
  let timerIntervalObject = null;
  let pausedBridgePercentage = null;
  let pausedYBridgePosition = null;

  let isPlaying = false;
  let isPaused = false;
  let finalState = false;

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
   * @property {HTMLElement} settings - The wrapper for the application's various settings controls.
   * @property {HTMLElement} resetButton - The button to reset the application.
   * @property {HTMLElement} startButton - The button to start the application.
   * @property {HTMLElement} pauseButton - The button to pause the application.
   * @property {HTMLElement} dataDisplay - The wrapper for the application's various data displays.
   * @property {HTMLElement} timer - The total time passed for the current run.
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

  //let orientation;


  // Getters


  this.getIsPlaying = () => isPlaying;
  this.getIsPaused = () => isPaused;

  this.getPeople = () => people;

  this.getPeopleToCross = () => peopleToCross;

  this.getStage = () => stage;

  this.getTimePassed = () => timePassed;
  this.getTimeToCross = () => timeToCross;

  this.getXBridgePositions = () => xBridgePositions;

  this.getTimerInterval = () => timerInterval;

  this.getPausedBridgePercentage = () => pausedBridgePercentage;
  this.getPausedYBridgePosition = () => pausedYBridgePosition;


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
      color: `rgb(${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)}, ${Math.floor(Math.random()*255)})`,
    };
    newPerson.element.classList.add('person');
    newPerson.element.style.backgroundColor = newPerson.color;
    newPerson.element.style.height = dimensions.personHeight + 'px';
    newPerson.element.style.width = dimensions.personWidth + 'px';
    newPerson.element.setAttribute( 'data-id', id );
    el.mainView.appendChild( newPerson.element );
    // TODO: Generate appearance
    return newPerson;
  };

  this.isOverStart = (x, y) => {
    const bounds = el.start.getBoundingClientRect();
    return ( x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height );
  }

  this.isOverEnd = (x, y) => {
    const bounds = el.end.getBoundingClientRect();
    return ( x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height );
  };

  this.enableDraggable = (person) => {
    if ( person == null ) return;
    let oldX = ( person.side === 'start' ? person.xStartPos : person.xEndPos );
    let oldY = ( person.side === 'start' ? yStartPos : yEndPos );
    let newX, newY;
    person.element.addEventListener( 'mousedown', event => {
      console.log( event );
      if ( timePassed !== 0 ) this.reset( event );
      oldX = event.clientX;
      oldY = event.clientY;
      document.onmousemove = e => {
        e = e || window.event;
        e.preventDefault();
        newX = oldX - e.clientX;
        newY = oldY - e.clientY;
        oldX = e.clientX;
        oldY = e.clientY;
        person.element.style.left = (person.element.offsetLeft - newX) + 'px';
        person.element.style.top = (person.element.offsetTop - newY) + 'px';
      };
      document.onmouseup = e => {
        document.onmousemove = null;
        document.onmouseup = null;
        console.log( "Mouse up!", e );
        console.log( el.end.getBoundingClientRect() );
        console.log( "Side: ", person.side );
        if ( person.side === 'start' && this.isOverEnd(e.clientX, e.clientY) ) {
          // If the mouse ends inside the end, move the person there
          controller.movePerson( person.id, 'end' );
        }
        else if ( person.side === 'end' && this.isOverStart(e.clientX, e.clientY) ) {
          // If the mouse ends inside the start, move the person there
          controller.movePerson( person.id, 'start' );
        }
        // In any case, remove the left and top offsets of the person element.
        person.element.style.left = '0';
        person.element.style.top = '0';
        return;
      };
    });
  }

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
   * Initiates the next stage for people crossing the bridge.
   *
   * TODO: It first assigns who will get to carry the torch.
   *
   * 
   */
  this.cross = () => {
    if ( isPaused ) return;
    console.log( "Timeout: ", currentTimeoutObject );
    clearTimeout( currentTimeoutObject );
    switch ( stage ) {
      case 0:
        console.log( "Stage 1" );
        stage = 1;
        peopleToCross.forEach( (person, index) => this.move( person, index ) );
        currentTimeoutObject = setTimeout( () => this.cross(), timeToBeginCrossing + 100 );
        break;
      case 1:
        console.log( "Stage 2" );
        stage = 2;

        let timeToCrossRemaining, timerIntervalRemaining;
        if ( pausedBridgePercentage == null ) {
          timeToCrossRemaining = timeToCross;
        }
        else {
          timeToCrossRemaining = timeToCross * pausedBridgePercentage;
        }

        console.log( "timerIntervalRemaining: ", timerIntervalRemaining );

        peopleToCross.forEach( (person, index) => this.move( person, index, timeToCrossRemaining ) );
        timerIntervalObject = setInterval( this.incrementTimer, timerInterval );
        currentTimeoutObject = setTimeout( () => this.cross(), timeToCrossRemaining + 100 );
        pausedYBridgePosition = null;
        pausedBridgePercentage = null;
        break;
      case 2:
        console.log( "Stage 3" );
        stage = 3;
        peopleToCross.forEach( (person, index) => this.move( person, index ) );
        currentTimeoutObject = setTimeout( () => this.cross(), timeToFinishCrossing + 100 );
        break;
      case 3:
        console.log( "Stage 0" );
        if ( isPlaying && ! finalState ) {
          stage = 0;
          peopleToCross.forEach( (person, index) => (person.side === 'start' ? person.side = 'end' : person.side = 'start') );
          controller.stepForward();
        }
        break;
    }
  };

  this.move = (person, index, duration = null) => {
    let yPos, xPos;
    switch ( stage ) {
      case 0:
        yPos = ( person.side === 'start' ? yStartPos : yEndPos );
        xPos = ( person.side === 'start' ? person.xStartPos : person.xEndPos );
        person.element.style.transition = null;
        person.element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        break;
      case 1:
        yPos = ( person.side === 'start' ? yStartBridgePos : yEndBridgePos );
        person.element.style.transition = `transform ${duration == null ? timeToBeginCrossing : duration}ms ease-in 0s`;
        person.element.style.transform = `translate3d(${xBridgePositions[index]}px, ${yPos}px, 0)`;
        break;
      case 2:
        // If pausedYBridgePosition isn't null, then it means we just paused and the people should be
        // set to that position on the bridge.
        // Otherwise, move them to whichever end of the bridge they are headed.

        if ( isPaused ) yPos = pausedYBridgePosition;
        else            yPos = person.side === 'start' ? yEndBridgePos : yStartBridgePos;
        
        let timeToCrossRemaining;
        if ( duration != null ) timeToCrossRemaining = duration;
        else                    timeToCrossRemaining = timeToCross;

        person.element.style.transition = `transform ${duration == null ? timeToCrossRemaining : duration}ms linear 0s`;
        person.element.style.transform = `translate3d(${xBridgePositions[index]}px, ${yPos}px, 0)`;
        break;
      case 3:
        yPos = ( person.side === 'start' ? yEndPos : yStartPos );
        xPos = ( person.side === 'start' ? person.xEndPos : person.xStartPos );
        person.element.style.transition = `transform ${duration == null ? timeToFinishCrossing : duration}ms ease-out 0s`;
        person.element.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        break;
    }
  };

  this.incrementTimer = () => {
    timer += timerInterval;
    if ( timer >= timePassed ) {
      timer = timePassed;
      clearInterval( timerIntervalObject );
    }
    el.timer.textContent = timer / 1000;
  }

  this.reset = event => {
    isPlaying = false;
    isPaused = false;
    stage = 0;
    controller.resetModel();
  };

  this.start = event => {
    if ( isPaused ) {
      isPaused = false;
      this.cross();
      return;
    }
    
    // Only initiate the cross if the application either hasn't started a run yet
    // or has already finished one.
    // If you want to reset the run, the user should press the reset button.
    if ( finalState ) {
      isPlaying = false;
      this.reset();
      setTimeout( this.start, 100 );
      return;
    }
    
    if ( timePassed === 0 ) {
      isPlaying = true;
      stage = 3;
      this.cross();
    }
  };

  this.pause = event => {
    if ( ! isPlaying || isPaused ) return;
    isPaused = true;
    clearTimeout( currentTimeoutObject );
    switch ( stage ) {
      case 0:
        // this probably shouldn't happen since stage 0 doesn't have a duration
        stage = 3;
        break;
      case 1:
      case 3:
        // set the stage back to the previous one
        stage--;
        // instantly move them back to their starting positions for the stage, since that portion
        // of time isn't being tracked by the timer.
        peopleToCross.forEach( (person, index) => this.move( person, index, 0 ) );
        break;
      case 2:
        // this is the stage where they are crossing the bridge and the timer is going
        clearInterval( timerIntervalObject );
        pausedBridgePercentage = ( timePassed - timer ) / timeToCross;
        pausedYBridgePosition = dimensions.startHeight + el.bridge.clientHeight - ( el.bridge.clientHeight * (peopleToCross[0].side === 'start' ? pausedBridgePercentage : 1 - pausedBridgePercentage) );
        peopleToCross.forEach( (person, index) => this.move( person, index, 0 ) );
        stage--;
        break;
    }    
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

    console.log( state );

    finalState = state.finalState;

    if ( state.timePassed === 0 ) {
      timePassed = 0;
      timer = 0;
      el.timer.textContent = '0';
    }

    modelPeople = state.peopleAtStart.concat( state.peopleAtEnd ).sort( (a, b) => a.id - b.id );
    people.sort( (a, b) => a.id - b.id );
    const newPeople = [];
    peopleToCross.length = 0;

    let i = 0, j = 0;

    console.log( modelPeople );
    console.log( people );

    // Determine if there are differences between the model and the view in terms of
    // people, and reconcile any differences.
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
          if ( isPlaying ) peopleToCross.push( people[j] );
          else             people[j].side = modelPeople[i].side;
        }
        i++; j++;
      }
    }

    if ( newPeople.length > 0 ) {
      people = people.concat( newPeople ).sort( (a, b) => a.id - b.id );
      this.refreshXPositions();
      people.forEach( this.enableDraggable );
    }

    // stage should be set to zero here, because if we receive an update from the model while we're in
    // some other stage, it should reset the crossing. Pausing and resuming is a view-only mechanism,
    // and should never need to request an update from the model.
    stage = 0;

    // If it's not currently playing, then reset everyone to the positions given in the update.
    if ( ! isPlaying ) people.forEach( person => this.move( person, 0, 0 ) );

    // Otherwise, if it is playing, set up the X bridge positions based on how many are
    // crossing, increment the total time passed, and initiate the next crossing.
    if ( isPlaying && peopleToCross.length > 0 ) {
      xBridgePositions.length = 0;
      let xIncrement = dimensions.bridgeWidth / ( peopleToCross.length + 1 );
      let xPos = ( ( dimensions.mainViewWidth - dimensions.bridgeWidth ) / 2 ) + xIncrement - ( dimensions.personWidth / 2);
      for ( let i = 0; i < peopleToCross.length; i++ ) {
        xBridgePositions.push( xPos );
        xPos += xIncrement;
      }
      timeToCross = state.timePassed * 1000 - timePassed;
      timePassed = state.timePassed * 1000;
      this.cross();
    }
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
  (() => {

    let loadView = new Promise( resolve => {

      // Generation of HTML elements.

      // Note that el.people isn't added yet. We need to wait until the model
      // sends the initialized state before we know how many people to generate.

      el.h1 = this.createTextElement( 'h1', 'Bridge Crossing' );
      el.mainView = document.createElement('div');
      el.bridge = document.createElement('div');
      el.start = document.createElement('div');
      el.end = document.createElement('div');
      el.settings = document.createElement('div');
      el.resetButton = this.createTextElement('button', 'Reset');
      el.startButton = this.createTextElement('button', 'Start');
      el.pauseButton = this.createTextElement('button', 'Pause');
      el.resumeButton = this.createTextElement('button', 'Resume');
      el.dataDisplay = document.createElement('div');
      el.timerLabel = this.createTextElement('div', 'Minutes Passed');
      el.timer = this.createTextElement('div', '0');

      // Assignment of classes

      el.mainView.classList.add('main-view');
      el.bridge.classList.add('bridge');
      el.start.classList.add('start');
      el.end.classList.add('end');
      el.settings.classList.add('settings');
      el.resetButton.classList.add('settings-button', 'settings-button-reset');
      el.startButton.classList.add('settings-button', 'settings-button-start');
      el.pauseButton.classList.add('settings-button', 'settings-button-pause');
      el.dataDisplay.classList.add('data-display');
      el.timerLabel.classList.add('data-display-timer-label');
      el.timer.classList.add('data-display-timer');

      // Assignment of ID attributes

      el.resetButton.setAttribute('id', 'reset');
      el.startButton.setAttribute('id', 'start');
      el.pauseButton.setAttribute('id', 'pause');

      // Assignment of inline styles

      el.mainView.style.width = dimensions.mainViewWidth + 'px';
      el.bridge.style.width = dimensions.bridgeWidth + 'px';
      el.start.style.height = dimensions.startHeight + 'px';
      el.start.style.width = dimensions.startWidth + 'px';
      el.end.style.height = dimensions.endHeight + 'px';
      el.end.style.width = dimensions.endWidth + 'px';

      // Construction of the view's DOM

      el.app.appendChild( el.h1 );
      el.app.appendChild( el.mainView );
      el.mainView.appendChild( el.start );
      el.mainView.appendChild( el.bridge );
      el.mainView.appendChild( el.end );
      
      el.app.appendChild( el.settings );
      el.settings.appendChild( el.resetButton );
      el.settings.appendChild( el.startButton );
      el.settings.appendChild( el.pauseButton );

      el.app.appendChild( el.dataDisplay );
      el.dataDisplay.appendChild( el.timerLabel );
      el.dataDisplay.appendChild( el.timer );

      // Event Listeners

      el.resetButton.addEventListener( 'click', event => {
        event.preventDefault();
        this.reset( event );
      });

      el.startButton.addEventListener( 'click', event => {
        event.preventDefault();
        this.start( event );
      });

      el.pauseButton.addEventListener( 'click', event => {
        event.preventDefault();
        this.pause( event );
      });

      // TODO: Make this a function, so that dimensions can be recalculated later,
      // perhaps based on a screen resize, etc.
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
