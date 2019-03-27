import commander from 'commander';

import { initialize } from '../config';
import { migrate, rollback } from '../migrations';

const pkg = require('../../package.json');

export async function start(): Promise<void> {
  commander
    .name('postre')
    .description('postre CLI')
    .version(pkg.version, '-v, --version');

  commander
    .command(
      'initialize [directoryPath]',
      'initialize postre configuration file',
    )
    .alias('init')
    .action(async directoryPath => {
      await initialize({ directoryPath });
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
      await migrate({ toMigrationId: options.to, step: options.step });
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
      await rollback({
        toMigrationId: options.to,
        step: options.step,
      });
    });

  commander.parse(process.argv);
}

function parseIntegerOption(value: string): number {
  return Number.parseInt(value, 10);
}
