import { body, param } from 'express-validator';

const show = [param('id').notEmpty()];

const store = [body(['title', 'type']).notEmpty()];

const update = [
  param('id').notEmpty().isString(),
  body('title').if(body('title').exists()).isString().isLength({ min: 1 }),
  body('priority').if(body('priority').exists()).isString(),
];

const remove = [param('id').notEmpty().isString()];

export { show, store, update, remove };
