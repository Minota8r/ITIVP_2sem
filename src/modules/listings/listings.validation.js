const { CATEGORIES } = require('../categories/categories.constants');

const STRING_FIELDS = ['title', 'description', 'author', 'city'];

// Проверка полей объявления, возвращает массив ошибок
function validateListing(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['Тело запроса должно быть JSON-объектом'];
  }

  for (const field of STRING_FIELDS) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`Поле "${field}" обязательно и должно быть непустой строкой`);
    }
  }

  if (typeof body.price !== 'number' || !Number.isFinite(body.price) || body.price < 0) {
    errors.push('Поле "price" обязательно и должно быть неотрицательным числом');
  }

  if (!CATEGORIES.includes(body.category)) {
    errors.push(`Поле "category" должно быть одним из: ${CATEGORIES.join(', ')}`);
  }

  return errors;
}

// Берёт из тела запроса только нужные поля и убирает лишние пробелы
function pickListingFields(body) {
  return {
    title: body.title.trim(),
    description: body.description.trim(),
    price: body.price,
    category: body.category,
    author: body.author.trim(),
    city: body.city.trim()
  };
}

module.exports = { validateListing, pickListingFields };
