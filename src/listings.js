const { Router } = require('express');

const { HttpError } = require('./errors');
const store = require('./store');

// Категории объявлений
const CATEGORIES = ['electronics', 'transport', 'realty', 'jobs', 'services', 'home', 'clothes', 'other'];

const STRING_FIELDS = ['title', 'description', 'author', 'city'];

// Проверка полей объявления, выбрасывает 400 со списком ошибок
function assertValid(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw HttpError.badRequest('Неверные данные', ['Тело запроса должно быть JSON-объектом']);
  }

  const errors = [];

  for (const field of STRING_FIELDS) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`Поле "${field}" обязательно и должно быть непустой строкой`);
    }
  }

  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
    errors.push('Поле "price" обязательно и должно быть неотрицательным числом');
  }

  if (!CATEGORIES.includes(body.category)) {
    errors.push(`Поле "category" должно быть одним из: ${CATEGORIES.join(', ')}`);
  }

  if (errors.length > 0) {
    throw HttpError.badRequest('Неверные данные', errors);
  }
}

// Берёт из тела запроса только нужные поля и убирает лишние пробелы
function pickListingFields(body) {
  return {
    title: body.title.trim(),
    description: body.description.trim(),
    price: body.price,
    category: body.category,
    author: body.author.trim(),
    city: body.city.trim()
  };
}

function findOrThrow(id) {
  const listing = store.findById(id);
  if (!listing) {
    throw HttpError.notFound(`Объявление с id ${id} не найдено`);
  }
  return listing;
}

const router = Router();

// Проверяет id в пути и приводит его к числу
router.param('id', (req, res, next, value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw HttpError.badRequest('Некорректный id');
  }

  req.params.id = id;
  next();
});

// GET /listings — список объявлений (с поиском и фильтром по категории)
router.get('/', (req, res) => {
  const { search, category } = req.query;
  let result = store.findAll();

  if (category) {
    if (!CATEGORIES.includes(category)) {
      throw HttpError.badRequest(`Неизвестная категория: ${category}`);
    }
    result = result.filter((item) => item.category === category);
  }

  if (search) {
    const text = String(search).toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(text) ||
        item.description.toLowerCase().includes(text)
    );
  }

  res.json(result);
});

// GET /listings/:id — одно объявление
router.get('/:id', (req, res) => {
  res.json(findOrThrow(req.params.id));
});

// POST /listings — добавление объявления
router.post('/', (req, res) => {
  assertValid(req.body);

  const now = new Date().toISOString();
  const listing = store.create({
    ...pickListingFields(req.body),
    createdAt: now,
    updatedAt: now
  });

  res.status(201).location(`${req.baseUrl}/${listing.id}`).json(listing);
});

// PUT /listings/:id — полное обновление объявления
router.put('/:id', (req, res) => {
  const existing = findOrThrow(req.params.id);
  assertValid(req.body);

  res.json(
    store.update(req.params.id, {
      ...pickListingFields(req.body),
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    })
  );
});

// DELETE /listings/:id — удаление объявления
router.delete('/:id', (req, res) => {
  if (!store.remove(req.params.id)) {
    throw HttpError.notFound(`Объявление с id ${req.params.id} не найдено`);
  }
  res.status(204).end();
});

module.exports = router;
