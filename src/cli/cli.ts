import commander from 'commander';

import { initialize } from '../config';
import { migrate, rollback, createMigration } from '../migrations';

const pkg = require('../../package.json');

const cliName = 'postre';
const cliVersion = pkg.version;

export async function run(): Promise<void> {
  tryOrLogError(async () => {
    await doRun();
  });
}

export async function doRun(): Promise<void> {
  commander
    .name(cliName)
    .description(`${cliName} ${cliVersion}`)
    .version(cliVersion, '-v, --version');

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
    .description(
      'migrate pending migrations; migrate all pending migrations if no option is provided',
    )
    .option(
      '--to <migrationId>',
      'migrate all pending migrations up to and including <migrationId>',
      parseBigintOption,
    )
    .option('--all', 'migrate all pending migrations')
    .option('-n, --step <n>', 'migrate <n> pending migrations', parseIntegerOption)
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
      'rollback all applied migrations down to and including <migrationId>; rollback 1 applied migration if no option is provided',
      parseBigintOption,
    )
    .option('--all', 'rollback all applied migrations')
    .option('-n, --step <n>', 'rollback <n> applied migrations', parseIntegerOption)
    .action(async options => {
      await tryOrLogError(async () => {
        let step: any;

        if (options.to === undefined && options.step === undefined && options.all === undefined) {
          step = 1;
        } else {
          step = options.step;
        }

        await rollback({
          toMigrationId: options.to,
          step,
        });
      });
    });

  commander.parse(process.argv);
}

function parseBigintOption(value: string): bigint {
  return BigInt(value);
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
