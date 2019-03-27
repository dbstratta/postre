import commander from 'commander';

import { initialize } from '../config';
import { migrate, rollback, createMigration } from '../migrations';

const pkg = require('../../package.json');

export async function start(): Promise<void> {
  commander
    .name('postre')
    .description(`postre CLI ${pkg.version}`)
    .version(pkg.version, '-v, --version');

  commander
    .command('initialize [directoryPath]')
    .description('initialize postre configuration file')
    .alias('init')
    .action(async directoryPath => {
      await tryOrLogError(async () => {
        await initialize({ directoryPath });
      });
    });

  commander
    .command('create-migration <migrationName>')
    .description('create an empty migration file')
    .action(async migrationName => {
      await tryOrLogError(async () => {
        await createMigration(migrationName);
      });
    });

  commander
    .command('migrate')
    .description('migrate pending migrations')
    .option(
      '--to <migrationId>',
      'migrate all pending migrations up to and including <migrationId>',
      parseIntegerOption,
    )
    .option('--all', 'migrate all pending migrations')
    .option(
      '-n, --step <n>',
      'migrate <n> pending migrations',
      parseIntegerOption,
    )
    .action(async options => {
      await tryOrLogError(async () => {
        await migrate({ toMigrationId: options.to, step: options.step });
      });
    });

  commander
    .command('rollback')
    .description('rollback applied migrations')
    .option(
      '--to <migrationId>',
      'rollback all applied migrations down to and including <migrationId>',
      parseIntegerOption,
    )
    .option('--all', 'rollback all applied migrations')
    .option(
      '-n, --step <n>',
      'rollback <n> applied migrations',
      parseIntegerOption,
    )
    .action(async options => {
      await tryOrLogError(async () => {
        if (options.to === undefined && options.step === undefined) {
          commander.help();
        }

        await rollback({
          toMigrationId: options.to,
          step: options.step,
        });
      });
    });

  commander.parse(process.argv);
}

function parseIntegerOption(value: string): number {
  return Number.parseInt(value, 10);
}

async function tryOrLogError(fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    console.error(error);
  }
}
