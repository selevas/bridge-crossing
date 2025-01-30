import { ModelState } from "types";

type UpdateFunc = (state: ModelState) => void;

export default class AppView {
  update: UpdateFunc;

  constructor(update: UpdateFunc) {
    this.update = update;
  }
}
