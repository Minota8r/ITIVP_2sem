'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Новое поле: статус объявления (active | sold | archived)
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Listings', 'status', {
      allowNull: false,
      type: Sequelize.STRING(20),
      defaultValue: 'active'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Listings', 'status');
  }
};
