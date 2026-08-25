'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProcessedStripeEvent extends Model {}

  ProcessedStripeEvent.init({
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'ProcessedStripeEvent',
    tableName: 'ProcessedStripeEvents',
  });

  return ProcessedStripeEvent;
};
