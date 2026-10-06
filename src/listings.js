const { Router } = require('express');
const { Op } = require('sequelize');

const { HttpError } = require('./errors');
const { authenticate } = require('./middleware');
const { Listing, Category, User } = require('../models');

const STRING_FIELDS = ['title', 'description', 'city'];

// Категория и автор подгружаются вместе с объявлением
const WITH_RELATIONS = [
  { model: Category, as: 'category', attributes: ['id', 'slug', 'name'] },
  { model: User, as: 'user', attributes: ['id', 'name'] }
];

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
  const listing = await Listing.findByPk(id, { include: WITH_RELATIONS });
  if (!listing) {
    throw HttpError.notFound(`Объявление с id ${id} не найдено`);
  }
  return listing;
}

// Менять и удалять объявление может только его автор или администратор
function assertCanModify(listing, user) {
  if (listing.userId !== user.id && user.role !== 'admin') {
    throw HttpError.forbidden('Изменять объявление может только его автор или администратор');
  }
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

  res.json(await Listing.findAll({ where, include: WITH_RELATIONS, order: [['id', 'ASC']] }));
});

// GET /listings/:id — одно объявление
router.get('/:id', async (req, res) => {
  res.json(await findOrThrow(req.params.id));
});

// POST /listings — добавление объявления (автор берётся из токена)
router.post('/', authenticate, async (req, res) => {
  assertValid(req.body);
  await assertCategoryExists(req.body.categoryId);

  const { id } = await Listing.create({ ...pickListingFields(req.body), userId: req.user.id });

  res.status(201).location(`${req.baseUrl}/${id}`).json(await findOrThrow(id));
});

// PUT /listings/:id — полное обновление объявления (автор или администратор)
router.put('/:id', authenticate, async (req, res) => {
  const listing = await findOrThrow(req.params.id);
  assertCanModify(listing, req.user);

  assertValid(req.body);
  await assertCategoryExists(req.body.categoryId);

  await listing.update(pickListingFields(req.body));

  res.json(await findOrThrow(req.params.id));
});

// DELETE /listings/:id — удаление объявления (автор или администратор)
router.delete('/:id', authenticate, async (req, res) => {
  const listing = await findOrThrow(req.params.id);
  assertCanModify(listing, req.user);

  await listing.destroy();
  res.status(204).end();
});

module.exports = router;
