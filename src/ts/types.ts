export type Color = string; // It is assumed to be any CSS-valid color name.
export type Side = 'start' | 'end';

export type TimeInMS = number; // Time, in milliseconds.
export type TimeInSeconds = number; // Time, in seconds.
export type TimeInMinutes = number; // Time, in minutes.

export type PersonID = number; // This is a number that represents a specific Person.
export type IntervalID = number | null; // This is a number that represents a specific Interval object.
export type TimeoutID = number | null; // This is a number that represents a specific Timeout object.

export interface AppModel {
  subscribe(view: View): void;
  addPerson(name: string, crossTime: TimeInMinutes): void;
  init(): ModelState;
  getDefaultBridgeWidth(): number;
  getState(): ModelState;
  removePerson(id: number): void;
  setBridgeWidth(width: number): number;
  setPersonSide(person: string | number, side: Side): void;
  stepForward(): ModelState;
  (): void; // Marking the interface as callable, since it's actually a function
}

export interface AppController {
  subscribe(view: View): void;
  unsubscribe(view: View): void;
  sendUpdate(view: View): void;
  getUpdate(): ModelState;
  getBridgeWidth(): number;
  resetModel(): ModelState;
  addPerson(name: string, crossTime: TimeInMinutes): void;
  removePerson(id: number): void;
  movePerson(id: number, side: Side): void;
  setBridgeWidth(bridgeWidth: number): void;
  stepForward(): void;
  init(): void;
}

export interface ModelState {
  finalState: boolean,
  successful: boolean,
  peopleAtStart: Person[],
  peopleAtEnd: Person[],
  timePassed: TimeInMinutes,
  turnsElapsed: number,
  torchSide: Side,
}

export interface PersonAppearance {
  color: Color; // The color of the person. Only used if people are dots.
  skinColor?: Color; // The color of the person's skin.
  hairColor?: Color; // The color of the person's hair.
  shirtColor?: Color; // The color of the person's shirt.
  pantsColor?: Color; // The color of the person's pants.
}

/**
 * A PersonDefinition only includes data about the person, like
 * their name and speed. It does not represent an _actual_ person.
 */
export interface PersonDefinition {
  name: string; // The person's name.
  crossTime: TimeInMinutes; // The time it takes the person to cross the bridge (in minutes).
  side?: 'start' | 'end'; // The side the person is on.
}

/**
 * An actual Person includes an id.
 */
export interface Person extends PersonDefinition {
  id: PersonID; // The ID of the person
}

export interface View {
  update: (ModelState) => void
}

declare global {
  interface Window {
    appModel: AppModel;
    appController: AppController;
    appView: () => void;
  }
}

export {}
