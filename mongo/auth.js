const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { HttpError } = require('../src/errors');
const { assertObject } = require('./validation');
const User = require('./models/User');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function assertValidRegistration(body) {
  assertObject(body);

  const errors = [];

  if (typeof body.email !== 'string' || !EMAIL_PATTERN.test(body.email.trim())) {
    errors.push('Поле "email" обязательно и должно быть адресом электронной почты');
  }

  if (typeof body.password !== 'string' || body.password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Поле "password" обязательно и должно быть не короче ${MIN_PASSWORD_LENGTH} символов`);
  }

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push('Поле "name" обязательно и должно быть непустой строкой');
  }

  if (errors.length > 0) {
    throw HttpError.badRequest('Неверные данные', errors);
  }
}

const router = Router();

router.post('/register', async (req, res) => {
  assertValidRegistration(req.body);

  const email = req.body.email.trim().toLowerCase();
  if (await User.exists({ email })) {
    throw HttpError.conflict('Пользователь с таким email уже существует');
  }

  const user = await User.create({
    email,
    passwordHash: await bcrypt.hash(req.body.password, 10),
    name: req.body.name.trim()
  });

  res.status(201).json(user);
});

router.post('/login', async (req, res) => {
  assertObject(req.body);

  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw HttpError.badRequest('Неверные данные', ['Поля "email" и "password" обязательны']);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw HttpError.unauthorized('Неверный email или пароль');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token, user });
});

module.exports = router;
