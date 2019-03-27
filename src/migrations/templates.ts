export const javaScriptMigrationFileTemplate = `\
const { sql } = require('postre');

async function migrate(client) {

}

async function rollback(client) {

}

module.exports = { migrate, rollback };
`;
