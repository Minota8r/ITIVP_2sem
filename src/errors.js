// Ошибка с HTTP-статусом, которую можно выбросить из любого обработчика
class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) {
    return new HttpError(400, message, details);
  }

  static notFound(message) {
    return new HttpError(404, message);
  }
}

// Неизвестный маршрут
function notFound(req, res) {
  res.status(404).json({ error: `Маршрут ${req.method} ${req.originalUrl} не найден` });
}

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

  // Ошибки Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Запись с такими данными уже существует',
      details: err.errors.map((e) => `${e.path}: ${e.value}`)
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Неверные данные',
      details: err.errors.map((e) => e.message)
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Ссылка на несуществующую запись' });
  }

  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Внутренняя ошибка сервера' : err.message });
}

module.exports = { HttpError, notFound, errorHandler };
