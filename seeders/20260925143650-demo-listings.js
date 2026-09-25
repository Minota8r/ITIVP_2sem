'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Listings', [
      {
        title: 'iPhone 13, 128 ГБ',
        description: 'Состояние отличное, полный комплект, батарея 89%',
        price: 1450,
        author: 'Алексей',
        city: 'Минск',
        categoryId: 1,
        status: 'active',
        createdAt: new Date('2026-09-10T10:00:00Z'),
        updatedAt: new Date('2026-09-10T10:00:00Z')
      },
      {
        title: 'Велосипед Stels Navigator',
        description: 'Горный, 21 скорость, после ТО',
        price: 380,
        author: 'Марина',
        city: 'Гродно',
        categoryId: 2,
        status: 'active',
        createdAt: new Date('2026-09-11T14:30:00Z'),
        updatedAt: new Date('2026-09-11T14:30:00Z')
      },
      {
        title: 'Сдам 1-комнатную квартиру',
        description: 'Рядом с метро, есть мебель и техника',
        price: 900,
        author: 'Игорь',
        city: 'Минск',
        categoryId: 3,
        status: 'active',
        createdAt: new Date('2026-09-12T09:15:00Z'),
        updatedAt: new Date('2026-09-12T09:15:00Z')
      },
      {
        title: 'Ноутбук Lenovo IdeaPad 5',
        description: 'Ryzen 5, 16 ГБ ОЗУ, SSD 512 ГБ, без царапин',
        price: 1800,
        author: 'Дмитрий',
        city: 'Гомель',
        categoryId: 1,
        status: 'sold',
        createdAt: new Date('2026-09-13T12:00:00Z'),
        updatedAt: new Date('2026-09-15T18:20:00Z')
      },
      {
        title: 'Требуется курьер',
        description: 'Доставка по городу, гибкий график, оплата еженедельно',
        price: 1200,
        author: 'ООО «Быстрая доставка»',
        city: 'Минск',
        categoryId: 4,
        status: 'active',
        createdAt: new Date('2026-09-14T08:45:00Z'),
        updatedAt: new Date('2026-09-14T08:45:00Z')
      },
      {
        title: 'Ремонт стиральных машин',
        description: 'Выезд на дом, гарантия на работу 6 месяцев',
        price: 50,
        author: 'Сергей',
        city: 'Брест',
        categoryId: 5,
        status: 'active',
        createdAt: new Date('2026-09-15T16:10:00Z'),
        updatedAt: new Date('2026-09-15T16:10:00Z')
      },
      {
        title: 'Зимняя куртка Columbia, размер M',
        description: 'Носилась один сезон, тёплая, с капюшоном',
        price: 120,
        author: 'Анна',
        city: 'Витебск',
        categoryId: 7,
        status: 'archived',
        createdAt: new Date('2026-09-16T11:30:00Z'),
        updatedAt: new Date('2026-09-20T10:00:00Z')
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Listings', null, {});
  }
};
