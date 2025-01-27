export class BaseError<TData = {[id: string]: any}> {
  name: string;
  message?: string;
  data?: TData;

  constructor(name: string, message?: string, data?: TData) {
    this.name = name;
    this.message = message;
    this.data = data;
  }
}

export class ValueError extends BaseError<{[id: string]: any} & {value: string | number | boolean}> {}
