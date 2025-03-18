import {
  Side,
  TimeInMinutes,
  PersonID,
  ModelState,
  PersonDefinition,
  Person,
} from "./types";

import {
  ResourceError,
  ValueError,
} from "./classes/Errors";

import defaultPresets from "../../data/default-presets.json";

import Preset, { PresetImport } from "./classes/Preset";

export default class AppModel {

  static importDefaultPresets(): PresetImport {
    // For now, we get Presets from a local JSON file
    // In the future, this may change, but this static method just
    // needs to change its implementation.
    return Preset.importPresetObjects(defaultPresets);
  }

  #presets: Preset[];
  #activePreset: Preset; // A reference to one of those in #presets

  constructor() {
    const presetImport: PresetImport = AppModel.importDefaultPresets();
    if (presetImport.failed.length > 0) {
      // TODO: Add errors to state so that the controller can broadcast them to the
      // views to display in a dialog or something similar.
      console.warn(`${presetImport.failed.length} presets failed to load:`);
      for (const failed of presetImport.failed) {
        console.warn(failed);
      }
    }
    this.#presets = presetImport.successful;
    if (presetImport.successful.length === 0) {
      this.#presets.push(new Preset("default", 2, [], "start"));
    }
    const activePreset: Preset = this.getPreset("default") ?? this.#presets[0];
    this.loadPreset(activePreset);
  }

  /**
   * Getter for a specific Preset.
   *
   * Note that it returns a copy of the Preset object rather than the original,
   * so that it cannot be modified arbitrarily outside of the model.
   *
   * @param {string} [property] - The name of the desired preset.
   *
   * @return {Preset | undefined} - Returns the selected preset, or undefined if not found.
   */
  getPreset(name: string): Preset | undefined {
    const preset: Preset | undefined = this.#presets.find((p: Preset) => p.name === name);
    if (preset === undefined) {
      return undefined;
    }
    return preset.clone(preset.name);
  }

  /**
   * Getter for the active Preset.
   *
   * Note that it returns a copy of the Preset object rather than the original,
   * so that it cannot be modified arbitrarily outside of the model.
   *
   * @return {Preset} - Returns the active preset.
   */
  getActivePreset(): Preset {
    return this.#activePreset.clone(this.#activePreset.name);
  }

  /**
   * Getter for the list of Presets.
   *
   * Note that each element of the returned array is a copy of its respective Preset
   * object to prevent modification of the original from outside the model.
   *
   * @return {Preset[]} - The list of Presets.
   */
  getPresets(): Preset[] {
    return this.#presets.map((preset: Preset) => preset.clone(preset.name));
  }

