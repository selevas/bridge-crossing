window.appModel = function() {

  // Validation Functions

  this.checkPosition = position => { if ( position !== 'start' && position !== 'end' ) throw 'invalid_position'; };

  /**
   * @typedef {Object} Person
   * @property {number} [id] - The ID of the person. Defaults to person's index in array.
   * @property {string} name - The name of the person.
   * @property {number} crossTime - The time it takes the person to cross the bridge (in minutes).
   * @property {string} [position] - Where the person is currently located. Accepts 'start' or 'end'. Default 'start'.
   */

  /**
   * Default values and behaviors for the model.
   *
   * @typedef {Object} Defaults
   * @property {number} bridgeWidth - The number of people who can cross simultaneously.
   * @property {Person[]} people - The default set of people.
   * @property {string} torchPosition - The default starting position for the torch.
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

    torchPosition: 'start',

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
      case 'torchPosition':
        return defaults.torchPosition;
      default:
        throw 'unknown_default_property';
    }
  }

  this.getDefaultBridgeWidth = () => this.getDefaults('bridgeWidth');
  this.getDefaultPeople = () => this.getDefaults('people');
  this.getDefaultTorchPosition = () => this.getDefaults('torchPosition');

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
  let torchPosition;

  /**
   * @see {State}
   */
  let timePassed;

  /**
   * @see {State}
   */
  let turnsElapsed;


  // Accessors


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
    };
  };

  this.getNumberOfPeople = () => people.length;

  this.getOtherSide = side => {
    this.checkPosition( side );
    if ( side === 'start' ) return 'end';
    return 'start';
  };

  this.getPeople = () => {
    return JSON.parse(JSON.stringify(people));
  };

  this.getPeopleAtStart = () => {
    return people.filter( person => person.position === 'start' );
  };

  this.getPeopleAtEnd = () => {
    return people.filter( person => person.position === 'end' );
  };

  this.getPeopleAtSide = side => {
    this.checkPosition( side );
    return people.filter( person => person.position === side );
  };

  this.getPersonIdFromName = name => {
    let index = 0;
    const person = people.find( (p, i) => { index = i; return p.name === name } );
    if ( person == undefined ) throw 'person_not_found';
    if ( person.id == null ) return index;
    return person.id;
  };

  this.getPersonPosition = person => {
    const type = typeof person;
    if ( type === 'number' ) return people[person].position;
    if ( type === 'string' ) return people.find( p => p.name === person ).position;
    throw 'person_not_found';
  };

  this.getTorchPosition = () => torchPosition;


  // Setters


  this.incrementTimePassed = (minutes) => timePassed += minutes;

  this.incrementTurnsElapsed = (count = 1) => turnsElapsed += count;

  /**
   * Sets the position of the specified person.
   *
   * @param {string|number} person - The person to set.
   * @param {string} position - The position to set the person to.
   *
   * @return void
   */
  this.setPersonPosition = (person, position) => {
    this.checkPosition( position );
    if ( typeof person === 'string' ) person = this.getPersonIdFromName( person );
    people[person].position = position;
  };

  this.setTorchPosition = position => {
    this.checkPosition( position );
    torchPosition = position;
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
   * @return {State} - The state of the model when the step is complete.
   */
  this.stepForward = () => {

    if ( this.isFinalState() ) return this.getState();

    const from = this.getTorchPosition();
    const to = this.getOtherSide( from );
    const peopleOnThisSide = this.getPeopleAtSide( from );
    const selected = [];
    selected.length = 0;
 
    peopleOnThisSide.sort( (personA, personB) => personA.crossTime - personB.crossTime );
    selected.push( peopleOnThisSide[0] );
    if ( from === 'start' && peopleOnThisSide.length > 1 ) {
      if ( bridgeWidth > 2 ) {
        for ( let i = Math.max( 1, peopleOnThisSide.length - (bridgeWidth - 1) ); i < peopleOnThisSide.length ; i++ ) {
          selected.push( peopleOnThisSide[ i ] );
        }
      }
      else {
        selected.push( peopleOnThisSide[ peopleOnThisSide.length - 1 ] );
      }
    }

    for ( let i = 0; i < selected.length; i++ ) {
      this.setPersonPosition( selected[i].id, to );
    }

    this.setTorchPosition( to );

    this.incrementTurnsElapsed();
    this.incrementTimePassed( selected[ selected.length - 1 ].crossTime );

    return this.getState();

  };

  this.isFinalState = () => this.getPeopleAtEnd().length === people.length;



  /**
   * Initializes the model.
   *
   * This function should be called whenever the user wishes to reset the
   * program, including at the very beginning when the program first loads.
   *
   * @return void
   */
  this.init = () => {
    bridgeWidth = defaults.bridgeWidth;
    people.length = 0;
    defaults.people.forEach( function( person, index, array ) {
      people.push({
        id: index,
        name: person.name,
        crossTime: person.crossTime,
        position: person.position == null ? 'start' : person.position,
      });
    });
    torchPosition = defaults.torchPosition;

    timePassed = 0;
    turnsElapsed = 0;

    console.log( defaults );
    console.log( "Model initialized!" );
  }

};

window.appModel.call( window.appModel );
