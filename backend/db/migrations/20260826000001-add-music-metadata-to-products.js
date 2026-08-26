"use strict";

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = "Products";

    await queryInterface.addColumn(options, "genre", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn(options, "bpm", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn(options, "key", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn(options, "artistTags", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    options.tableName = "Products";

    await queryInterface.removeColumn(options, "artistTags");
    await queryInterface.removeColumn(options, "key");
    await queryInterface.removeColumn(options, "bpm");
    await queryInterface.removeColumn(options, "genre");
  },
};
