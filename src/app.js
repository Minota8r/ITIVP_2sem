const express = require('express');

const routes = require('./routes');
const notFound = require('./common/middleware/notFound');
const errorHandler = require('./common/middleware/errorHandler');

const app = express();

app.use(express.json());

app.use(routes);

// Должны подключаться последними
app.use(notFound);
app.use(errorHandler);

module.exports = app;
