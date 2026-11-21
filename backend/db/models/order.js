'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
    }
  }

  Order.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerName: { type: DataTypes.STRING(160), allowNull: true },
    customerEmail: { type: DataTypes.STRING(254), allowNull: true },
    source: { type: DataTypes.STRING(24), allowNull: false, defaultValue: 'website' },
    paymentMethod: { type: DataTypes.STRING(40), allowNull: true },
    paymentReference: { type: DataTypes.STRING(200), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    subtotalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    promotionName: { type: DataTypes.STRING(120), allowNull: true },
    promoCode: { type: DataTypes.STRING(40), allowNull: true },
    discountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
  });

  return Order;
};
