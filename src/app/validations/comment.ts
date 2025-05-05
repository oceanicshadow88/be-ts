const { param, body } = require('express-validator');

const store = [
  body('ticket').notEmpty().isString(),
  body('sender').notEmpty().isString(),
  body('content').notEmpty().isString(),
];

const update = [param('id').notEmpty().isString(), body('content').notEmpty().isString()];

const remove = [param('id').notEmpty().isString()];

export { store, update, remove };
