'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') options.schema = process.env.SCHEMA;
const table = (tableName) => process.env.NODE_ENV === 'production' ? { ...options, tableName } : tableName;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(table('Promotions'), {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING(120), allowNull: false },
      type: { type: Sequelize.ENUM('code', 'first_purchase', 'bundle'), allowNull: false },
      code: { type: Sequelize.STRING(40), allowNull: true, unique: true },
      discountPercent: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      minBasicBeatCount: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      startsAt: { type: Sequelize.DATE, allowNull: true },
      endsAt: { type: Sequelize.DATE, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    }, options);

    await queryInterface.addColumn(table('Orders'), 'subtotalPrice', { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn(table('Orders'), 'promotionName', { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn(table('Orders'), 'promoCode', { type: Sequelize.STRING(40), allowNull: true });
    await queryInterface.addColumn(table('Orders'), 'discountPercent', { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 });
    await queryInterface.addColumn(table('Orders'), 'discountAmount', { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 });
    await queryInterface.sequelize.query(`UPDATE ${process.env.NODE_ENV === 'production' && process.env.SCHEMA ? `"${process.env.SCHEMA}".` : ''}"Orders" SET "subtotalPrice" = "totalPrice"`);
    const now = new Date();
    await queryInterface.bulkInsert(table('Promotions'), [
      {
        name: 'First purchase', type: 'first_purchase', code: null, discountPercent: 25,
        minBasicBeatCount: 0, startsAt: null, endsAt: null, isActive: true, createdAt: now, updatedAt: now,
      },
      {
        name: '2 Basic beat leases', type: 'bundle', code: null, discountPercent: 30,
        minBasicBeatCount: 2, startsAt: null, endsAt: null, isActive: true, createdAt: now, updatedAt: now,
      },
    ]);
  },
  down: async (queryInterface) => {
    for (const column of ['subtotalPrice', 'promotionName', 'promoCode', 'discountPercent', 'discountAmount']) {
      await queryInterface.removeColumn(table('Orders'), column);
    }
    await queryInterface.dropTable(table('Promotions'));
  },
};
