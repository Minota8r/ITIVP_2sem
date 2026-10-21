const { Router } = require('express');

const { HttpError } = require('./errors');
const { authenticate } = require('./middleware');
const { User, Listing, Category } = require('../models');

const router = Router();

// GET /profile — данные текущего пользователя
router.get('/', authenticate, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw HttpError.unauthorized('Пользователь не найден');
  }
  res.json(user);
});

// GET /profile/listings — объявления текущего пользователя во всех статусах
router.get('/listings', authenticate, async (req, res) => {
  const { status } = req.query;
  const where = { userId: req.user.id };

  if (status) {
    if (!Listing.STATUSES.includes(status)) {
      throw HttpError.badRequest(`Неизвестный статус: ${status}`);
    }
    where.status = status;
  }

  // Автор и так известен, поэтому подгружается только категория
  const listings = await Listing.findAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'slug', 'name'] }],
    order: [['id', 'DESC']]
  });

  res.json(listings);
});

module.exports = router;
