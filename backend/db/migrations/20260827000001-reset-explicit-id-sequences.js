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

const resetSqliteSequence = async (sequelize, table) => {
  const [[sqliteSequenceTable]] = await sequelize.query(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
      AND name = 'sqlite_sequence';
  `);

  if (!sqliteSequenceTable) return;

  await sequelize.query(`
    UPDATE sqlite_sequence
    SET seq = COALESCE((SELECT MAX(id) FROM "${table}"), 0)
    WHERE name = '${table}';
  `);

  await sequelize.query(`
    INSERT INTO sqlite_sequence (name, seq)
    SELECT '${table}', COALESCE((SELECT MAX(id) FROM "${table}"), 0)
    WHERE NOT EXISTS (
      SELECT 1
      FROM sqlite_sequence
      WHERE name = '${table}'
    );
  `);
};

module.exports = {
  up: async (queryInterface) => {
    const sequelize = queryInterface.sequelize;
    const dialect = sequelize.getDialect();

    if (dialect === 'sqlite') {
      await resetSqliteSequence(sequelize, 'Orders');
      await resetSqliteSequence(sequelize, 'OrderItems');
      await resetSqliteSequence(sequelize, 'Licenses');
      return;
    }

    await resetSequence(sequelize, 'Orders');
    await resetSequence(sequelize, 'OrderItems');
    await resetSequence(sequelize, 'Licenses');
  },

  down: async () => {},
};
