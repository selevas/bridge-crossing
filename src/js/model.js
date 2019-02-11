window.appModel = function() {

  let controller;

  // Validation Functions

  this.checkSide = side => { if ( side !== 'start' && side !== 'end' ) throw 'invalid_side'; };

  /**
   * @typedef {Object} Person
   * @property {number} [id] - The ID of the person. Defaults to person's index in array.
   * @property {string} name - The name of the person.
   * @property {number} crossTime - The time it takes the person to cross the bridge (in minutes).
   * @property {string} [side] - Where the person is currently located. Accepts 'start' or 'end'. Default 'start'.
   */

  /**
   * Default values and behaviors for the model.
   *
   * @typedef {Object} Defaults
   * @property {number} bridgeWidth - The number of people who can cross simultaneously.
   * @property {Person[]} people - The default set of people.
   * @property {string} torchSide - The default starting side for the torch.
   */
  const defaults = {

    bridgeWidth: 2,

    // people data
    people: [
      { name: 'Louise', crossTime: 1, },
      { name: 'Mark', crossTime: 2, },
      { name: 'Anne', crossTime: 5, },
      { name: 'John', crossTime: 8, },
    ],

    torchSide: 'start',

  };

  /**
   * Getter for the Defaults object, or its various properties.
   *
   * When the value to return is an object, it returns a copy of the object
   * rather than a reference to the original.
   *
   * @param {string} [property] - The desired default property.
   *
   * @return {*} - Specified defaults value.
   */
  this.getDefaults = (property = null) => {
    switch ( property ) {
      case null:
        return JSON.parse(JSON.stringify(defaults));
      case 'bridgeWidth':
        return defaults.bridgeWidth;
      case 'people':
        return JSON.parse(JSON.stringify(defaults.people));
      case 'torchSide':
        return defaults.torchSide;
      default:
        throw 'unknown_default_property';
    }
  }

  this.getDefaultBridgeWidth = () => this.getDefaults('bridgeWidth');
  this.getDefaultPeople = () => this.getDefaults('people');
  this.getDefaultTorchSide = () => this.getDefaults('torchSide');

  /**
   * @see {Defaults}
   */
  let bridgeWidth;

  /**
   * @see {Defaults}
   */
  const people = [];

  /**
   * @see {Defaults}
   */
  let torchSide;

  /**
   * @see {State}
   */
  let timePassed;

  /**
   * @see {State}
   */
  let turnsElapsed;


  // Default settings manipulation


  /**
   * Adds a person to the default set.
   *
   * @param {string} name - The name of the person.
   * @param {number} crossTime - The time it takes for the person to cross the bridge.
   *
   * @return {number} - The total number of people in the default set.
   */
  this.addPerson = (name, crossTime) => {
    defaults.people.push({ name: name, crossTime: crossTime });
    defaults.people.sort( (personA, personB) => personA.crossTime - personB.crossTime );
  };

  /**
   * Removes a person from the default set.
   *
   * @param {number} id - The ID of the person (that is, their index in the default.people array).
   *
   * @return {number} - The ID (index) of the person removed.
   */
  this.removePerson = id => {
    defaults.people.splice(id, 1);
    return id;
  };

  /**
   * Sets a new default bridge width.
   *
   * @param {number} bridgeWidth - The new bridge width.
   *
   * @return {number} - The new bridge width.
   */
  this.setBridgeWidth = bridgeWidth => defaults.bridgeWidth = bridgeWidth;


  /**
   * The state of the model.
   *
   * @typedef {Object} State
   * @property {boolean} finalState - Whether the final state of the model has been reached.
   * @property {Person[]} peopleAtStart - The people at the start.
   * @property {Person[]} peopleAtEnd - The people at the end.
   * @property {number} timePassed - The amount of time that has passed (in minutes).
   * @property {number} turnsElapsed - The number of turns that have elapsed.
   */

  /**
   * Returns the state of the model.
   *
   * @return {State} - The state of the model.
   */
  this.getState = () => {
    return {
      finalState: this.isFinalState(),
      peopleAtStart: this.getPeopleAtStart(),
      peopleAtEnd: this.getPeopleAtEnd(),
      timePassed: timePassed,
      turnsElapsed: turnsElapsed,
      torchSide: torchSide,
    };
  };

  this.getNumberOfPeople = () => people.length;

  this.getOtherSide = side => {
    this.checkSide( side );
    if ( side === 'start' ) return 'end';
    return 'start';
  };

  this.getPeople = () => {
    return JSON.parse(JSON.stringify(people));
  };

  this.getPeopleAtStart = () => {
    return people.filter( person => person.side === 'start' );
  };

  this.getPeopleAtEnd = () => {
    return people.filter( person => person.side === 'end' );
  };

  this.getPeopleAtSide = side => {
    this.checkSide( side );
    return people.filter( person => person.side === side );
  };

  this.getPersonIdFromName = name => {
    let index = 0;
    const person = people.find( (p, i) => { index = i; return p.name === name } );
    if ( person == undefined ) throw 'person_not_found';
    if ( person.id == null ) return index;
    return person.id;
  };

  this.getPersonSide = person => {
    const type = typeof person;
    if ( type === 'number' ) return people[person].side;
    if ( type === 'string' ) return people.find( p => p.name === person ).side;
    throw 'person_not_found';
  };

  this.getTorchSide = () => torchSide;


  // Setters


  this.incrementTimePassed = (minutes) => timePassed += minutes;

  this.incrementTurnsElapsed = (count = 1) => turnsElapsed += count;

  /**
   * Sets the side of the specified person.
   *
   * @param {string|number} person - The person to set.
   * @param {string} side - The side to set the person to.
   *
   * @return void
   */
  this.setPersonSide = (person, side) => {
    this.checkSide( side );
    if ( typeof person === 'string' ) person = this.getPersonIdFromName( person );
    people[person].side = side;
  };

  this.setTorchSide = side => {
    this.checkSide( side );
    torchSide = side;
  };



  // Model Actions


  /**
   * Increments the model by one turn.
   *
   * This is the basic mechanism by which the model advances. Each time step()
   * is called, people cross the bridge according to whatever is the most
   * efficient way based on the current state.
   *
   * It first checks to see if the number of people at the end is equal to the
   * total number of people. If this condition is met, the model returns the
   * state early and reports success.
   *
   * Otherwise, it then checks to see which side the torch is on and determines
   * who is on that side. It then diverges into two possible courses of action.
   *
   * Possibility A: If the torch is at the start, then the fastest and slowest
   * people on that side are both selected to cross the bridge.
   *
   * Possibility B: If the torch is at the end, then the fastest person on that
   * side is selected to cross the bridge.
   *
   * At this point, the selected people are reassigned to the other side along
   * with the torch, the turnsElapsed variable is incremented and the timePassed
   * variable is increased by the highest crossTime of all selected people.
   *
   * A COMPLICATION:
   *
   * If the model is set to begin with someone on the opposite side, then the
   * most efficient choice becomes more complicated. As the simplest example,
   * imagine that the fastest person starts on the opposite side. In such a case,
   * it is much more efficient to send the two slowest people at the start over
   * together so that the fastest one can return on his own.
   *
   * However, at the other extreme, if the slowest person is already on the other
   * side, then we ignore him and carry on like normal.
   *
   * But what if it's someone in the middle? How do we know if we should send one
   * of our fastest, or only our slowest?
   *
   * After running some samples, I came up with the following algorithm:
   *
   * IF time = 0 AND end has at least one person AND number at start is greater than bridge width:
   *   Get the TIME_SECURED_A by adding each of the slowest from the start (up to bridge width) + all present on opposite side - fastest of these
   *   Get the TIME_ELAPSED_A by adding the slowest from start + fastest of the new end
   *   Get the TIME_SECURED_B by adding each of the slowest from the start (up to bridge width - 1) + all present on opposite side
   *   Get the TIME_ELAPSED_B by adding the slowest from start + fastest of the new end
   *   Compare (TIME_SECURED_A - TIME_ELAPSED_A) with (TIME_SECURED_B - TIME_ELAPSED_B) and select whichever is greater
   *
   * Following this algorithm, if A is greater than B, then we send all our
   * slowest over, with the fastest on the opposite side then returning. If B is
   * greater than A, then we send the fastest we already have on the starting side
   * over with the slowest. This results in the greatest time efficiency.
   *
   * To clarify, "Time Secured" is the term I came up with to describe the amount
   * of "crossing time" that we've permanently gotten to the other side. In other
   * words, any people who have crossed over and who will never come back over are
   * counted as "secured"
   *
   * As another interesting note, this algorithm is only required on the very
   * first turn of the model. Afterward, it will always revert to the original
   * algorithm, with the fastest person at the start accompanying the slowest
   * across. This is because starting with someone on the other side could
   * result in a state that is less efficient than what the algorithm would
   * normally produce. If we consider the example of the fastest person starting
   * by himself on the other side, that would never happen as a result of the
   * original algorithm.
   *
   * @return {State} - The state of the model when the step is complete.
   */
  this.stepForward = () => {

    if ( this.isFinalState() ) return this.getState();

    const from = this.getTorchSide();
    const to = this.getOtherSide( from );
    const peopleOnThisSide = this.getPeopleAtSide( from );
    const peopleOnThatSide = this.getPeopleAtSide( to );
    const selected = [];
    selected.length = 0;
 
    peopleOnThisSide.sort( (personA, personB) => personA.crossTime - personB.crossTime );

    if ( turnsElapsed === 0 && peopleOnThatSide.length > 0 && peopleOnThisSide.length > bridgeWidth ) {
      // See the COMPLICATION section of this function's documentation
      peopleOnThatSide.sort( (personA, personB) => personA.crossTime - personB.crossTime );
      let timeSecuredA = 0, timeSecuredB = 0;
      let timeElapsedA = 0, timeElapsedB = 0;
      let personWithMinimumCrossTime = peopleOnThisSide[ peopleOnThisSide.length - 1 ];
      for ( let i = peopleOnThisSide.length - 1; i > peopleOnThisSide.length - 1 - bridgeWidth; i-- ) {
        console.log( 'i: ', i, 'pwmct: ', personWithMinimumCrossTime );
        timeSecuredA += peopleOnThisSide[i].crossTime;
        personWithMinimumCrossTime = (peopleOnThisSide[i].crossTime < personWithMinimumCrossTime.crossTime ? peopleOnThisSide[i] : personWithMinimumCrossTime);
        if ( i !== peopleOnThisSide.length - bridgeWidth ) {
          timeSecuredB += peopleOnThisSide[i].crossTime;
        }
      }
      for ( let i = 0; i < peopleOnThatSide.length; i++ ) {
        timeSecuredA += peopleOnThatSide[i].crossTime;
        timeSecuredB += peopleOnThatSide[i].crossTime;
        personWithMinimumCrossTime = (peopleOnThatSide[i].crossTime < personWithMinimumCrossTime.crossTime ? peopleOnThatSide[i] : personWithMinimumCrossTime);
      }
      timeSecuredA -= personWithMinimumCrossTime.crossTime;

      timeElapsedA = peopleOnThisSide[ peopleOnThisSide.length - 1 ].crossTime + personWithMinimumCrossTime.crossTime;
      timeElapsedB = peopleOnThisSide[ peopleOnThisSide.length - 1 ].crossTime + peopleOnThisSide[0].crossTime;

      //console.log( 'Person with minimum Cross Time: ', personWithMinimumCrossTime );
      //console.log( 'Time Elapsed A: ', timeElapsedA );
      //console.log( 'Time Secured A: ', timeSecuredA );
      //console.log( 'Time Elapsed B: ', timeElapsedB );
      //console.log( 'Time Secured B: ', timeSecuredB );

      if ( timeSecuredA - timeElapsedA > timeSecuredB - timeElapsedB ) {
        // Then we send over only our slowest
        for ( let i = Math.max( selected.length, peopleOnThisSide.length - bridgeWidth ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[i] );
        }
      }
      else {
        // Otherwise, we send our fastest with the slowest
        selected.push( peopleOnThisSide[0] );
        for ( let i = Math.max( selected.length, peopleOnThisSide.length - (bridgeWidth - selected.length) ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[i] );
        }
      }
      // END of COMPLICATION
    }
    else {
      // Standard algorithm
      selected.push( peopleOnThisSide[0] );

      if ( from === 'start' && peopleOnThisSide.length > 1 ) {
        for ( let i = Math.max( selected.length, peopleOnThisSide.length - (bridgeWidth - selected.length) ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[ i ] );
        }
      }
    }

    for ( let i = 0; i < selected.length; i++ ) {
      this.setPersonSide( selected[i].id, to );
    }

    this.setTorchSide( to );

    this.incrementTurnsElapsed();
    this.incrementTimePassed( selected[ selected.length - 1 ].crossTime );

    return this.getState();

  };

  /**
   * Determines whether the model has reached its final state or not.
   *
   * Usually ends when everybody is at the End side. However, it can also
   * determine final state if it is unable to get everybody to the End side.
   * For example, if the bridge width is less than 2, and there is more than one
   * person needing to cross.
   *
   * @return {boolean} - Whether the model has reached its final state.
   */
  this.isFinalState = () => this.getPeopleAtEnd().length === people.length || (bridgeWidth < 2 && this.getPeopleAtStart().length > 1);



  /**
   * Initializes the model.
   *
   * This function should be called whenever the user wishes to reset the
   * program, including at the very beginning when the program first loads.
   *
   * @return void
   */
  this.init = () => {
    controller = window.appController;

    bridgeWidth = defaults.bridgeWidth;
    people.length = 0;
    defaults.people.forEach( function( person, index, array ) {
      people.push({
        id: index,
        name: person.name,
        crossTime: person.crossTime,
        side: person.side == null ? 'start' : person.side,
      });
    });
    torchSide = defaults.torchSide;

    timePassed = 0;
    turnsElapsed = 0;

    console.log( defaults );
    console.log( "Model initialized!" );

    return this.getState();
  }

};

window.appModel.call( window.appModel );
