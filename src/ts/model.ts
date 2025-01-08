import {
  Side,
  TimeInMinutes,
  ModelState,
  Person,
} from "./types";

window.appModel = function() {

  let controller: () => void;

  // Validation Functions

  this.checkSide = side => { if ( side !== 'start' && side !== 'end' ) throw 'invalid_side'; };

  /**
   * @typedef {Object} Person
   * @property {number} [id] - The ID of the person. Defaults to person's index in array.
   * @property {string} name - The name of the person.
   * @property {number} crossTime - The time it takes the person to cross the bridge (in minutes).
   * @property {string} [side] - Where the person is currently located. Accepts 'start' or 'end'. Default 'start'.
   */

  interface Defaults {
    bridgeWidth: number; // The number of people who can cross simultaneously.
    people: Person[]; // The default set of people.
    torchSide: Side; // The default starting side for the torch.
  }

  type DefaultsKey = keyof Defaults;
  type DefaultsValue = Defaults[keyof Defaults];

  const defaults: Defaults = {

    bridgeWidth: 2,

    // people data
    people: [
      { id: 0, name: 'Louise', crossTime: 1, },
      { id: 1, name: 'Mark', crossTime: 2, },
      { id: 2, name: 'Anne', crossTime: 5, },
      { id: 3, name: 'John', crossTime: 8, },
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
  this.getDefaults = (property: DefaultsKey | null = null): DefaultsValue | Defaults => {
    switch ( property ) {
      case null:
        return JSON.parse(JSON.stringify(defaults));
      case 'bridgeWidth':
        return defaults.bridgeWidth;
      case 'people':
        return JSON.parse(JSON.stringify(defaults.people));
      case 'torchSide':
        return defaults.torchSide;
    }
  }

  this.getDefaultBridgeWidth = (): number => this.getDefaults('bridgeWidth');
  this.getDefaultPeople = (): Person[] => this.getDefaults('people');
  this.getDefaultTorchSide = (): Side => this.getDefaults('torchSide');

  /**
   * @see {Defaults}
   */
  let bridgeWidth: number;

  /**
   * @see {Defaults}
   */
  const people: Person[] = [];

  /**
   * @see {Defaults}
   */
  let torchSide: Side;

  /**
   * @see {State}
   */
  let timePassed: TimeInMinutes;

  /**
   * @see {State}
   */
  let turnsElapsed: number;


  // Default settings manipulation


  /**
   * Adds a person to the default set.
   *
   * @param {string} name - The name of the person.
   * @param {number} crossTime - The time it takes for the person to cross the bridge.
   *
   * @return {number} - The total number of people in the default set.
   */
  this.addPerson = (name: string, crossTime: TimeInMinutes): void => {
    defaults.people.push({ id: generatePersonId(), name: name, crossTime: crossTime });
    defaults.people.sort( (personA, personB) => personA.crossTime - personB.crossTime );
  };

  const generatePersonId = (): number => {
    this.nextId = this.nextId ?? Math.max(-1, ...people.map(p => p.id)) + 1;
    this.nextId++;
    return this.nextId - 1; // We increment it, then return what it was before.
  };

  /**
   * Removes a person from the default set.
   *
   * @param {number} id - The ID of the person (that is, their index in the default.people array).
   *
   * @return {number} - The ID (index) of the person removed.
   */
  this.removePerson = (id: number): number => {
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
  this.setBridgeWidth = (bridgeWidth: number): number => defaults.bridgeWidth = bridgeWidth;

  /**
   * Returns the state of the model.
   *
   * @return {State} - The state of the model.
   */
  this.getState = (): ModelState => {
    return {
      finalState: this.isFinalState(),
      peopleAtStart: this.getPeopleAtStart(),
      peopleAtEnd: this.getPeopleAtEnd(),
      timePassed: timePassed,
      turnsElapsed: turnsElapsed,
      torchSide: torchSide,
    };
  };

  this.getNumberOfPeople = (): number => people.length;

  this.getOtherSide = (side: Side): Side => {
    if ( side === 'start' ) return 'end';
    return 'start';
  };

  this.getPeople = (): Person[] => {
    // TODO: Change the stringify/parse to an Object.assign() or
    // spread operator for performance.
    return JSON.parse(JSON.stringify(people));
  };

  this.getPeopleAtStart = (): Person[] => {
    return this.getPeopleAtSide('start');
  };

  this.getPeopleAtEnd = (): Person[] => {
    return this.getPeopleAtSide('end');
  };

  this.getPeopleAtSide = (side: Side): Person[] => {
    return people.filter( (person: Person) => person.side === side );
  };

  this.getPersonIdFromName = (name: string): number => {
    let index: number = 0;
    const person: Person | null = people.find( (p: Person, i: number): boolean => { index = i; return p.name === name } );
    if ( person == null ) throw `person_not_found: ${name}`;
    return person.id;
  };

  this.getPersonSide = (person: number | string | Person): Side => {
    switch (typeof person) {
      case 'number':
        if (people[person] == undefined) {
          throw `person_not_found: ${person}`;
        }
        return people[person].side;
      case 'string':
        const p: Person = people.find( p => p.name === person );
        if (p == null) {
          throw `person_not_found: ${person}`;
        }
        return p.side;
      default: // Person
        return person.side;
    }
  };

  this.getTorchSide = (): Side => torchSide;


  // Setters


  this.incrementTimePassed = (minutes: TimeInMinutes): TimeInMinutes => timePassed += minutes;

  this.incrementTurnsElapsed = (count: number = 1): number => turnsElapsed += count;

  /**
   * Sets the side of the specified person.
   *
   * @param {string|number} person - The person to set.
   * @param {string} side - The side to set the person to.
   *
   * @return void
   */
  this.setPersonSide = (person: string | number, side: Side): void => {
    if ( typeof person === 'string' ) {
      person = this.getPersonIdFromName( person );
    }
    people[person].side = side;
  };

  this.setTorchSide = (side: Side): void => {
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
  this.stepForward = (): ModelState => {

    if ( this.isFinalState() ) return this.getState();

    const from: Side = this.getTorchSide();
    const to: Side = this.getOtherSide( from );
    const peopleOnThisSide: Person[] = this.getPeopleAtSide( from );
    const peopleOnThatSide: Person[] = this.getPeopleAtSide( to );
    const selected: Person[] = [];
    selected.length = 0;
 
    peopleOnThisSide.sort( (personA: Person, personB: Person): TimeInMinutes => personA.crossTime - personB.crossTime );

    if ( turnsElapsed === 0 && peopleOnThatSide.length > 0 && peopleOnThisSide.length > bridgeWidth ) {
      // See the COMPLICATION section of this function's documentation
      peopleOnThatSide.sort( (personA: Person, personB: Person): TimeInMinutes => personA.crossTime - personB.crossTime );
      let timeSecuredA: TimeInMinutes = 0, timeSecuredB: TimeInMinutes = 0;
      let timeElapsedA: TimeInMinutes = 0, timeElapsedB: TimeInMinutes = 0;
      let personWithMinimumCrossTime: Person = peopleOnThisSide[ peopleOnThisSide.length - 1 ];
      for ( let i: number = peopleOnThisSide.length - 1; i > peopleOnThisSide.length - 1 - bridgeWidth; i-- ) {
        console.log( 'i: ', i, 'pwmct: ', personWithMinimumCrossTime );
        timeSecuredA += peopleOnThisSide[i].crossTime;
        personWithMinimumCrossTime = (peopleOnThisSide[i].crossTime < personWithMinimumCrossTime.crossTime ? peopleOnThisSide[i] : personWithMinimumCrossTime);
        if ( i !== peopleOnThisSide.length - bridgeWidth ) {
          timeSecuredB += peopleOnThisSide[i].crossTime;
        }
      }
      for ( let i: number = 0; i < peopleOnThatSide.length; i++ ) {
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
        for ( let i: number = Math.max( selected.length, peopleOnThisSide.length - bridgeWidth ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[i] );
        }
      }
      else {
        // Otherwise, we send our fastest with the slowest
        selected.push( peopleOnThisSide[0] );
        for ( let i: number = Math.max( selected.length, peopleOnThisSide.length - (bridgeWidth - selected.length) ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[i] );
        }
      }
      // END of COMPLICATION
    }
    else {
      // Standard algorithm
      selected.push( peopleOnThisSide[0] );

      if ( from === 'start' && peopleOnThisSide.length > 1 ) {
        for ( let i: number = Math.max( selected.length, peopleOnThisSide.length - (bridgeWidth - selected.length) ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[ i ] );
        }
      }
    }

    for ( let i: number = 0; i < selected.length; i++ ) {
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
  this.isFinalState = (): boolean => this.getPeopleAtEnd().length === people.length || (bridgeWidth < 2 && this.getPeopleAtStart().length > 1);



  /**
   * Initializes the model.
   *
   * This function should be called whenever the user wishes to reset the
   * program, including at the very beginning when the program first loads.
   *
   * @return void
   */
  this.init = (): ModelState => {
    controller = window.appController;

    bridgeWidth = defaults.bridgeWidth;
    people.length = 0;
    defaults.people.forEach( function( person: Person, index: number, array: Person[] ): void {
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
