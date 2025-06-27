'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'CartItems';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [users, carts, products, licenses] = await Promise.all([
      queryInterface.sequelize.query(`SELECT id FROM "Users" LIMIT 1;`, { type: Sequelize.QueryTypes.SELECT }),
      queryInterface.sequelize.query(`SELECT id FROM "Carts" LIMIT 1;`, { type: Sequelize.QueryTypes.SELECT }),
      queryInterface.sequelize.query(`SELECT id FROM "Products" ORDER BY id ASC LIMIT 3;`, { type: Sequelize.QueryTypes.SELECT }),
      queryInterface.sequelize.query(`SELECT id FROM "Licenses" LIMIT 1;`, { type: Sequelize.QueryTypes.SELECT }),
    ]);

    const userId = users[0]?.id;
    const cartId = carts[0]?.id;
    const licenseId = licenses[0]?.id;

    return queryInterface.bulkInsert(options, [
      {
        userId,
        cartId,
        productId: products[0]?.id,
        licenseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        cartId,
        productId: products[1]?.id,
        licenseId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId,
        cartId,
        productId: products[2]?.id,
        licenseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      quantity: { [Op.in]: [1, 2] },
    }, {});
  }
};
