const HttpError = require('../../common/errors/HttpError');
const { CATEGORIES } = require('../categories/categories.constants');
const repository = require('./listings.repository');
const { validateListing, pickListingFields } = require('./listings.validation');

function getAll({ search, category }) {
  let result = repository.findAll();

  if (category) {
    if (!CATEGORIES.includes(category)) {
      throw HttpError.badRequest(`Неизвестная категория: ${category}`);
    }
    result = result.filter((item) => item.category === category);
  }

  if (search) {
    const text = String(search).toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(text) ||
        item.description.toLowerCase().includes(text)
    );
  }

  return result;
}

function getById(id) {
  const listing = repository.findById(id);
  if (!listing) {
    throw HttpError.notFound(`Объявление с id ${id} не найдено`);
  }
  return listing;
}

function assertValid(body) {
  const errors = validateListing(body);
  if (errors.length > 0) {
    throw HttpError.badRequest('Неверные данные', errors);
  }
}

function create(body) {
  assertValid(body);

  const now = new Date().toISOString();
  return repository.create({
    ...pickListingFields(body),
    createdAt: now,
    updatedAt: now
  });
}

function replace(id, body) {
  const existing = getById(id);
  assertValid(body);

  return repository.update(id, {
    ...pickListingFields(body),
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString()
  });
}

function remove(id) {
  if (!repository.remove(id)) {
    throw HttpError.notFound(`Объявление с id ${id} не найдено`);
  }
}

module.exports = { getAll, getById, create, replace, remove };
