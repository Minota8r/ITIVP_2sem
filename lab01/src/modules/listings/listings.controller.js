const service = require('./listings.service');

// GET /listings — список объявлений (с поиском и фильтром по категории)
function getAll(req, res) {
  res.json(service.getAll(req.query));
}

// GET /listings/:id — одно объявление
function getById(req, res) {
  res.json(service.getById(req.params.id));
}

// POST /listings — добавление объявления
function create(req, res) {
  const listing = service.create(req.body);
  res.status(201).location(`${req.baseUrl}/${listing.id}`).json(listing);
}

// PUT /listings/:id — полное обновление объявления
function replace(req, res) {
  res.json(service.replace(req.params.id, req.body));
}

// DELETE /listings/:id — удаление объявления
function remove(req, res) {
  service.remove(req.params.id);
  res.status(204).end();
}

module.exports = { getAll, getById, create, replace, remove };
