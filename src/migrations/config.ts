import path from 'path';

import cosmiconfig from 'cosmiconfig';
import { Ora } from 'ora';

import { ClientConnectionOptions } from '../clients';
import { MigrationError } from '../errors';

export type MigrationConfiguration = {
  migrationFilesDirectoryPath: string;
  migrationsTableName: string;
  migrationsTableSchemaName: string;
} & ClientConnectionOptions;

const cosmiconfigModuleName = 'postre';

export async function loadConfiguration(
  spinner: Ora,
): Promise<MigrationConfiguration> {
  spinner.start('Searching postre configuration file');

  const explorer = cosmiconfig(cosmiconfigModuleName);

  const result = await explorer.search();

  if (!result || result.isEmpty) {
    spinner.fail("Couldn't find postre configuration file or is empty");

    throw new MigrationError();
  }

  const migrationConfiguration: MigrationConfiguration = {
    migrationFilesDirectoryPath: makeMigrationFilesDirectoryPath(
      result.config,
      result.filepath,
    ),
    migrationsTableName:
      result.config.migrationsTableName || 'schema_migrations',
    migrationsTableSchemaName:
      result.config.migrationsTableSchemaName || 'public',
    databaseHost: result.config.databaseHost,
    databasePort: result.config.databasePort,
    databaseName: result.config.databaseName,
    databaseUser: result.config.databaseUser,
    databaseUserPassword: result.config.databaseUserPassword,
    databaseConnectionString: result.config.databaseConnectionString,
  };

  spinner.succeed('postre configuration file found');

  return migrationConfiguration;
}

function makeMigrationFilesDirectoryPath(
  cosmiconfigConfig: cosmiconfig.Config,
  cosmiconfigFilepath: string,
): string {
  const migrationFilesDirectoryPath =
    cosmiconfigConfig.migrationFilesDirectoryPath || './migrations';

  return path.resolve(
    path.dirname(cosmiconfigFilepath),
    migrationFilesDirectoryPath,
  );
}
