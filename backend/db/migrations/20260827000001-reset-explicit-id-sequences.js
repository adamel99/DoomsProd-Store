'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const tableName = (name) => (
  options.schema
    ? `"${options.schema}"."${name}"`
    : `"${name}"`
);

const serialSequenceTableName = (name) => (
  options.schema
    ? `"${options.schema}"."${name}"`
    : `"${name}"`
);

const resetSequence = async (sequelize, table) => {
  await sequelize.query(`
    SELECT setval(
      pg_get_serial_sequence('${serialSequenceTableName(table)}', 'id'),
      COALESCE((SELECT MAX(id) FROM ${tableName(table)}), 0) + 1,
      false
    );
  `);
};

module.exports = {
  up: async (queryInterface) => {
    const sequelize = queryInterface.sequelize;

    await resetSequence(sequelize, 'Orders');
    await resetSequence(sequelize, 'OrderItems');
    await resetSequence(sequelize, 'Licenses');
  },

  down: async () => {},
};
