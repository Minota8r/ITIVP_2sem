'use strict';
const { Model } = require('sequelize');

const ROLES = ['user', 'admin'];

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Один пользователь — много объявлений
      User.hasMany(models.Listing, { foreignKey: 'userId', as: 'listings' });
    }

    // Хеш пароля не должен попадать в ответы API
    toJSON() {
      const values = { ...this.get() };
      delete values.passwordHash;
      return values;
    }
  }

  User.ROLES = ROLES;

  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'user',
        validate: { isIn: [ROLES] }
      }
    },
    {
      sequelize,
      modelName: 'User'
    }
  );

  return User;
};
