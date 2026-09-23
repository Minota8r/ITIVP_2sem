const HttpError = require('../errors/HttpError');

// Глобальный обработчик ошибок
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    const body = { error: err.message };
    if (err.details) {
      body.details = err.details;
    }
    return res.status(err.status).json(body);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Некорректный JSON в теле запроса' });
  }

  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Внутренняя ошибка сервера' : err.message });
}

module.exports = errorHandler;
