'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LoginAttempt extends Model {}

  LoginAttempt.init({
    credential: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    resetAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'LoginAttempt',
    tableName: 'LoginAttempts',
  });

  return LoginAttempt;
};
