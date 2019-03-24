export const typeScriptTemplate = `\
import { sql, MigrationFunction } from 'postre';

export const up: MigrationFunction = (client) => {

};

export const down: MigrationFunction = (client) => {

};
`;

export const javaScriptTemplate = `\
import { sql } from 'postre';

export function up(client) {

}

export function down(client) {

}
`;

export const commonJSTemplate = `\
const { sql } = require('postre');

function up(client) {

}

function down(client) {

}

module.exports = { up, down };
`;