  /**
   * Creates a new Preset based on the model's current configuration.
   *
   * @param {string} name - The name of the new Preset.
   *
   * @return {Preset}
   */
  createPresetFromModel(name: string): Preset {
    return new Preset(name, this.#bridgeWidth, this.#people, this.#torchSide);
  }

  /**
   * Loads the specified Preset into the model.
   *
   * If it's a string, it will attempt to search for the Preset with that name in the
   * list of Presets.
   *
   * @throws {ResourceError}
   *
   * @param {string | Preset} preset - The name or Preset object to load.
   */
  loadPreset(preset: string | Preset): void {
    if (typeof preset === "string") {
      const p: Preset | undefined = this.getPreset(preset);
      if (p === undefined) {
        throw new ResourceError(
          "PRESET_NOT_FOUND",
          `The preset "${preset}" was not found in the current list of presets.`,
        );
      }
      preset = p;
    }
    this.#activePreset = preset;
    this.init();
  }

  /**
   * Saves the provided Preset to the list of Presets.
   *
   * If no Preset with the same name exists, it will save it as a new Preset.
   *
   * If a Preset with the same name already exists, and the `confirmed`
   * parameter is true, it will overwrite the Preset.
   *
   * If a Preset with the same name already exists, and the `confirmed`
   * parameter is false, the function will return false and the Preset will
   * not be saved. This indicates that confirmation is necessary in order to
   * save the Preset.
   *
   * @param {Preset} preset - The Preset to save.
   * @param {boolean} confirmed - True if an overwrite has been authorized.
   *
   * @return {boolean} - True if the Preset was saved successfully.
   */
  savePreset(preset: Preset, confirmed: boolean = false): boolean {
    const existingPresetIndex: number = this.#presets.findIndex((p: Preset): boolean => p.name === preset.name);
    if (existingPresetIndex === -1) {
      // The preset was not found, so we go ahead and add it
      this.#presets.push(preset);
      return true;
    }
    if (confirmed === true) {
      // The preset was found, but we have confirmation to replace it.
      this.#presets.splice(existingPresetIndex, 1, preset);
      return true;
    }
    return false;
  }

  /**
   * Saves the current model settings to the active Preset.
   */
  updateActivePreset(): void {
    this.#activePreset = this.createPresetFromModel(this.#activePreset.name);
    this.savePreset(this.#activePreset, true);
  }

  /**
   * Returns true if current model settings differ from selected Preset.
   *
   * There's definitely room to optimize, but it should work and is simple for now.
   *
   * @return {boolean}
   */
  hasBeenModified(): boolean {
    const modifiedPreset: Preset = new Preset("*", this.#bridgeWidth, this.#people, this.#torchSide);
    if (modifiedPreset.equals(this.#activePreset)) {
      return false;
    }
    return true;
  }

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
   * Adds a person to the active model.
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
   * Note that this method relies upon the preexisting IDs found in the Person
   * array that it utilizes (the `people` parameter, if present, otherwise
   * `this.#people`). It uses the Persons found in that array to determine what the
   * next ID should be. Therefore it should NOT be used as part of a .map()
   * function to generate a list of Persons all at once; rather, it should be used
   * in a loop as each Person is pushed into the array one by one.
   *
   * At some point I may change this to something more robust and less tightly-
   * coupled to the existing IDs in the Person[] array.
   *
   * @param {Person[]} [people] - An array of Person[] objects that it uses to
   *                              calculate the next ID. Optional.
   *
   * @return {number} - The new Person ID.
   */
  #generatePersonId(people?: Person[]): number {
    return Math.max(-1, ...(people ?? this.#people).map(p => p.id)) + 1;
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
      successful: this.isSuccessful(),
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
    const person: Person | undefined = this.#people
        .find( (p: Person): boolean => p.id === personId );
    if (person === undefined) {
      return undefined;
    }
    return {...person}; // a copy of the Person
  }

  getPersonByName(name: string): Person | undefined {
    const person: Person | undefined = this.#people
        .find( (p: Person): boolean => p.name === name );
    if (person === undefined) {
      return undefined;
    }
    return {...person}; // a copy of the Person
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
    const person: Person | undefined = this.#people.find((p: Person) => p.id === personId);
    if (person === undefined) {
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
   * person needing to cross, or if the torch starts at the end and nobody else
   * does.
   *
   * @return {boolean} - Whether the model has reached its final state.
   */
  isFinalState(): boolean {
    if (this.isSuccessful()) {
      return true;
    }
    if (this.#bridgeWidth < 2 && this.getPeopleAtStart().length > 1) {
      return true;
    }
    if (this.#torchSide === 'end' && this.getPeopleAtEnd().length === 0) {
      return true;
    }
    return false;
  }

  /**
   * Determines whether the model has completed successfully or not.
   *
   * Note that this is distinct from whether the model has entered its
   * final state or not. In some cases, the model may reach its final
   * state without completing successfully. In such case, this method
   * will return false, despite isFinalState() returning true.
   *
   * Currently, the only criteria to determine success is if there are
   * no people at the start. This includes the scenario in which there
   * are no people at all.
   *
   * @return {boolean} - Whether the model has successfully completed.
   */
  isSuccessful(): boolean {
    if (this.getPeopleAtStart().length === 0) {
      return true;
    }
    return false;
  }



  /**
   * Initializes the model.
   *
   * This function should be called whenever the user wishes to reset the
   * program, including at the very beginning when the program first loads.
   *
   * @return void
   */
  init(): ModelState {
    this.#bridgeWidth = this.#activePreset.bridgeWidth;
    this.#people = [];
    for (const person of this.#activePreset.people) {
      // We have to do it this way instead of mapping this.#activePreset.people, because
      // each ID is generated based on the previous IDs generated within this.#people.
      // If we change the way that the IDs are generated to something a little less
      // coupled to this.#people, we may be able to change this at some point in the future.
      this.#people.push({...person, id: this.#generatePersonId()});
    }
    this.#torchSide = this.#activePreset.torchSide;

    this.#timePassed = 0;
    this.#turnsElapsed = 0;

    console.log( this.#activePreset );
    console.log( "Model initialized!" );

    return this.getState();
  }

};
