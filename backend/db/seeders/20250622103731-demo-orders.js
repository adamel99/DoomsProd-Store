'use strict';

const bcrypt = require("bcryptjs");
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Orders';

    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        userId: 2,
        totalPrice: 79.98,
        status: 'completed',
        paymentIntentId: 'pi_1234567890abcdef',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        userId: 3,
        totalPrice: 49.99,
        status: 'pending',
        paymentIntentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Orders';
    const Op = Sequelize.Op;

    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2] },
    }, {});
  },
};
