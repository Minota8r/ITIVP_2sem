const mongoose = require('mongoose');

const toJSON = require('./json');

const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Некорректный email']
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, enum: ROLES, default: 'user' }
  },
  {
    timestamps: true,
    toJSON: {
      ...toJSON,
      transform(doc, ret) {
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
