const { Router } = require('express');

const { HttpError } = require('../src/errors');
const { authenticate } = require('../src/middleware');
const { assertObject, isObjectId, objectIdParam } = require('./validation');
const Conversation = require('./models/Conversation');
const Listing = require('./models/Listing');

const MAX_TEXT_LENGTH = 2000;

function readText(body) {
  assertObject(body);

  if (typeof body.text !== 'string' || body.text.trim() === '' || body.text.trim().length > MAX_TEXT_LENGTH) {
    throw HttpError.badRequest('Неверные данные', [
      `Поле "text" обязательно и должно быть непустой строкой до ${MAX_TEXT_LENGTH} символов`
    ]);
  }

  return body.text.trim();
}

function populated(query) {
  return query
    .populate('listing', 'title price status')
    .populate('participants', 'name')
    .populate('messages.from', 'name');
}

async function findOwnOrThrow(id, user) {
  const conversation = await Conversation.findById(id);
  if (!conversation) {
    throw HttpError.notFound(`Диалог с id ${id} не найден`);
  }
  if (!conversation.hasParticipant(user.id)) {
    throw HttpError.forbidden('Диалог доступен только его участникам');
  }
  return conversation;
}

const router = Router();

router.use(authenticate);

router.param('id', (req, res, next, value) => objectIdParam(req, res, next, value, 'id'));
router.param('messageId', (req, res, next, value) => objectIdParam(req, res, next, value, 'id сообщения'));

router.get('/', async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user.id })
    .populate('listing', 'title price status')
    .populate('participants', 'name')
    .sort({ lastMessageAt: -1 });

  res.json(
    conversations.map((conversation) => {
      const { messages, ...rest } = conversation.toJSON();
      return {
        ...rest,
        lastMessage: messages.at(-1) ?? null,
        messagesCount: messages.length,
        unread: conversation.unreadFor(req.user.id)
      };
    })
  );
});

router.post('/', async (req, res) => {
  const text = readText(req.body);

  if (!isObjectId(req.body.listingId)) {
    throw HttpError.badRequest('Неверные данные', ['Поле "listingId" обязательно и должно быть ObjectId']);
  }

  const listing = await Listing.findById(req.body.listingId);
  if (!listing) {
    throw HttpError.badRequest(`Объявление с id ${req.body.listingId} не существует`);
  }
  if (listing.isOwnedBy(req.user.id)) {
    throw HttpError.badRequest('Нельзя написать самому себе');
  }

  const message = { from: req.user.id, text };

  let conversation = await Conversation.findOneAndUpdate(
    { listing: listing._id, participants: req.user.id },
    { $push: { messages: message }, $set: { lastMessageAt: new Date() } },
    { returnDocument: 'after' }
  );
  const created = !conversation;

  if (created) {
    conversation = await Conversation.create({
      listing: listing._id,
      participants: [req.user.id, listing.user],
      messages: [message]
    });
  }

  res
    .status(created ? 201 : 200)
    .location(`${req.baseUrl}/${conversation.id}`)
    .json(await populated(Conversation.findById(conversation._id)));
});

router.get('/:id', async (req, res) => {
  await findOwnOrThrow(req.params.id, req.user);
  res.json(await populated(Conversation.findById(req.params.id)));
});

router.post('/:id/messages', async (req, res) => {
  const text = readText(req.body);
  await findOwnOrThrow(req.params.id, req.user);

  const conversation = await Conversation.findByIdAndUpdate(
    req.params.id,
    { $push: { messages: { from: req.user.id, text } }, $set: { lastMessageAt: new Date() } },
    { returnDocument: 'after', runValidators: true }
  ).populate('messages.from', 'name');

  res.status(201).json(conversation.messages.at(-1));
});

router.patch('/:id/read', async (req, res) => {
  const conversation = await findOwnOrThrow(req.params.id, req.user);
  const unread = conversation.unreadFor(req.user.id);

  await Conversation.updateOne(
    { _id: req.params.id },
    { $set: { 'messages.$[m].read': true } },
    { arrayFilters: [{ 'm.from': { $ne: req.user.id }, 'm.read': false }] }
  );

  res.json({ marked: unread });
});

router.delete('/:id/messages/:messageId', async (req, res) => {
  const conversation = await findOwnOrThrow(req.params.id, req.user);

  const message = conversation.messages.id(req.params.messageId);
  if (!message) {
    throw HttpError.notFound(`Сообщение с id ${req.params.messageId} не найдено`);
  }
  if (!message.from.equals(req.user.id)) {
    throw HttpError.forbidden('Удалить можно только своё сообщение');
  }

  await Conversation.updateOne({ _id: conversation._id }, { $pull: { messages: { _id: message._id } } });
  res.status(204).end();
});

module.exports = router;
