const jwt = require('jsonwebtoken');

const { HttpError } = require('./errors');

// Проверяет JWT из заголовка Authorization и кладёт его содержимое в req.user
function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw HttpError.unauthorized('Требуется авторизация');
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw HttpError.unauthorized(
      err.name === 'TokenExpiredError' ? 'Срок действия токена истёк' : 'Недействительный токен'
    );
  }

  next();
}

// Пропускает только администратора, подключается после authenticate
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    throw HttpError.forbidden('Доступ разрешён только администратору');
  }

  next();
}

module.exports = { authenticate, isAdmin };
