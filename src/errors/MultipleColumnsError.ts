import { PostreError } from './PostreError';

export class MultipleColumnsError extends PostreError {
  public constructor(actualColumnCount: number) {
    super(`Expected at most one column but got ${actualColumnCount}`);

    this.name = MultipleColumnsError.name;
  }
}

export default MultipleColumnsError;
