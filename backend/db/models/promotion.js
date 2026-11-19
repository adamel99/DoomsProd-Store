'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {}

  Promotion.init({
    name: { type: DataTypes.STRING(120), allowNull: false },
    type: { type: DataTypes.ENUM('code', 'first_purchase', 'bundle'), allowNull: false },
    code: { type: DataTypes.STRING(40), allowNull: true, unique: true },
    discountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    minBasicBeatCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    startsAt: { type: DataTypes.DATE, allowNull: true },
    endsAt: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, { sequelize, modelName: 'Promotion', tableName: 'Promotions' });

  return Promotion;
};
