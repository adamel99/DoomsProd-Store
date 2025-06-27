'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'userId' });
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId', onDelete: 'CASCADE', hooks: true });
    }
  }

  Cart.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'Carts',
  });

  return Cart;
};
