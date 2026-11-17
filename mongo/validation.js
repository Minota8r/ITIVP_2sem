const mongoose = require('mongoose');

const { HttpError } = require('../src/errors');

function assertObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw HttpError.badRequest('Неверные данные', ['Тело запроса должно быть JSON-объектом']);
  }
}

function isObjectId(value) {
  return typeof value === 'string' && mongoose.isObjectIdOrHexString(value);
}

function objectIdParam(req, res, next, value, name) {
  if (!isObjectId(value)) {
    throw HttpError.badRequest(`Некорректный ${name}`);
  }
  next();
}

module.exports = { assertObject, isObjectId, objectIdParam };
