const mongoose = require('mongoose');

const toJSON = require('./json');

const categorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, match: /^[a-z0-9-]{1,50}$/ },
    name: { type: String, required: true, trim: true, maxlength: 100 }
  },
  { timestamps: true, toJSON }
);

module.exports = mongoose.model('Category', categorySchema);
