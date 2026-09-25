const { Router } = require('express');

const { HttpError } = require('./errors');
const { Category, Listing } = require('../models');

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

module.exports = router;
