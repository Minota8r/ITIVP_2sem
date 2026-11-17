const mongoose = require('mongoose');

const toJSON = require('./json');

const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    read: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON }
);

const conversationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true, toJSON }
);

conversationSchema.index({ listing: 1, participants: 1 });
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

conversationSchema.methods.hasParticipant = function (userId) {
  return this.participants.some((p) => (p._id ?? p).equals(userId));
};

conversationSchema.methods.unreadFor = function (userId) {
  return this.messages.filter((m) => !m.read && !(m.from._id ?? m.from).equals(userId)).length;
};

module.exports = mongoose.model('Conversation', conversationSchema);
