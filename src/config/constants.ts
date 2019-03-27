export const cosmiconfigModuleName = 'postre';

export const defaultConfigFilename = `${cosmiconfigModuleName}.config.js`;

export const cosmiconfigSearchPlaces = [
  defaultConfigFilename,
  `.${cosmiconfigModuleName}rc.js`,
  `.${cosmiconfigModuleName}rc.yaml`,
  `.${cosmiconfigModuleName}rc.yml`,
  `.${cosmiconfigModuleName}rc.json`,
];

export const defaultMigrationsTableSchema = 'public';
export const defaultMigrationsTableName = 'schema_migrations';
