'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductFile extends Model {
    static associate(models) {
      ProductFile.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }

  ProductFile.init({
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    originalName: {            // optionally track original filename
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ProductFile',
    tableName: 'ProductFiles',
  });

  return ProductFile;
};
