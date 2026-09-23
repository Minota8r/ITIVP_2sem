const { Router } = require('express');

const listingsRoutes = require('./modules/listings/listings.routes');

// Подключение маршрутов всех модулей
const router = Router();

router.use('/listings', listingsRoutes);

module.exports = router;
