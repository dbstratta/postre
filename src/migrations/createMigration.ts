import path from 'path';
import fs from 'fs';

import { greenBright } from 'colorette';

import { loadConfiguration, MigrationConfiguration } from '../config';
import { spinner } from '../helpers';

import { MigrationId } from './types';
import { SupportedFileExtensions, migrationFilenameSeparator } from './constants';
import { javaScriptMigrationFileTemplate } from './templates';
import { createMigrationFilesDirectory } from './migrationFiles';

export async function createMigration(migrationName: string): Promise<void> {
  const configuration = await loadConfiguration();

  await createMigrationFilesDirectory(configuration);

  const migrationFilename = makeMigrationFilename(migrationName);

  await writeMigrationToFile(configuration, migrationFilename);
}

function makeMigrationFilename(
  migrationName: string,
  extension: SupportedFileExtensions = SupportedFileExtensions.Js,
  date: Date = new Date(),
): string {
  const migrationIdString = makeMigrationId(date).toString();

  return `${migrationIdString}${migrationFilenameSeparator}${migrationName}.${extension}`;
}

function makeMigrationId(date: Date): MigrationId {
  const yearString = date
    .getUTCFullYear()
    .toString()
    .padStart(4, '0');
  const monthString = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const dayString = date
    .getUTCDate()
    .toString()
    .padStart(2, '0');
  const hourString = date
    .getUTCHours()
    .toString()
    .padStart(2, '0');
  const minuteString = date
    .getUTCMinutes()
    .toString()
    .padStart(2, '0');
  const secondString = date
    .getUTCSeconds()
    .toString()
    .padStart(2, '0');
  const millisecondString = date
    .getUTCMilliseconds()
    .toString()
    .padStart(4, '0');

  const migrationId = BigInt(
    yearString +
      monthString +
      dayString +
      hourString +
      minuteString +
      secondString +
      millisecondString,
  );

  return migrationId;
}

async function writeMigrationToFile(
  configuration: MigrationConfiguration,
  filename: string,
): Promise<void> {
  const filepath = path.resolve(configuration.migrationFilesDirectoryPath, filename);

  spinner.start(`creating ${greenBright(filepath)}`);

  try {
    await fs.promises.writeFile(filepath, javaScriptMigrationFileTemplate);
  } catch (error) {
    spinner.fail('failed to create migration');

    throw error;
  }

  spinner.succeed(`${greenBright(filepath)} created`);
}
