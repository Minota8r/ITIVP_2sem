require('dotenv').config({ quiet: true });

const express = require('express');

const { sequelize } = require('./models');
const listings = require('./src/listings');
const categories = require('./src/categories');
const auth = require('./src/auth');
const profile = require('./src/profile');
const { notFound, errorHandler } = require('./src/errors');

const PORT = Number(process.env.PORT) || 3000;

if (!process.env.JWT_SECRET) {
  console.error('Не задана переменная окружения JWT_SECRET');
  process.exit(1);
}

const app = express();

app.use(express.json());

app.use('/listings', listings);
app.use('/categories', categories);
app.use('/auth', auth);
app.use('/profile', profile);

// Должны подключаться последними
app.use(notFound);
app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Не удалось подключиться к базе данных:', err.message);
    process.exit(1);
  });
