const { Router } = require('express');

const { HttpError } = require('./errors');
const { authenticate } = require('./middleware');
const { User } = require('../models');

const router = Router();

// GET /profile — данные текущего пользователя
router.get('/', authenticate, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw HttpError.unauthorized('Пользователь не найден');
  }
  res.json(user);
});

module.exports = router;
