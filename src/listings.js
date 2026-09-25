const { Router } = require('express');
const { Op } = require('sequelize');

const { HttpError } = require('./errors');
const { Listing, Category } = require('../models');

const STRING_FIELDS = ['title', 'description', 'author', 'city'];

// Категория подгружается вместе с объявлением
const WITH_CATEGORY = { model: Category, as: 'category', attributes: ['id', 'slug', 'name'] };

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

  if (!Number.isInteger(body.categoryId) || body.categoryId <= 0) {
    errors.push('Поле "categoryId" обязательно и должно быть положительным целым числом');
  }

  if (body.status !== undefined && !Listing.STATUSES.includes(body.status)) {
    errors.push(`Поле "status" должно быть одним из: ${Listing.STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    throw HttpError.badRequest('Неверные данные', errors);
  }
}

// Берёт из тела запроса только нужные поля и убирает лишние пробелы
function pickListingFields(body) {
  const fields = {
    title: body.title.trim(),
    description: body.description.trim(),
    price: body.price,
    categoryId: body.categoryId,
    author: body.author.trim(),
    city: body.city.trim()
  };

  if (body.status !== undefined) {
    fields.status = body.status;
  }

  return fields;
}

async function assertCategoryExists(categoryId) {
  if (!(await Category.findByPk(categoryId))) {
    throw HttpError.badRequest(`Категория с id ${categoryId} не существует`);
  }
}

async function findOrThrow(id) {
  const listing = await Listing.findByPk(id, { include: WITH_CATEGORY });
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

// GET /listings — список объявлений (поиск, фильтр по категории и статусу)
router.get('/', async (req, res) => {
  const { search, category, status } = req.query;
  const where = {};

  if (category) {
    const found = await Category.findOne({ where: { slug: String(category) } });
    if (!found) {
      throw HttpError.badRequest(`Неизвестная категория: ${category}`);
    }
    where.categoryId = found.id;
  }

  if (status) {
    if (!Listing.STATUSES.includes(status)) {
      throw HttpError.badRequest(`Неизвестный статус: ${status}`);
    }
    where.status = status;
  }

  if (search) {
    const pattern = `%${String(search)}%`;
    where[Op.or] = [
      { title: { [Op.iLike]: pattern } },
      { description: { [Op.iLike]: pattern } }
    ];
  }

  res.json(await Listing.findAll({ where, include: WITH_CATEGORY, order: [['id', 'ASC']] }));
});

// GET /listings/:id — одно объявление
router.get('/:id', async (req, res) => {
  res.json(await findOrThrow(req.params.id));
});

// POST /listings — добавление объявления
router.post('/', async (req, res) => {
  assertValid(req.body);
  await assertCategoryExists(req.body.categoryId);

  const { id } = await Listing.create(pickListingFields(req.body));

  res.status(201).location(`${req.baseUrl}/${id}`).json(await findOrThrow(id));
});

// PUT /listings/:id — полное обновление объявления
router.put('/:id', async (req, res) => {
  assertValid(req.body);
  await assertCategoryExists(req.body.categoryId);

  const [updated] = await Listing.update(pickListingFields(req.body), {
    where: { id: req.params.id }
  });
  if (updated === 0) {
    throw HttpError.notFound(`Объявление с id ${req.params.id} не найдено`);
  }

  res.json(await findOrThrow(req.params.id));
});

// DELETE /listings/:id — удаление объявления
router.delete('/:id', async (req, res) => {
  const deleted = await Listing.destroy({ where: { id: req.params.id } });
  if (deleted === 0) {
    throw HttpError.notFound(`Объявление с id ${req.params.id} не найдено`);
  }
  res.status(204).end();
});

module.exports = router;
