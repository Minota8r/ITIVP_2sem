const { Router } = require('express');

const idParam = require('../../common/middleware/idParam');
const controller = require('./listings.controller');

const router = Router();

router.param('id', idParam);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.replace);
router.delete('/:id', controller.remove);

module.exports = router;
