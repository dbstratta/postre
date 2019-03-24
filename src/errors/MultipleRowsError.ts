import { PostreError } from './PostreError';

export class MultipleRowsError extends PostreError {
  public constructor(actualRowCount: number) {
    super(`Expected at most one row but got ${actualRowCount}`);

    this.name = MultipleRowsError.name;
  }
}

export default MultipleRowsError;
