import path from 'path';
import { promises as fs } from 'fs';

import ora, { Ora } from 'ora';
import { greenBright } from 'colorette';

import { SupportedFileExtensions } from './constants';
import { javaScriptTemplate } from './templates';
import { loadConfiguration, MigrationConfiguration } from './config';

export async function createMigration(migrationName: string): Promise<string> {
  const spinner = ora();

  const configuration = await loadConfiguration(spinner);

  const migrationFilename = makeMigrationFilename(migrationName);

  await writeMigrationFile(configuration, migrationFilename, spinner);

  return migrationFilename;
}

export default createMigration;

function makeMigrationFilename(
  migrationName: string,
  extension: SupportedFileExtensions = SupportedFileExtensions.Js,
  date: Date = new Date(),
): string {
  const dateString = serializeDateForMigrationFilename(date);

  return `${dateString}_${migrationName}.${extension}`;
}

function serializeDateForMigrationFilename(date: Date): string {
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

  return (
    yearString +
    monthString +
    dayString +
    hourString +
    minuteString +
    secondString +
    millisecondString
  );
}

async function writeMigrationFile(
  configuration: MigrationConfiguration,
  filename: string,
  spinner: Ora,
): Promise<void> {
  const filepath = path.resolve(
    configuration.migrationFilesDirectoryPath,
    filename,
  );

  spinner.start(`creating ${greenBright(filepath)}`);

  try {
    await fs.writeFile(filepath, javaScriptTemplate);
  } catch (error) {
    spinner.fail('failed to create migration');
  }

  spinner.succeed(`${greenBright(filepath)} created`);
}
