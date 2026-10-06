const { Router } = require('express');
const { Op } = require('sequelize');

const { HttpError } = require('./errors');
const { authenticate, isAdmin } = require('./middleware');
const { Category, Listing } = require('../models');

const SLUG_PATTERN = /^[a-z0-9-]{1,50}$/;

// Проверка полей категории, выбрасывает 400 со списком ошибок
function assertValid(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw HttpError.badRequest('Неверные данные', ['Тело запроса должно быть JSON-объектом']);
  }

  const errors = [];

  if (typeof body.slug !== 'string' || !SLUG_PATTERN.test(body.slug)) {
    errors.push('Поле "slug" обязательно: латинские буквы, цифры и дефис, до 50 символов');
  }

  if (typeof body.name !== 'string' || body.name.trim() === '' || body.name.trim().length > 100) {
    errors.push('Поле "name" обязательно и должно быть непустой строкой до 100 символов');
  }

  if (errors.length > 0) {
    throw HttpError.badRequest('Неверные данные', errors);
  }
}

// slug должен быть уникальным (exceptId — категория, которую сейчас редактируют)
async function assertSlugFree(slug, exceptId) {
  const where = { slug };
  if (exceptId) {
    where.id = { [Op.ne]: exceptId };
  }

  if (await Category.findOne({ where })) {
    throw HttpError.conflict(`Категория со slug "${slug}" уже существует`);
  }
}

async function findOrThrow(id) {
  const category = await Category.findByPk(id);
  if (!category) {
    throw HttpError.notFound(`Категория с id ${id} не найдена`);
  }
  return category;
}

const router = Router();

router.param('id', (req, res, next, value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw HttpError.badRequest('Некорректный id');
  }

  req.params.id = id;
  next();
});

// GET /categories — список категорий
router.get('/', async (req, res) => {
  res.json(await Category.findAll({ order: [['id', 'ASC']] }));
});

// GET /categories/:id — категория вместе с её объявлениями (hasMany)
router.get('/:id', async (req, res) => {
  const category = await Category.findByPk(req.params.id, {
    include: { model: Listing, as: 'listings' },
    order: [[{ model: Listing, as: 'listings' }, 'id', 'ASC']]
  });
  if (!category) {
    throw HttpError.notFound(`Категория с id ${req.params.id} не найдена`);
  }
  res.json(category);
});

// POST /categories — добавление категории (только администратор)
router.post('/', authenticate, isAdmin, async (req, res) => {
  assertValid(req.body);
  await assertSlugFree(req.body.slug);

  const category = await Category.create({ slug: req.body.slug, name: req.body.name.trim() });

  res.status(201).location(`${req.baseUrl}/${category.id}`).json(category);
});

// PUT /categories/:id — изменение категории (только администратор)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  const category = await findOrThrow(req.params.id);

  assertValid(req.body);
  await assertSlugFree(req.body.slug, category.id);

  res.json(await category.update({ slug: req.body.slug, name: req.body.name.trim() }));
});

// DELETE /categories/:id — удаление категории (только администратор)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const category = await findOrThrow(req.params.id);

  if ((await Listing.count({ where: { categoryId: category.id } })) > 0) {
    throw HttpError.conflict('Нельзя удалить категорию, в которой есть объявления');
  }

  await category.destroy();
  res.status(204).end();
});

module.exports = router;
