// Хранилище объявлений в памяти сервера со стартовыми данными
const listings = [
  {
    id: 1,
    title: 'iPhone 13, 128 ГБ',
    description: 'Состояние отличное, полный комплект, батарея 89%',
    price: 1450,
    category: 'electronics',
    author: 'Алексей',
    city: 'Минск',
    createdAt: '2026-09-10T10:00:00.000Z',
    updatedAt: '2026-09-10T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Велосипед Stels Navigator',
    description: 'Горный, 21 скорость, после ТО',
    price: 380,
    category: 'transport',
    author: 'Марина',
    city: 'Гродно',
    createdAt: '2026-09-11T14:30:00.000Z',
    updatedAt: '2026-09-11T14:30:00.000Z'
  },
  {
    id: 3,
    title: 'Сдам 1-комнатную квартиру',
    description: 'Рядом с метро, есть мебель и техника',
    price: 900,
    category: 'realty',
    author: 'Игорь',
    city: 'Минск',
    createdAt: '2026-09-12T09:15:00.000Z',
    updatedAt: '2026-09-12T09:15:00.000Z'
  }
];

let nextId = Math.max(0, ...listings.map((item) => item.id)) + 1;

function findAll() {
  return listings;
}

function findById(id) {
  return listings.find((item) => item.id === id) || null;
}

function create(data) {
  const listing = { id: nextId++, ...data };
  listings.push(listing);
  return listing;
}

function update(id, data) {
  const index = listings.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  listings[index] = { id, ...data };
  return listings[index];
}

function remove(id) {
  const index = listings.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  listings.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
