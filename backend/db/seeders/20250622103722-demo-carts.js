'use strict';

const bcrypt = require("bcryptjs");
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Carts';
    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        userId: 2,   // example user ID that exists in your Users table
        total: 89.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        userId: 3,   // another example user
        total: 0.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        userId: 1,
        total: 89.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Carts';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2] }
    }, {});
  }
};
