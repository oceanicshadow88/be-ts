const { param, body } = require('express-validator');

const store = [body('name').notEmpty().isString(), body('slug').notEmpty().isString()];

const update = [param('id').notEmpty().isString()];

const remove = [param('id').notEmpty().isString()];

const eliminate = [param('ticketId').notEmpty().isString(), param('labelId').notEmpty().isString()];

export { store, update, remove, eliminate };
