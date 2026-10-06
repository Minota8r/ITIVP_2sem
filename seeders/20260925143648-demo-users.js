'use strict';

const bcrypt = require('bcrypt');

// [email, имя, роль, пароль]
const USERS = [
  ['admin@example.com', 'Администратор', 'admin', 'admin123'],
  ['alexey@example.com', 'Алексей', 'user', 'password123'],
  ['marina@example.com', 'Марина', 'user', 'password123'],
  ['igor@example.com', 'Игорь', 'user', 'password123'],
  ['dmitry@example.com', 'Дмитрий', 'user', 'password123'],
  ['delivery@example.com', 'ООО «Быстрая доставка»', 'user', 'password123'],
  ['sergey@example.com', 'Сергей', 'user', 'password123'],
  ['anna@example.com', 'Анна', 'user', 'password123']
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert(
      'Users',
      USERS.map(([email, name, role, password], index) => ({
        id: index + 1,
        email,
        passwordHash: bcrypt.hashSync(password, 10),
        name,
        role,
        createdAt: now,
        updatedAt: now
      }))
    );

    // id заданы вручную, поэтому сдвигаем счётчик автоинкремента
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"Users"', 'id'), (SELECT MAX(id) FROM "Users"))`
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
