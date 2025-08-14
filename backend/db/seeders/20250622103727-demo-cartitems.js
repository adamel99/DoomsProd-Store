'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'CartItems';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Use correct schema (production or public)
    const schema = options.schema ? `"${options.schema}"` : 'public';

    const [users, carts, products, licenses] = await Promise.all([
      queryInterface.sequelize.query(
        `SELECT id FROM ${schema}."Users" LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id FROM ${schema}."Carts" LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id FROM ${schema}."Products" ORDER BY id ASC LIMIT 3;`,
        { type: Sequelize.QueryTypes.SELECT }
      ),
      queryInterface.sequelize.query(
        `SELECT id FROM ${schema}."Licenses" LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      ),
    ]);

    const userId = users[0]?.id;
    const cartId = carts[0]?.id;
    const licenseId = licenses[0]?.id;

    return queryInterface.bulkInsert(
      options,
      [
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
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'CartItems';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(
      options,
      {
        // Remove all entries from this seeder
        productId: { [Op.in]: [1, 2, 3] },
      },
      {}
    );
  },
};
