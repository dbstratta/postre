import { PostreError } from './PostreError';

export class MigrationError extends PostreError {
  public constructor(message?: string) {
    super(message);

    this.name = MigrationError.name;
  }
}

export default MigrationError;
