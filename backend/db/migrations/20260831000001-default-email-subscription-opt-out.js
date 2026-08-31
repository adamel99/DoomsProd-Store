'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const table = process.env.NODE_ENV === 'production'
  ? { ...options, tableName: 'Users' }
  : 'Users';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(table, 'isSubscribedToEmails', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(table, 'isSubscribedToEmails', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },
};
