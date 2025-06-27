'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define schema in production
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'CartItems';
    return queryInterface.createTable('CartItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
      },
      cartId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Carts', key: 'id' },
        onDelete: 'CASCADE',
      },
      productId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Products', key: 'id' },
        onDelete: 'CASCADE',
      },
      licenseId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Licenses', key: 'id' },
        onDelete: 'SET NULL',
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
    }, options);
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'CartItems';
    return queryInterface.dropTable(options);
  }
};
