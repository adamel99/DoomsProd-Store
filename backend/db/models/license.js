'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class License extends Model {
    static associate(models) {
      License.hasMany(models.CartItem, { foreignKey: 'licenseId' });
    }
  }

  License.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    downloadLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  }, {
    sequelize,
    modelName: 'License',
    tableName: 'Licenses',
  });

  return License;
};
