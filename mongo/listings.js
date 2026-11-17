const { Router } = require('express');

const { HttpError } = require('../src/errors');
const { authenticate } = require('../src/middleware');
const { assertObject, isObjectId, objectIdParam } = require('./validation');
const Listing = require('./models/Listing');
const Category = require('./models/Category');
const User = require('./models/User');
const Conversation = require('./models/Conversation');

const STRING_FIELDS = ['title', 'description', 'city'];
const MAX_TAGS = 10;

function assertValid(body) {
  assertObject(body);

  const errors = [];

  for (const field of STRING_FIELDS) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`Поле "${field}" обязательно и должно быть непустой строкой`);
    }
  }

  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
    errors.push('Поле "price" обязательно и должно быть неотрицательным числом');
  }

  if (!isObjectId(body.categoryId)) {
    errors.push('Поле "categoryId" обязательно и должно быть ObjectId');
  }

  if (body.status !== undefined && !Listing.STATUSES.includes(body.status)) {
    errors.push(`Поле "status" должно быть одним из: ${Listing.STATUSES.join(', ')}`);
  }

  if (
    body.tags !== undefined &&
    (!Array.isArray(body.tags) ||
      body.tags.length > MAX_TAGS ||
      body.tags.some((tag) => typeof tag !== 'string' || tag.trim() === ''))
  ) {
    errors.push(`Поле "tags" должно быть массивом непустых строк (не больше ${MAX_TAGS})`);
  }

  if (errors.length > 0) {
    throw HttpError.badRequest('Неверные данные', errors);
  }
}

async function pickListingFields(body) {
  const category = await Category.findById(body.categoryId);
  if (!category) {
    throw HttpError.badRequest(`Категория с id ${body.categoryId} не существует`);
  }

  const fields = {
    title: body.title.trim(),
    description: body.description.trim(),
    price: body.price,
    city: body.city.trim(),
    category: { _id: category._id, slug: category.slug, name: category.name },
    tags: [...new Set((body.tags ?? []).map((tag) => tag.trim().toLowerCase()))]
  };

  if (body.status !== undefined) {
    fields.status = body.status;
  }

  return fields;
}

async function findOrThrow(id) {
  const listing = await Listing.findById(id).populate('user', 'name');
  if (!listing) {
    throw HttpError.notFound(`Объявление с id ${id} не найдено`);
  }
  return listing;
}

function assertCanModify(listing, user) {
  if (!listing.isOwnedBy(user.id) && user.role !== 'admin') {
    throw HttpError.forbidden('Изменять объявление может только его автор или администратор');
  }
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const router = Router();

router.param('id', (req, res, next, value) => objectIdParam(req, res, next, value, 'id'));

router.get('/', async (req, res) => {
  const { search, category, status, userId, tag } = req.query;
  const filter = {};

  if (userId !== undefined) {
    if (!isObjectId(userId)) {
      throw HttpError.badRequest('Параметр userId должен быть ObjectId');
    }
    if (!(await User.exists({ _id: userId }))) {
      throw HttpError.badRequest(`Пользователь с id ${userId} не существует`);
    }
    filter.user = userId;
  }

  if (category) {
    filter['category.slug'] = String(category);
  }

  if (status) {
    if (!Listing.STATUSES.includes(status)) {
      throw HttpError.badRequest(`Неизвестный статус: ${status}`);
    }
    filter.status = status;
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(String(search)), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  const listings = await Listing.find(filter).byTag(tag).populate('user', 'name').sort({ createdAt: 1 });
  res.json(listings);
});

router.get('/stats', async (req, res) => {
  const stats = await Listing.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$category.slug',
        category: { $first: '$category.name' },
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    { $sort: { count: -1, category: 1 } },
    {
      $project: {
        _id: 0,
        slug: '$_id',
        category: 1,
        count: 1,
        avgPrice: { $round: ['$avgPrice', 2] },
        minPrice: 1,
        maxPrice: 1
      }
    }
  ]);

  res.json(stats);
});

router.get('/:id', async (req, res) => {
  res.json(await findOrThrow(req.params.id));
});

router.post('/', authenticate, async (req, res) => {
  assertValid(req.body);

  const listing = await Listing.create({ ...(await pickListingFields(req.body)), user: req.user.id });

  res.status(201).location(`${req.baseUrl}/${listing.id}`).json(await findOrThrow(listing._id));
});

router.put('/:id', authenticate, async (req, res) => {
  assertCanModify(await findOrThrow(req.params.id), req.user);

  assertValid(req.body);

  const listing = await Listing.findByIdAndUpdate(req.params.id, await pickListingFields(req.body), {
    returnDocument: 'after',
    runValidators: true
  }).populate('user', 'name');

  res.json(listing);
});

router.delete('/:id', authenticate, async (req, res) => {
  assertCanModify(await findOrThrow(req.params.id), req.user);

  const deleted = await Listing.findByIdAndDelete(req.params.id).populate('user', 'name');
  const { deletedCount } = await Conversation.deleteMany({ listing: deleted._id });

  res.json({ deleted, deletedConversations: deletedCount });
});

module.exports = router;
