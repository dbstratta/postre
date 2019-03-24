import { PostreError } from './PostreError';

export class NoRowsError extends PostreError {
  public constructor() {
    super('Expected at least one row but got none');

    this.name = NoRowsError.name;
  }
}

export default NoRowsError;
