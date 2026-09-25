'use strict';
const { Model } = require('sequelize');

const STATUSES = ['active', 'sold', 'archived'];

module.exports = (sequelize, DataTypes) => {
  class Listing extends Model {
    static associate(models) {
      // Каждое объявление относится к одной категории
      Listing.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    }
  }

  Listing.STATUSES = STATUSES;

  Listing.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        // pg отдаёт DECIMAL строкой, в API нужен number
        get() {
          const value = this.getDataValue('price');
          return value === null ? null : Number(value);
        }
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'active',
        validate: { isIn: [STATUSES] }
      }
    },
    {
      sequelize,
      modelName: 'Listing'
    }
  );

  return Listing;
};
