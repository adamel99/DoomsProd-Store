'use strict';
let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Carts';
    return queryInterface.bulkInsert(options, [
      {
        userId: 2,
        total: 89.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 3,
        total: 0.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 1,
        total: 89.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Carts';
    return queryInterface.bulkDelete(options, null, {});
  }
};
