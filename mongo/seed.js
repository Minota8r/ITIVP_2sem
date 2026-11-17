require('dotenv').config({ quiet: true });

const path = require('path');
const mongoose = require('mongoose');

const User = require('./models/User');
const Category = require('./models/Category');
const Listing = require('./models/Listing');
const Conversation = require('./models/Conversation');

const SEEDERS = [
  '20260925143646-demo-categories.js',
  '20260925143648-demo-users.js',
  '20260925143650-demo-listings.js'
];

const TAGS = [
  ['apple', 'смартфон', 'торг'],
  ['велосипед', 'спорт'],
  ['аренда', 'метро', 'мебель'],
  ['ноутбук', 'lenovo'],
  ['вакансия', 'курьер', 'гибкий график'],
  ['ремонт', 'бытовая техника', 'выезд'],
  ['куртка', 'зима']
];

const CONVERSATIONS = [
  {
    listing: 0,
    buyer: 3,
    messages: [
      [3, 'Здравствуйте! Торг возможен?', '2026-09-17T10:00:00Z', true],
      [2, 'Добрый день, небольшой торг уместен', '2026-09-17T10:20:00Z', true],
      [3, 'Могу посмотреть завтра вечером?', '2026-09-17T11:05:00Z', false]
    ]
  },
  {
    listing: 1,
    buyer: 2,
    messages: [
      [2, 'Есть ли следы ржавчины на раме?', '2026-09-18T09:30:00Z', true],
      [3, 'Нет, хранился в гараже', '2026-09-18T12:10:00Z', false]
    ]
  },
  {
    listing: 2,
    buyer: 8,
    messages: [[8, 'Квартира ещё свободна? Можно с котом?', '2026-09-19T19:45:00Z', false]]
  }
];

async function readSeeders() {
  const rows = {};
  const queryInterface = {
    bulkInsert: async (table, data) => {
      rows[table] = data;
    },
    sequelize: { query: async () => {} }
  };

  for (const file of SEEDERS) {
    await require(path.join(__dirname, '..', 'seeders', file)).up(queryInterface);
  }

  return rows;
}

async function saveAll(docs) {
  for (const doc of docs) {
    await doc.save({ timestamps: false });
  }
  return docs;
}

async function seed() {
  const rows = await readSeeders();

  await mongoose.connection.dropDatabase();
  await Promise.all([User, Category, Listing, Conversation].map((model) => model.syncIndexes()));

  const categories = new Map();
  for (const row of rows.Categories) {
    categories.set(row.id, new Category({ slug: row.slug, name: row.name, createdAt: row.createdAt, updatedAt: row.updatedAt }));
  }
  await saveAll([...categories.values()]);

  const users = new Map();
  for (const row of rows.Users) {
    const { id, ...fields } = row;
    users.set(id, new User(fields));
  }
  await saveAll([...users.values()]);

  const listings = rows.Listings.map(({ userId, categoryId, ...fields }, index) => {
    const category = categories.get(categoryId);
    return new Listing({
      ...fields,
      user: users.get(userId)._id,
      category: { _id: category._id, slug: category.slug, name: category.name },
      tags: TAGS[index] ?? []
    });
  });
  await saveAll(listings);

  const conversations = CONVERSATIONS.map(({ listing, buyer, messages }) => {
    const item = listings[listing];
    const list = messages.map(([from, text, createdAt, read]) => ({
      from: users.get(from)._id,
      text,
      read,
      createdAt: new Date(createdAt)
    }));
    return new Conversation({
      listing: item._id,
      participants: [users.get(buyer)._id, item.user],
      messages: list,
      lastMessageAt: list.at(-1).createdAt,
      createdAt: list[0].createdAt,
      updatedAt: list.at(-1).createdAt
    });
  });
  await saveAll(conversations);

  console.log(
    `Добавлено: категорий ${categories.size}, пользователей ${users.size}, объявлений ${listings.length}, диалогов ${conversations.length}`
  );
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(seed)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
