'use strict';

const bcrypt = require("bcryptjs");
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Licenses';

    return queryInterface.bulkInsert(options, [
      {
        id: 1,
        name: 'Basic',
        price: 29.99,
        description: 'Basic license for personal use with limited downloads.',
        downloadLimit: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: 'Premium',
        price: 49.99,
        description: 'Premium license for commercial use with unlimited downloads.',
        downloadLimit: null,  // null means unlimited
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: 'Unlimited',
        price: 99.99,
        description: 'Unlimited license with extended rights and support.',
        downloadLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: 'Exclusive',
        price: 299.99,
        description: 'Exclusive rights to the beat; only one buyer.',
        downloadLimit: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = "Licenses";
    const Op = Sequelize.Op;

    return queryInterface.bulkDelete(options, {
      id: { [Op.in]: [1, 2, 3, 4] },
    }, {});
  },
};
