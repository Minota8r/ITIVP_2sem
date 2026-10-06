'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Автор объявления — теперь ссылка на пользователя, а не строка
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Listings', 'userId', {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.removeColumn('Listings', 'author');
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('Listings', 'author', {
      allowNull: true,
      type: Sequelize.STRING
    });

    // Имя автора восстанавливается из таблицы пользователей
    await queryInterface.sequelize.query(
      `UPDATE "Listings" SET "author" = "Users"."name" FROM "Users" WHERE "Users"."id" = "Listings"."userId"`
    );

    await queryInterface.changeColumn('Listings', 'author', {
      allowNull: false,
      type: Sequelize.STRING
    });
    await queryInterface.removeColumn('Listings', 'userId');
  }
};
