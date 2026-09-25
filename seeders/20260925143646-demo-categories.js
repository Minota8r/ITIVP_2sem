'use strict';

const CATEGORIES = [
  ['electronics', 'Электроника'],
  ['transport', 'Транспорт'],
  ['realty', 'Недвижимость'],
  ['jobs', 'Работа'],
  ['services', 'Услуги'],
  ['home', 'Дом и сад'],
  ['clothes', 'Одежда'],
  ['other', 'Другое']
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'Categories',
      CATEGORIES.map(([slug, name], index) => ({
        id: index + 1,
        slug,
        name,
        createdAt: now,
        updatedAt: now
      }))
    );

    // id заданы вручную, поэтому сдвигаем счётчик автоинкремента
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"Categories"', 'id'), (SELECT MAX(id) FROM "Categories"))`
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
