import {
  Side,
  TimeInMinutes,
  PersonID,
  ModelState,
  PersonDefinition,
  Person,
} from "./types";

import { ValueError } from "./classes/Errors";

interface Defaults {
  bridgeWidth: number; // The number of people who can cross simultaneously.
  people: PersonDefinition[]; // The default set of people.
  torchSide: Side; // The default starting side for the torch.
}

type DefaultsKey = keyof Defaults;
type DefaultsValue = Defaults[keyof Defaults];

export default class AppModel {

  #defaults: Defaults = {
    bridgeWidth: 2,
    people: [
      { name: 'Louise', crossTime: 1, side: 'start' },
      { name: 'Mark', crossTime: 2, side: 'start' },
      { name: 'Anne', crossTime: 5, side: 'start' },
      { name: 'John', crossTime: 8, side: 'start' },
    ],
    torchSide: 'start',
  };

  /**
   * Getter for the Defaults object, or its various properties.
   *
   * When the value to return is an object, it returns a copy of the object
   * rather than a reference to the original.
   *
   * @private
   *
   * @param {string} [property] - The desired default property.
   *
   * @return {*} - Specified defaults value.
   */
  #getDefaults(property: DefaultsKey | null = null): DefaultsValue | Defaults {
    switch ( property ) {
      case null:
        return JSON.parse(JSON.stringify(this.#defaults));
      case 'bridgeWidth':
        return this.#defaults.bridgeWidth;
      case 'people':
        return JSON.parse(JSON.stringify(this.#defaults.people));
      case 'torchSide':
        return this.#defaults.torchSide;
    }
  }

  getAllDefaults(): Defaults { return (this.#getDefaults(null) as Defaults); }
  getDefaultBridgeWidth(): number { return (this.#getDefaults('bridgeWidth') as number); }
  getDefaultPeople(): PersonDefinition[] { return (this.#getDefaults('people') as PersonDefinition[]); }
  getDefaultTorchSide(): Side { return (this.#getDefaults('torchSide') as Side); }

  /**
   * @see {Defaults}
   */
  #bridgeWidth: number;

  /**
   * @see {Defaults}
   */
  #people: Person[] = [];

  /**
   * @see {Defaults}
   */
  #torchSide: Side;

  /**
   * @see {State}
   */
  #timePassed: TimeInMinutes;

  /**
   * @see {State}
   */
  #turnsElapsed: number;


  // Default settings manipulation


  // getPerson method overload signatures
  addPerson(person: PersonDefinition): PersonID;
  addPerson(name: string, crossTime?: TimeInMinutes, side?: Side): PersonID;

  /**
   * Adds a person to the default set.
   *
   * @param {string | PersonDefinition} name - The name of the person or a PersonDefinition object.
   * @param {number} [crossTime] - The time it takes for the person to cross the bridge.
   * @param {Side} [side] - Which side the person starts on.
   *
   * @return {PersonID} - The ID of the newly added person.
   */
  addPerson(nameOrPerson: string | PersonDefinition, crossTime?: TimeInMinutes, side?: Side): PersonID {
    let newPerson: Person;
    if (typeof nameOrPerson === 'object') {
      newPerson = {
        id: this.#generatePersonId(),
        name: nameOrPerson.name,
        crossTime: nameOrPerson.crossTime,
        side: nameOrPerson.side,
      }
    } else {
      newPerson = {
        id: this.#generatePersonId(),
        name: nameOrPerson,
        crossTime: crossTime!,
        side: side ?? 'start',
      };
    }
    this.#people.push(newPerson);
    return newPerson.id;
  };

  /**
   * Generates a new unique ID for a Person.
   *
   * The algorithm is nothing complicated. The first time it's called, it looks for
   * the highest ID of all the people in the set, stores it in the function object,
   * and increments it by one each time it gets called.
   *
   * This is fine since there is no reason to need to obscure the IDs for each
   * Person, and there is no potential for asynchronous conflicts.
   *
   * @return {number} - The new Person ID.
   */
  #generatePersonId(): number {
    return Math.max(-1, ...this.#people.map(p => p.id)) + 1;
  };

  /**
   * Removes a person from the model.
   *
   * If the person is not found, then null is returned.
   *
   * @param {number} id - The ID of the person (that is, their index in the default.people array).
   *
   * @return {number | null} - The ID (index) of the person removed, or null if not found.
   */
  removePerson(id: number): number | null {
    // TODO: Double check this... it seems wrong. It looks like it's using the
    // person ID as the array index, when it's a separate value.
    const index: number = this.#people.findIndex(p => p.id === id);
    if (index === -1) {
      return null;
    }
    this.#people.splice(index, 1);
    return id;
  };

  /**
   * Sets a new bridge width.
   *
   * @throws {Error}
   *
   * @param {number} bridgeWidth - The new bridge width.
   *
   * @return {number} - The new bridge width.
   */
  setBridgeWidth(bridgeWidth: number): number {
    if (bridgeWidth < 2) {
      throw new ValueError(
        "BRIDGE_WIDTH_TOO_SMALL",
        "The bridge width must be at least 2 for the model to function.",
        {value: bridgeWidth},
      );
    }
    return this.#bridgeWidth = bridgeWidth;
  }

  /**
   * Returns the state of the model.
   *
   * @return {State} - The state of the model.
   */
  getState(): ModelState {
    return {
      finalState: this.isFinalState(),
      peopleAtStart: this.getPeopleAtStart(),
      peopleAtEnd: this.getPeopleAtEnd(),
      timePassed: this.#timePassed,
      turnsElapsed: this.#turnsElapsed,
      torchSide: this.#torchSide,
    };
  };

  #getOtherSide(side: Side): Side {
    if ( side === 'start' ) return 'end';
    return 'start';
  };

  getBridgeWidth(): number {
    return this.#bridgeWidth;
  }

  getPeople(): Person[] {
    return [...this.#people];
  };

  getPeopleAtStart(): Person[] {
    return this.getPeopleAtSide('start');
  };

  getPeopleAtEnd(): Person[] {
    return this.getPeopleAtSide('end');
  };

  getPeopleAtSide(side: Side): Person[] {
    return this.#people.filter( (person: Person) => person.side === side );
  };

  getPersonById(personId: PersonID): Person | undefined {
    return this.#people.find( (p: Person): boolean => p.id === personId );
  }

  getPersonByName(name: string): Person | undefined {
    return this.#people.find( (p: Person): boolean => p.name === name );
  };

  getTorchSide(): Side { return this.#torchSide; }


  // Setters


  incrementTimePassed(minutes: TimeInMinutes): TimeInMinutes { return this.#timePassed += minutes; }

  incrementTurnsElapsed(count: number = 1): number { return this.#turnsElapsed += count; }

  /**
   * Sets the side of the specified person.
   *
   * @param {PersonID} personId - The ID of the person to set.
   * @param {string} side - The side to set the person to.
   *
   * @return {PersonID | null}
   */
  setPersonSide(personId: PersonID, side: Side): PersonID | null {
    const person: Person | null = this.getPersonById(personId);
    if (person === null) {
      return null;
    }
    person.side = side;
    return person.id;
  };

  setTorchSide(side: Side): void {
    this.#torchSide = side;
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
  stepForward(): ModelState {

    if ( this.isFinalState() ) return this.getState();

    const from: Side = this.getTorchSide();
    const to: Side = this.#getOtherSide( from );
    const peopleOnThisSide: Person[] = this.getPeopleAtSide( from );
    const peopleOnThatSide: Person[] = this.getPeopleAtSide( to );
    const selected: Person[] = [];
    selected.length = 0;
 
    peopleOnThisSide.sort( (personA: Person, personB: Person): TimeInMinutes => personA.crossTime - personB.crossTime );

    if ( this.#turnsElapsed === 0 && peopleOnThatSide.length > 0 && peopleOnThisSide.length > this.#bridgeWidth ) {
      // See the COMPLICATION section of this function's documentation
      peopleOnThatSide.sort( (personA: Person, personB: Person): TimeInMinutes => personA.crossTime - personB.crossTime );
      let timeSecuredA: TimeInMinutes = 0, timeSecuredB: TimeInMinutes = 0;
      let timeElapsedA: TimeInMinutes = 0, timeElapsedB: TimeInMinutes = 0;
      let personWithMinimumCrossTime: Person = peopleOnThisSide[ peopleOnThisSide.length - 1 ];
      for ( let i: number = peopleOnThisSide.length - 1; i > peopleOnThisSide.length - 1 - this.#bridgeWidth; i-- ) {
        console.log( 'i: ', i, 'pwmct: ', personWithMinimumCrossTime );
        timeSecuredA += peopleOnThisSide[i].crossTime;
        personWithMinimumCrossTime = (peopleOnThisSide[i].crossTime < personWithMinimumCrossTime.crossTime ? peopleOnThisSide[i] : personWithMinimumCrossTime);
        if ( i !== peopleOnThisSide.length - this.#bridgeWidth ) {
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
        for ( let i: number = Math.max( selected.length, peopleOnThisSide.length - this.#bridgeWidth ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[i] );
        }
      }
      else {
        // Otherwise, we send our fastest with the slowest
        selected.push( peopleOnThisSide[0] );
        for ( let i: number = Math.max( selected.length, peopleOnThisSide.length - (this.#bridgeWidth - selected.length) ); i < peopleOnThisSide.length; i++ ) {
          selected.push( peopleOnThisSide[i] );
        }
      }
      // END of COMPLICATION
    }
    else {
      // Standard algorithm
      selected.push( peopleOnThisSide[0] );

      if ( from === 'start' && peopleOnThisSide.length > 1 ) {
        for ( let i: number = Math.max( selected.length, peopleOnThisSide.length - (this.#bridgeWidth - selected.length) ); i < peopleOnThisSide.length; i++ ) {
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
  isFinalState(): boolean { return this.getPeopleAtEnd().length === this.#people.length || (this.#bridgeWidth < 2 && this.getPeopleAtStart().length > 1); }



  /**
   * Initializes the model.
   *
   * This function should be called whenever the user wishes to reset the
   * program, including at the very beginning when the program first loads.
   *
   * @return void
   */
  init(): ModelState {
    this.#bridgeWidth = this.#defaults.bridgeWidth;
    this.#people = [];
    this.#torchSide = this.#defaults.torchSide;

    this.#timePassed = 0;
    this.#turnsElapsed = 0;

    console.log( this.#defaults );
    console.log( "Model initialized!" );

    return this.getState();
  }

};
