'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const table = (tableName) => (
  process.env.NODE_ENV === 'production' ? { ...options, tableName } : tableName
);

const hasTable = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((existingTable) => {
    if (typeof existingTable === 'string') return existingTable === tableName;
    return existingTable.tableName === tableName;
  });
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (await hasTable(queryInterface, 'LoginAttempts')) return;

    await queryInterface.createTable(table('LoginAttempts'), {
      credential: {
        type: Sequelize.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      resetAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface) => {
    if (await hasTable(queryInterface, 'LoginAttempts')) {
      await queryInterface.dropTable(table('LoginAttempts'));
    }
  },
};
