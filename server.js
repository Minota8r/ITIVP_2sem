const express = require('express');

const listings = require('./src/listings');
const { notFound, errorHandler } = require('./src/errors');

const PORT = Number(process.env.PORT) || 3000;

const app = express();

app.use(express.json());

app.use('/listings', listings);

// Должны подключаться последними
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
