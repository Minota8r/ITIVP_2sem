const mongoose = require('mongoose');

const toJSON = require('./json');

const STATUSES = ['active', 'sold', 'archived'];

const categorySnapshotSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true }
  },
  { toJSON }
);

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    city: { type: String, required: true, trim: true },
    status: { type: String, enum: STATUSES, default: 'active' },
    category: { type: categorySnapshotSchema, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String, trim: true, lowercase: true }]
  },
  { timestamps: true, toJSON }
);

listingSchema.index({ tags: 1 });
listingSchema.index({ 'category.slug': 1, status: 1 });

listingSchema.statics.STATUSES = STATUSES;

listingSchema.statics.findOwnedBy = function (userId) {
  return this.find({ user: userId });
};

listingSchema.query.byTag = function (tag) {
  return tag ? this.where({ tags: String(tag).toLowerCase() }) : this;
};

listingSchema.methods.isOwnedBy = function (userId) {
  return (this.user._id ?? this.user).equals(userId);
};

module.exports = mongoose.model('Listing', listingSchema);
