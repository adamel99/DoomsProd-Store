'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.User, { foreignKey: 'userId' });
      Product.hasMany(models.CartItem, { foreignKey: 'productId' });
      // Licenses are global, so no direct association here
    }
  }

  Product.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    type: {
      type: DataTypes.ENUM('beat', 'loop_kit', 'drum_kit'),
      allowNull: false,
    },
    youtubeLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    audioPreviewUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: { // nullable for beats, fixed for kits
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    downloadUrls: {
      type: DataTypes.JSON,
      allowNull: true,
    },

  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
  });

  return Product;
};
