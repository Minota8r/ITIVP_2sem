const { Router } = require('express');

const { HttpError } = require('../src/errors');
const { authenticate } = require('../src/middleware');
const User = require('./models/User');
const Listing = require('./models/Listing');

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw HttpError.unauthorized('Пользователь не найден');
  }
  res.json(user);
});

router.get('/listings', authenticate, async (req, res) => {
  const query = Listing.findOwnedBy(req.user.id);

  if (req.query.status) {
    if (!Listing.STATUSES.includes(req.query.status)) {
      throw HttpError.badRequest(`Неизвестный статус: ${req.query.status}`);
    }
    query.where({ status: req.query.status });
  }

  res.json(await query.sort({ createdAt: -1 }));
});

module.exports = router;
