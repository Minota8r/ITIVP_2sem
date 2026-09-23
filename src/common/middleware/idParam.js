const HttpError = require('../errors/HttpError');

// Обработчик для router.param('id'): проверяет id и приводит его к числу
function idParam(req, res, next, value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw HttpError.badRequest('Некорректный id');
  }

  req.params.id = id;
  next();
}

module.exports = idParam;
