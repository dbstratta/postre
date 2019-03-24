export class PostreError extends Error {
  public constructor(message?: string) {
    super(message);

    this.name = PostreError.name;
  }
}

export default PostreError;
