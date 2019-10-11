/* eslint-disable max-classes-per-file */

export class PostreError extends Error {
  public constructor(message?: string) {
    super(message);

    this.name = PostreError.name;
  }
}

export class NoConditionsError extends PostreError {
  public constructor() {
    super('Expected at least one condition but got none');

    this.name = NoConditionsError.name;
  }
}

export class MigrationError extends PostreError {
  public constructor(message?: string) {
    super(message);

    this.name = MigrationError.name;
  }
}

export class MultipleColumnsError extends PostreError {
  public constructor(actualColumnCount: number) {
    super(`Expected at most one column but got ${actualColumnCount}`);

    this.name = MultipleColumnsError.name;
  }
}

export class MultipleRowsError extends PostreError {
  public constructor(actualRowCount: number) {
    super(`Expected at most one row but got ${actualRowCount}`);

    this.name = MultipleRowsError.name;
  }
}

export class NoRowsError extends PostreError {
  public constructor() {
    super('Expected at least one row but got none');

    this.name = NoRowsError.name;
  }
}

/* eslint-enable max-classes-per-file */
