'use strict';

const bcrypt = require("bcryptjs");
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'OrderItems';

    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        orderId: 1,
        productId: 1,
        licenseId: 2,  // Premium license
        quantity: 1,
        priceAtPurchase: 49.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        orderId: 1,
        productId: 2,
        licenseId: null, // drum kit with no license
        quantity: 1,
        priceAtPurchase: 29.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        orderId: 2,
        productId: 2,
        licenseId: null,
        quantity: 1,
        priceAtPurchase: 29.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'OrderItems';
    const Op = Sequelize.Op;

    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3] },
    }, {});
  },
};
