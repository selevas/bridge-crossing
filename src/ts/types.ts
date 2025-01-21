export type Color = string; // It is assumed to be any CSS-valid color name.
export type Side = 'start' | 'end';

export type TimeInMS = number; // Time, in milliseconds.
export type TimeInSeconds = number; // Time, in seconds.
export type TimeInMinutes = number; // Time, in minutes.

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

export interface ModelState {
  finalState: boolean,
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

export interface Person {
  id: number; // The ID of the person
  name: string; // The person's name.
  crossTime: TimeInMinutes; // The time it takes the person to cross the bridge (in minutes).
  side?: 'start' | 'end'; // The side the person is on.
}

export interface View {
  update: (ModelState) => void
}

declare global {
  interface Window {
    appModel: AppModel;
    appController: () => void;
    appView: () => void;
  }
}

export {}
