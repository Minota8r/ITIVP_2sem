const { Router } = require('express');

const { HttpError } = require('../src/errors');
const { authenticate, isAdmin } = require('../src/middleware');
const { assertObject, objectIdParam } = require('./validation');
const Category = require('./models/Category');
const Listing = require('./models/Listing');

const SLUG_PATTERN = /^[a-z0-9-]{1,50}$/;

function assertValid(body) {
  assertObject(body);

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

async function assertSlugFree(slug, exceptId) {
  const filter = { slug };
  if (exceptId) {
    filter._id = { $ne: exceptId };
  }

  if (await Category.exists(filter)) {
    throw HttpError.conflict(`Категория со slug "${slug}" уже существует`);
  }
}

async function findOrThrow(id) {
  const category = await Category.findById(id);
  if (!category) {
    throw HttpError.notFound(`Категория с id ${id} не найдена`);
  }
  return category;
}

const router = Router();

router.param('id', (req, res, next, value) => objectIdParam(req, res, next, value, 'id'));

router.get('/', async (req, res) => {
  res.json(await Category.find().sort({ name: 1 }));
});

router.get('/:id', async (req, res) => {
  const category = await findOrThrow(req.params.id);
  const listings = await Listing.find({ 'category._id': category._id }).sort({ createdAt: -1 });
  res.json({ ...category.toJSON(), listings });
});

router.post('/', authenticate, isAdmin, async (req, res) => {
  assertValid(req.body);
  await assertSlugFree(req.body.slug);

  const category = await Category.create({ slug: req.body.slug, name: req.body.name.trim() });

  res.status(201).location(`${req.baseUrl}/${category.id}`).json(category);
});

router.put('/:id', authenticate, isAdmin, async (req, res) => {
  await findOrThrow(req.params.id);

  assertValid(req.body);
  await assertSlugFree(req.body.slug, req.params.id);

  const fields = { slug: req.body.slug, name: req.body.name.trim() };
  const category = await Category.findByIdAndUpdate(req.params.id, fields, {
    returnDocument: 'after',
    runValidators: true
  });

  const { modifiedCount } = await Listing.updateMany(
    { 'category._id': category._id },
    { $set: { 'category.slug': category.slug, 'category.name': category.name } }
  );

  res.json({ ...category.toJSON(), updatedListings: modifiedCount });
});

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  const category = await findOrThrow(req.params.id);

  if (await Listing.exists({ 'category._id': category._id })) {
    throw HttpError.conflict('Нельзя удалить категорию, в которой есть объявления');
  }

  await category.deleteOne();
  res.status(204).end();
});

module.exports = router;
