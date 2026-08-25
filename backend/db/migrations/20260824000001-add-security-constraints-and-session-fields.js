'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const table = (tableName) => (
  process.env.NODE_ENV === 'production' ? { ...options, tableName } : tableName
);

const hasColumn = async (queryInterface, tableName, columnName) => {
  const description = await queryInterface.describeTable(table(tableName));
  return Boolean(description[columnName]);
};

const hasTable = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables.some((existingTable) => {
    if (typeof existingTable === 'string') return existingTable === tableName;
    return existingTable.tableName === tableName;
  });
};

const hasIndex = async (queryInterface, tableName, indexName) => {
  const indexes = await queryInterface.showIndex(table(tableName));
  return indexes.some((index) => index.name === indexName);
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!(await hasColumn(queryInterface, 'Users', 'tokenVersion'))) {
      await queryInterface.addColumn(table('Users'), 'tokenVersion', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!(await hasIndex(queryInterface, 'CartItems', 'cart_items_cart_product_license_unique'))) {
      await queryInterface.addIndex(table('CartItems'), ['cartId', 'productId', 'licenseId'], {
        unique: true,
        name: 'cart_items_cart_product_license_unique',
      });
    }

    if (!(await hasIndex(queryInterface, 'CartItems', 'cart_items_cart_product_no_license_unique'))) {
      await queryInterface.addIndex(table('CartItems'), ['cartId', 'productId'], {
        unique: true,
        name: 'cart_items_cart_product_no_license_unique',
        where: {
          licenseId: null,
        },
      });
    }

    if (await hasTable(queryInterface, 'ProcessedStripeEvents')) return;

    await queryInterface.createTable(table('ProcessedStripeEvents'), {
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
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
    });
  },

  down: async (queryInterface) => {
    if (await hasTable(queryInterface, 'ProcessedStripeEvents')) {
      await queryInterface.dropTable(table('ProcessedStripeEvents'));
    }

    if (await hasIndex(queryInterface, 'CartItems', 'cart_items_cart_product_no_license_unique')) {
      await queryInterface.removeIndex(table('CartItems'), 'cart_items_cart_product_no_license_unique');
    }

    if (await hasIndex(queryInterface, 'CartItems', 'cart_items_cart_product_license_unique')) {
      await queryInterface.removeIndex(table('CartItems'), 'cart_items_cart_product_license_unique');
    }

    if (await hasColumn(queryInterface, 'Users', 'tokenVersion')) {
      await queryInterface.removeColumn(table('Users'), 'tokenVersion');
    }
  },
};
