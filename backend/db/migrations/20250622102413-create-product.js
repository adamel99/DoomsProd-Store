"use strict";

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Products';

    return queryInterface.createTable(
      'Products', // table name
      {           // column definitions object (this was broken in your code)
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Users', key: 'id' },
          onDelete: 'CASCADE',
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
          defaultValue: '',
        },
        type: {
          type: Sequelize.ENUM('beat', 'loop_kit', 'drum_kit'),
          allowNull: false,
        },
        youtubeLink: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        audioPreviewUrl: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
        },
        imageUrl: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        downloadUrls: {
          type: Sequelize.JSON,
          allowNull: true, // Only needed for downloadable products
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
    options.tableName = 'Products';
    return queryInterface.dropTable(options);
  },
};
