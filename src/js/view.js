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

  /**
   * The array of currently active people. It is updated to match the model every
   * time the view receives an update from the model.
   *
   * It is always kept sorted from lowest crossTime to highest crossTime, so that
   * the fastest person is always people[0].
   */
  let people = [];

  /**
   * The list of people who are set to cross on this turn.
   *
   * It is populated by comparing the view's list of people against the model's
   * updated list of people. Any people who's sides do not match are added to
   * this array and prepped for animation.
   */
  const peopleToCross = [];

  /**
   * The amount of time (in milliseconds) for people to approach the bridge.
   *
   * This is a fixed time, since it does not factor into the total Time Passed
   * value in the corner of the screen.
   */
  const timeToBeginCrossing = 500;

  /**
   * The amount of time (in milliseconds) for people to leave the bridge.
   *
   * This is a fixed time, since it does not factor into the total Time Passed
   * value in the corner of the screen.
   */
  const timeToFinishCrossing = 500;

  /**
   * The total time passed (in simulated minutes) according to the model.
   *
   * This does not represent real time passed, only simulated time. Also, it is
   * stored in the view after being multiplied by 1000, so that it is more
   * consistent with the view's time interface (milliseconds being 1/1000th of a
   * second, and the view treats 1 simulates minute as equal to 1 real life
   * second).
   *
   * For example, if the model provides timePassed as 8, this value will be 8000.
   */
  let timePassed = 0;

  /**
   * The amount of time the current crossing takes to complete.
   *
   * Rather than being the total time passed, this is only the amount for this
   * turn. Like the timePassed variable above, it is stored as the value given
   * by the model times 1000. See timePassed for more information.
   *
   * @see timePassed
   */
  let timeToCross = 0;

  /**
   * The stage of animation for the current turn.
   *
   * The animation is performed in multiple stages:
   *
   * Stage 0: The animation begins by sending everybody who's going to cross to
   * the bridge. This is a fixed animation duration. The X positions that people
   * are sent to are based on the total number crossing the bridge. The Y
   * positions are based on the beginning edge of the bridge (depending on what
   * side the people are crossing from).
   *
   * Stage 1: The animation proceeds up or down the bridge. The X positions are
   * maintained, with the final Y positions being the opposite edge of the bridge.
   *
   * Stage 2: The animation sends people to their standard location off the bridge.
   * The Y position is the vertical center of either the start or end elements
   * (depending on what side they were headed to). The X positions are based on
   * the person's ID, with space being equally distributed between everybody.
   *
   * Stage 3: The animation is finished, and the view waits to receive the next
   * update from the model, at which point it calculates anew which people need
   * to cross and starts over at Stage 0.
   *
   * For details on the algorithm, feel free to examine the this.cross() and
   * this.move() functions.
   * 
   * @see this.cross()
   * @see this.move()
   */
  let stage = 0;

  /**
   * The current animation timeout object.
   *
   * This is the timeout that gets reset at every stage of the animation. If the
   * animation is paused, it is cleared. When the animation is resumed, and IF the
   * animation is on Stage 2, it gets reset with a duration calculated to be the
   * remainder of the bridge crossing. Otherwise, at any other stage, it simply
   * gets reset to the beginning of the stage.
   */
  let currentTimeoutObject = null;

  /**
   * The real time (in seconds) of the application's time that has passed.
   *
   * This is a view-specific value that is tracked by incrementing itself based
   * on the timerInterval variable. Unlike the model, it keeps track of time
   * passed down to a fraction of a second for a smooth, accurate reading in the
   * data display to the left of the view.
   */
  let timer = 0;

  /**
   * The period of the timer interval.
   *
   * This is how often (in milliseconds) that the timer updates. Settings it lower
   * will cause the timer to update more often. Setting it higher will cause it to
   * update less often.
   */
  let timerInterval = 100;

  /**
   * The current animation timer interval object.
   *
   * This is the interval object that updates the timer during Stage 2 of the
   * animation. If the animation is paused while on Stage 2, it is cleared. When
   * the animation is resumed while on Stage 2, it is recreated.
   */
  let timerIntervalObject = null;

  /**
   * The percentage of the bridge that has already been crossed.
   *
   * When the animation is paused during Stage 2, this variable is set. It is
   * a normalized value between 0 and 1, and is multiplied by timeToCross to
   * determine how long to set the animation timeout to when the animation is
   * resumed.
   */
  let pausedBridgePercentage = null;

  /**
   * The Y position of the people crossing the bridge when paused.
   *
   * When the animation is paused during Stage 2, this variable is set. It is used
   * to immediately move all people who are crossing to the position they should
   * be at at the time the animation is paused.
   */
  let pausedYBridgePosition = null;

  /**
   * Whether or not the application has been started.
   *
   * Note that the application can have both isPlaying and isPaused be true at
   * the same time. isPlaying only determines how the view behaves when it
   * receives an update from the model. If isPlaying is false, then receiving an
   * update from the model will update the view, but nothing more. If isPlaying
   * is true, then receiving an update from the model will not only update the
   * view, but it will also trigger the progress of the animation and lead to
   * further requests for the model to progress as the animations complete.
   */
  let isPlaying = false;

  /**
   * Whether the animation is paused or not.
   *
   * This has nothing to do with isPlaying, although it is generally only true if
   * isPlaying is already true. It indicates that the model is paused, so that
   * when the Start command is given, it will resume the animation.
   */
  let isPaused = false;

  /**
   * Whether the animation has reached its final state or not.
   *
   * If this is true, then the animation will not continue. The this.cross()
   * function will block further requests for the model to advance once it
   * reaches Stage 3.
   */
  let finalState = false;

  /**
   * The array of X positions for people crossing the bridge.
   *
   * This array is calculated every time people are sent across. Based on the
   * number of people crossing, it maintains an even distance across the breadth
   * of the bridge. For example, if a single person is crossing, he or she will
   * cross straight down the middle. If two people are crossing, they will walk
   * side by side at an equally distributed distance.
   */
  const xBridgePositions = [];

  /**
   * The vertical center of the Starting element.
   *
   * This is used in Stage 2 when repositioning people to their standard spot
   * after crossing the bridge.
   */
  let yStartPos;

  /**
   * The Y position of the top edge of the bridge.
   *
   * This is used in Stages 0 and 1 when sending people to the bridge, or sending
   * people across the bridge, depending on the direction they are headed.
   */
  let yStartBridgePos;

  /**
   * The vertical center of the Ending element.
   *
   * This is used in Stage 2 when repositioning people to their standard spot
   * after crossing the bridge.
   */
  let yEndPos;

  /**
   * The Y position of the bottom edge of the bridge.
   *
   * This is used in Stages 0 and 1 when sending people to the bridge, or sending
   * people across the bridge, depending on the direction they are headed.
   */
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
   * @property {HTMLElement} timerLabel - The label for the timer.
   * @property {HTMLElement} timer - The total time passed for the current run.
   * @property {HTMLElement} turnsLabel - The label for the turns elapsed.
   * @property {HTMLElement} turns - The total turns elapsed for the current run.
   * @property {HTMLElement} torchSideLabel - The label for which side the torch is on.
   * @property {HTMLElement} torchSide - Which side the torch is on.
   * @property {HTMLElement} finalStateLabel - The label for whether the final state of the run has been reached.
   * @property {HTMLElement} finalState - Whether the final state of the run has been reached.
   */
  const el = {
    app: document.getElementById('app'),
  };

  /**
   * Displays ongoing state information.
   *
   * This object implements its own update() function and subscribes to the
   * controller so that it receives updates along with the main view.
   */
  const dataDisplay = {
    update: state => {
      if ( finalState ) {
        el.finalState.textContent = 'YES';
        el.finalState.classList.remove('data-display-final-state--no');
        el.finalState.classList.add('data-display-final-state--yes');
      }
      else {
        el.finalState.textContent = 'NO';
        el.finalState.classList.remove('data-display-final-state--yes');
        el.finalState.classList.add('data-display-final-state--no');
      }

      // timePassed doesn't get set, since that actually relies on the main
      // view's interval timer to get down to the subsecond timing.

      el.torchSide.textContent = (state.torchSide === 'start' ? 'Start' : 'End');

      el.turns.textContent = state.turnsElapsed;


    }
  };



  /**
   * These are the dimensions of certain elements.
   *
   * These are used to calculate inline styles for certain elements, for
   * potential flexibility of layout down the road in the future.
   */
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


  // Getters


  /***
   * Note: A lot of these getters exist only for testing purposes. Most of them
   * aren't actually used (none of them, come to think of it), so they could be
   * removed down the road to clean up the code a bit.
   **/

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


  /**
   * A shortcut function for creating an element and appending a text node.
   *
   * @param {string} tagName - The type of the element to be created.
   * @param {string} [text] - The text to add to the element's text node.
   *
   * @return {HTMLElement} - The newly created HTML element.
   */
  this.createTextElement = (tagName, text = null) => {
    const ele = document.createElement( tagName );
    if ( text != null && text !== '' ) ele.appendChild( document.createTextNode( text ) );
    return ele;
  };

  /**
   * Creates a new person for the view.
   *
   * Note that this does NOT add the person to the people[] array. That is the
   * responsibility of the this.update() function.
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

  /**
   * Determines whether the X and Y coordinates fall within the Start element.
   *
   * This is used when dragging a person's element to the other side.
   *
   * @param {number} x - The window X coordinate.
   * @param {number} y - The window Y coordinate.
   *
   * @return {boolean} - Whether it falls inside the Start element or not.
   */
  this.isOverStart = (x, y) => {
    const bounds = el.start.getBoundingClientRect();
    return ( x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height );
  }

  /**
   * Determines whether the X and Y coordinates fall within the End element.
   *
   * This is used when dragging a person's element to the other side.
   *
   * @param {number} x - The window X coordinate.
   * @param {number} y - The window Y coordinate.
   *
   * @return {boolean} - Whether it falls inside the End element or not.
   */
  this.isOverEnd = (x, y) => {
    const bounds = el.end.getBoundingClientRect();
    return ( x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height );
  };

  /**
   * Enables the ability to drag a person element.
   *
   * The main feature of this function is that it adds a mousedown event listener
   * to the specified person element. When triggered, it adds two additional
   * event listeners for mousemove and mouseup. The mousemove event triggers the
   * person element to be moved visually, and the mousedown event removes both the
   * mousemove and mouseup events, as well as determines whether to return the
   * person element to their original location, or move them to a new one.
   *
   * Generally speaking, this is applied to every person that gets created in the
   * view.
   *
   * @param {Person} person - The person to have dragging enabled.
   *
   * @return void
   */
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

  /**
   * Refreshes the X positions for the Start and End elements.
   *
   * Whenever a new person is added or somebody is removed, the standard X 
   * positions for the Start and End blocks must be recalculated to maintain a
   * clean, even distribution. That is what this function does.
   *
   * @return void
   */
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
   * Initiates the next stage for people crossing the bridge.
   *
   * This function is called at the end of each stage in the animation. It
   * calculates the positions for each person to cross, calls this.move() to move
   * them, and then sets a timeout for this.cross() to be called again at the end
   * of the current stage.
   *
   * Much of the information related to the mechanisms of this function can be
   * found in the documentation for the stage variable earlier in this file.
   * For more information, please reference that documentation.
   *
   * @see stage
   *
   * @return void
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

  /**
   * Moves people based on the current stage and state of the model.
   *
   * The mechanism by which people are moved is twofold. After acquiring the
   * positions to which to move the people, it first sets the transition style
   * based on the time for the current stage. If it is in Stage 2, it uses
   * timeToCross to calculate this. It then sets the transform style to apply
   * a translate3d CSS transform function using the destination coordinates for
   * the person.
   * 
   * This function is generally called by this.cross(). An exception to this is
   * when the model is paused during Stage 2. See the inline comments for more
   * details.
   *
   * @param {Person} person - The object of the person to be moved.
   * @param {number} index - The index of the person in peopleToCross[] (NOT in people[]). This is used to determine the person's X position while crossing the bridge in Stage 2.
   * @param {number} [duration] - The duration of the move animation in milliseconds. If not given, it calculates the time based on the model data. This is generally used to force an immediate move with a value of 0.
   * 
   * @return void
   */
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

  /**
   * Increments the display timer.
   *
   * This function is called every time the timerIntervalObject is fired. To avoid
   * potential off-errors, it ensures that the total timer value never exceeds the
   * model's timePassed.
   *
   * It also assigns the text content of the timer element to be in the format
   * specified by the model, i.e. divided by 1000.
   */
  this.incrementTimer = () => {
    timer += timerInterval;
    if ( timer >= timePassed ) {
      timer = timePassed;
      clearInterval( timerIntervalObject );
    }
    el.timer.textContent = timer / 1000;
    console.log( "timer: ", timer );
    console.log( "timePassed: ", timePassed );
  }

  /**
   * Resets the application.
   *
   * This function sends a request to the controller to reset the model. At the
   * same time, it sets isPlaying and isPaused to false so that receiving the
   * update from the model will not automatically cause the animation to begin.
   *
   * @param {Object} event - The click event that triggered this function.
   *
   * @return void
   */
  this.reset = event => {
    isPlaying = false;
    isPaused = false;
    stage = 0;
    controller.resetModel();
  };

  /**
   * Starts or resumes the application.
   *
   * If paused, it simply sets isPaused to false and resumes the this.cross() call
   * chain.
   *
   * Otherwise, if the model has reached its final state, then it will send a
   * request to reset the model.
   *
   * Finally, if the timePassed for the model is zero (implying that it is sitting
   * on a fresh model that hasn't yet started), it will set isPlaying to true and
   * initiate the this.cross() call chain.
   *
   * @param {Object} event - The click event that triggered this function.
   *
   * @return void
   */
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

  /**
   * Pauses the application.
   *
   * This function halts the animation wherever it is currently at.
   *
   * If it is in Stage 1 or 3, it decrements the stage. This is because
   * this.cross() increments the stage at the beginning of the animation, so in
   * order to restart the stage, it must be put back to where it was before
   * this.cross() was called. It also doesn't track the timer for those Stages
   * since people are simply approaching or leaving the bridge.
   *
   * If it is in Stage 2, then it calculates the current position of the people
   * crossing the bridge to instantly move them, as well as to be later used when
   * resuming the application.
   *
   * Stage 0 isn't really considered, except to set it back to Stage 3, since it
   * doesn't really have a duration.
   *
   * @param {Object} event - The click event that triggered this function.
   *
   * @return void
   */
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
   * Its inner workings are detailed by inline comments. Please consult them for
   * additional information.
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

    // Combine state.peopleAtStart[] and state.peopleAtEnd[] to get everybody sent
    // by the model.
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

    // If there are any discrepancies between the model's people and the view's,
    // add any new people to people[] and resort it. Also refresh the X positions
    // for the Start and End elements, and enable draggable for each person.
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
   * Initializes the view.
   *
   * This function is called by the DOM once it has finished loading. It
   * initializes all elements, static event listeners, and any other static
   * values that need to be initialized.
   *
   * It asynchronously calls the controller's init() function, which will
   * initialize the model. Once everything is ready, the view (and any subviews)
   * are then subscribed to the controller to receive updates from the model.
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
      el.addPersonName = document.createElement('input');
      el.addPersonCrossTime = document.createElement('input');
      el.addPerson = this.createTextElement('button', 'Add Person');
      el.bridgeWidthLabel = this.createTextElement('div', 'Bridge Width');
      el.bridgeWidth = document.createElement('input');
      el.dataDisplay = document.createElement('div');
      el.timerLabel = this.createTextElement('div', 'Minutes Passed');
      el.timer = this.createTextElement('div', '0');
      el.turnsLabel = this.createTextElement('div', 'Turns Elapsed');
      el.turns = this.createTextElement('div', '0');
      el.torchSideLabel = this.createTextElement('div', 'Torch Side');
      el.torchSide = this.createTextElement('div', 'Start');
      el.finalStateLabel = this.createTextElement('div', 'Final State?');
      el.finalState = this.createTextElement('div', 'NO');

      // Assignment of classes

      el.mainView.classList.add('main-view');
      el.bridge.classList.add('bridge');
      el.start.classList.add('start');
      el.end.classList.add('end');
      el.settings.classList.add('settings');
      el.resetButton.classList.add('settings-button', 'settings-button-reset');
      el.startButton.classList.add('settings-button', 'settings-button-start');
      el.pauseButton.classList.add('settings-button', 'settings-button-pause');
      el.addPersonName.classList.add('settings-field', 'settings-field-add-person-name');
      el.addPersonCrossTime.classList.add('settings-field', 'settings-field-add-person-cross-time');
      el.addPerson.classList.add('settings-button', 'settings-button-add-person');
      el.bridgeWidthLabel.classList.add('settings-label', 'settings-label-bridge-width');
      el.bridgeWidth.classList.add('settings-field', 'settings-bridge-width');
      el.dataDisplay.classList.add('data-display');
      el.timerLabel.classList.add('data-display-timer-label');
      el.timer.classList.add('data-display-timer');
      el.turnsLabel.classList.add('data-display-turns-label');
      el.turns.classList.add('data-display-turns');
      el.torchSideLabel.classList.add('data-display-torch-side-label');
      el.torchSide.classList.add('data-display-torch-side');
      el.finalStateLabel.classList.add('data-display-final-state-label');
      el.finalState.classList.add('data-display-final-state');

      // Assignment of ID attributes

      el.resetButton.setAttribute('id', 'reset');
      el.startButton.setAttribute('id', 'start');
      el.pauseButton.setAttribute('id', 'pause');

      // Assignment of other attributes

      el.addPersonName.setAttribute('type', 'text');
      el.addPersonName.setAttribute('placeholder', 'Name');
      el.addPersonCrossTime.setAttribute('type', 'text');
      el.addPersonCrossTime.setAttribute('placeholder', 'Cross Time');

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
      el.settings.appendChild( el.addPersonName );
      el.settings.appendChild( el.addPersonCrossTime );
      el.settings.appendChild( el.addPerson );
      el.settings.appendChild( el.bridgeWidthLabel );
      el.settings.appendChild( el.bridgeWidth );

      el.app.appendChild( el.dataDisplay );
      el.dataDisplay.appendChild( el.timerLabel );
      el.dataDisplay.appendChild( el.timer );
      el.dataDisplay.appendChild( el.turnsLabel );
      el.dataDisplay.appendChild( el.turns );
      el.dataDisplay.appendChild( el.torchSideLabel );
      el.dataDisplay.appendChild( el.torchSide );
      el.dataDisplay.appendChild( el.finalStateLabel );
      el.dataDisplay.appendChild( el.finalState );

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

      el.addPerson.addEventListener( 'click', event => {
        event.preventDefault();
        const name = el.addPersonName.value;
        const crossTime = el.addPersonCrossTime.value;
        console.log( "Name: ", name );
        console.log( "Cross Time: ", crossTime );
        if ( name.length <= 0 || ! /\d+/.test(crossTime) ) { console.log( "Invalid!" ); return; }
        el.addPersonName.setAttribute('value', '');
        el.addPersonCrossTime.setAttribute('value', '');
        controller.addPerson(name, Number(crossTime));
      });

      el.bridgeWidth.addEventListener( 'change', event => {
        event.preventDefault();
        const val = event.target.value;
        if ( /\d+/.test(val) ) {
          controller.setBridgeWidth( Number(val) );
        }
        else {
          event.target.setAttribute('value', controller.getBridgeWidth());
        }
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
      // initialize the bridge width setting field
      el.bridgeWidth.setAttribute('value', controller.getBridgeWidth());
      // subscribing to the controller lets the view receive model updates
      controller.subscribe( this );
      // we also want to subscribe our dataDisplay object so that it receives
      // updates as well
      controller.subscribe( dataDisplay );

    })();

  })(); // fire this as soon as it is declared

};
