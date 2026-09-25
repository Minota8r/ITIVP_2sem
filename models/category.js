'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Одна категория — много объявлений
      Category.hasMany(models.Listing, { foreignKey: 'categoryId', as: 'listings' });
    }
  }

  Category.init(
    {
      slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Category'
    }
  );

  return Category;
};
