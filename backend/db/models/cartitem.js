'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.User, { foreignKey: 'userId' });
      CartItem.belongsTo(models.Cart, { foreignKey: 'cartId' });
      CartItem.belongsTo(models.Product, { foreignKey: 'productId' });
      CartItem.belongsTo(models.License, { foreignKey: 'licenseId' });
    }
  }

  CartItem.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    licenseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'CartItems',
  });

  return CartItem;
};
