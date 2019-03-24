export type ClientSharedOptions =
  | {
      /**
       * The host to connect to.
       * E.g., `my-database-server.com`.
       */
      databaseHost: string;
      /**
       * The port to connect to.
       * E.g., `5432`.
       */
      databasePort: number;
      /**
       * The user to connect to the database as.
       */
      databaseUser: string;
      /**
       * The password of the user.
       */
      databaseUserPassword: string | undefined;
      /**
       * The name of the database.
       */
      databaseName: string;
      databaseConnectionString?: undefined;
    }
  | {
      /**
       * The connection string to connect to the database.
       * E.g., `postgres://user:password@host:port/database`.
       */
      databaseConnectionString: string;
      databaseHost?: undefined;
      databasePort?: undefined;
      databaseUser?: undefined;
      databaseUserPassword?: undefined;
      databaseName?: undefined;
    };
