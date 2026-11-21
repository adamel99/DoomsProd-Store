'use strict';

const schemaOptions = process.env.NODE_ENV === 'production'
  ? { schema: process.env.SCHEMA }
  : {};
const table = (tableName) => process.env.NODE_ENV === 'production'
  ? { ...schemaOptions, tableName }
  : tableName;

const orderTableSql = () => process.env.NODE_ENV === 'production' && process.env.SCHEMA
  ? `"${process.env.SCHEMA}"."Orders"`
  : '"Orders"';
const userTableSql = () => process.env.NODE_ENV === 'production' && process.env.SCHEMA
  ? `"${process.env.SCHEMA}"."Users"`
  : '"Users"';

const addOrderDetails = async (queryInterface, Sequelize, options = {}) => {
  await queryInterface.addColumn(table('Orders'), 'customerName', {
    type: Sequelize.STRING(160), allowNull: true,
  }, options);
  await queryInterface.addColumn(table('Orders'), 'customerEmail', {
    type: Sequelize.STRING(254), allowNull: true,
  }, options);
  await queryInterface.addColumn(table('Orders'), 'source', {
    type: Sequelize.STRING(24), allowNull: false, defaultValue: 'website',
  }, options);
  await queryInterface.addColumn(table('Orders'), 'paymentMethod', {
    type: Sequelize.STRING(40), allowNull: true,
  }, options);
  await queryInterface.addColumn(table('Orders'), 'paymentReference', {
    type: Sequelize.STRING(200), allowNull: true,
  }, options);
  await queryInterface.addColumn(table('Orders'), 'notes', {
    type: Sequelize.TEXT, allowNull: true,
  }, options);

  const ordersTable = orderTableSql();
  const usersTable = userTableSql();
  await queryInterface.sequelize.query(`
    UPDATE ${ordersTable}
    SET "customerName" = COALESCE(
          (SELECT COALESCE(
             NULLIF(TRIM(COALESCE(users."firstName", '') || ' ' || COALESCE(users."lastName", '')), ''),
             NULLIF(users."username", ''),
             'Customer'
           ) FROM ${usersTable} AS users WHERE users."id" = "Orders"."userId"),
          'Customer'
        ),
        "customerEmail" = (SELECT users."email" FROM ${usersTable} AS users WHERE users."id" = "Orders"."userId"),
        "paymentMethod" = CASE WHEN "paymentIntentId" IS NOT NULL THEN 'stripe' ELSE NULL END
    WHERE "userId" IS NOT NULL
  `, options);
};

const makeUserIdNullable = async (queryInterface, Sequelize, options = {}) => {
  if (queryInterface.sequelize.getDialect() === 'sqlite') {
    // SQLite rebuilds the table for changeColumn. Disable FK actions on this
    // connection while rebuilding so OrderItems remain attached to their rows.
    await queryInterface.changeColumn(table('Orders'), 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: table('Users'), key: 'id' },
      onDelete: 'CASCADE',
    }, options);
    return;
  }

  await queryInterface.sequelize.query(`
    ALTER TABLE ${orderTableSql()} ALTER COLUMN "userId" DROP NOT NULL
  `, options);
};

const runSqliteWithForeignKeysDisabled = async (sequelize, callback) => {
  // SQLite PRAGMAs are connection-local and cannot be changed inside a
  // transaction, so all migration statements use Sequelize's default
  // connection with a manually controlled transaction.
  await sequelize.query('PRAGMA foreign_keys = OFF');
  let transactionStarted = false;
  try {
    await sequelize.query('BEGIN IMMEDIATE TRANSACTION');
    transactionStarted = true;
    await callback();
    await sequelize.query('COMMIT');
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) await sequelize.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await sequelize.query('PRAGMA foreign_keys = ON');
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    const migrate = async (options = {}) => {
      await addOrderDetails(queryInterface, Sequelize, options);
      await makeUserIdNullable(queryInterface, Sequelize, options);
    };

    if (sequelize.getDialect() === 'sqlite') {
      return runSqliteWithForeignKeysDisabled(sequelize, () => migrate());
    }

    return sequelize.transaction((transaction) => migrate({ transaction }));
  },

  down: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    const revert = async (options = {}) => {
      if (sequelize.getDialect() === 'sqlite') {
        await queryInterface.changeColumn(table('Orders'), 'userId', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: table('Users'), key: 'id' },
          onDelete: 'CASCADE',
        }, options);
      } else {
        await sequelize.query(`
          ALTER TABLE ${orderTableSql()} ALTER COLUMN "userId" SET NOT NULL
        `, options);
      }
      for (const column of ['notes', 'paymentReference', 'paymentMethod', 'source', 'customerEmail', 'customerName']) {
        await queryInterface.removeColumn(table('Orders'), column, options);
      }
    };

    if (sequelize.getDialect() === 'sqlite') {
      return runSqliteWithForeignKeysDisabled(sequelize, () => revert());
    }

    return sequelize.transaction((transaction) => revert({ transaction }));
  },
};
