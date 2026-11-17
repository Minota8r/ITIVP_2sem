require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const listings = require('./listings');
const categories = require('./categories');
const auth = require('./auth');
const profile = require('./profile');
const conversations = require('./conversations');
const { notFound, errorHandler } = require('../src/errors');

const PORT = Number(process.env.MONGO_PORT) || 3001;

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('Не заданы переменные окружения JWT_SECRET и MONGO_URI');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.use('/listings', listings);
app.use('/categories', categories);
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/conversations', conversations);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
