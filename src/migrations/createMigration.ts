export async function createMigration(migrationName: string): Promise<string> {
  const migrationFilename = makeMigrationFilename(migrationName);

  return migrationFilename;
}

export default createMigration;

function makeMigrationFilename(
  migrationName: string,
  extension: string = 'js',
  date: Date = new Date(),
): string {
  const dateString = serializeDateForMigrationFilename(date);

  return `${dateString}_${migrationName}.${extension}`;
}

function serializeDateForMigrationFilename(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const millisecond = date.getUTCMilliseconds();

  return (
    year.toString() +
    month.toString() +
    day.toString() +
    hour.toString() +
    minute.toString() +
    second.toString() +
    millisecond.toString()
  );
}
