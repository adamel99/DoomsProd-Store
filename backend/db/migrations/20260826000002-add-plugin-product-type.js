"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === "postgres") {
      const schemaPrefix = options.schema ? `"${options.schema}".` : "";
      return queryInterface.sequelize.query(
        `ALTER TYPE ${schemaPrefix}"enum_Products_type" ADD VALUE IF NOT EXISTS 'plugin';`
      );
    }

    options.tableName = "Products";
    return queryInterface.changeColumn(options, "type", {
      type: Sequelize.ENUM("beat", "loop_kit", "drum_kit", "plugin"),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    if (queryInterface.sequelize.getDialect() === "postgres") {
      return Promise.resolve();
    }

    options.tableName = "Products";
    return queryInterface.changeColumn(options, "type", {
      type: Sequelize.ENUM("beat", "loop_kit", "drum_kit"),
      allowNull: false,
    });
  },
};
