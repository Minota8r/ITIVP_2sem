const seed = require('./listings.seed');

// Хранилище объявлений в памяти сервера.
const listings = structuredClone(seed);
let nextId = Math.max(0, ...listings.map((item) => item.id)) + 1;

function findAll() {
  return listings;
}

function findById(id) {
  return listings.find((item) => item.id === id) || null;
}

function create(data) {
  const listing = { id: nextId++, ...data };
  listings.push(listing);
  return listing;
}

function update(id, data) {
  const index = listings.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  listings[index] = { id, ...data };
  return listings[index];
}

function remove(id) {
  const index = listings.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  listings.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
