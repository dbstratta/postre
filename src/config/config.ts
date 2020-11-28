import path from 'path';
import { promises as fs } from 'fs';

import { greenBright } from 'colorette';
import { cosmiconfig } from 'cosmiconfig';

import { ClientConnectionOptions } from '../clients';
import { MigrationError } from '../errors';
import { spinner } from '../helpers';

import { javaScriptConfigFileTemplate } from './templates';
import {
  defaultConfigFilename,
  defaultMigrationsTableSchema,
  defaultMigrationsTableName,
  cosmiconfigModuleName,
  cosmiconfigSearchPlaces,
} from './constants';

export type MigrationConfiguration = {
  migrationFilesDirectoryPath: string;
  migrationsTableName: string;
  migrationsTableSchema: string;
} & ClientConnectionOptions;

export async function loadConfiguration(): Promise<MigrationConfiguration> {
  spinner.start('Searching postre configuration file');

  let result: any;

  try {
    result = await loadRawConfiguration();
  } catch (error) {
    spinner.fail('postre configuration file is invalid');

    throw error;
  }

  if (!result || result.isEmpty) {
    spinner.fail("couldn't find postre configuration file or is empty");

    throw new MigrationError();
  }

  const migrationConfiguration: MigrationConfiguration = {
    migrationFilesDirectoryPath: makeMigrationFilesDirectoryPath(
      result.config,
      result.filepath,
    ),
    migrationsTableName:
      result.config.migrationsTableName || defaultMigrationsTableName,
    migrationsTableSchema:
      result.config.migrationsTableSchema || defaultMigrationsTableSchema,
    databaseHost: result.config.databaseHost,
    databasePort: result.config.databasePort,
    databaseName: result.config.databaseName,
    databaseUser: result.config.databaseUser,
    databaseUserPassword: result.config.databaseUserPassword,
    databaseConnectionString: result.config.databaseConnectionString,
  };

  spinner.succeed('postre configuration file loaded successfully');

  return migrationConfiguration;
}

async function loadRawConfiguration(): Promise<any> {
  const explorer = cosmiconfig(cosmiconfigModuleName, {
    searchPlaces: cosmiconfigSearchPlaces,
  });

  const result = await explorer.search();

  return result;
}

function makeMigrationFilesDirectoryPath(
  cosmiconfigConfig: any,
  cosmiconfigFilepath: string,
): string {
  const migrationFilesDirectoryPath =
    cosmiconfigConfig.migrationFilesDirectoryPath || './migrations';

  return path.resolve(
    path.dirname(cosmiconfigFilepath),
    migrationFilesDirectoryPath,
  );
}

export type InitializeArgs = {
  directoryPath?: string;
};

export async function initialize(args: InitializeArgs): Promise<void> {
  await createConfigFile(args.directoryPath);
}

async function createConfigFile(
  directoryPath: string = process.cwd(),
): Promise<void> {
  const configFilepath = path.resolve(directoryPath, defaultConfigFilename);

  spinner.start(`creating ${greenBright(configFilepath)}`);

  let result: any;

  try {
    result = await loadRawConfiguration();
  } catch {
    spinner.fail('postre configuration file already exists');

    return;
  }

  if (result) {
    spinner.fail('postre configuration file already exists');

    return;
  }

  try {
    await fs.writeFile(configFilepath, javaScriptConfigFileTemplate);
  } catch (error) {
    spinner.fail('failed to create postre configuration file');

    throw error;
  }

  spinner.succeed(`${greenBright(configFilepath)} created`);
}
