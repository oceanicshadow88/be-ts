import { param, check } from 'express-validator';

const show = [param('id').notEmpty().isString()];
const store = [
  check('name', 'Name Empty').notEmpty(),
  check('key', 'Key Empty').notEmpty(),
];
const update = [param('id').notEmpty().isString()];
const remove = [param('id').notEmpty().isString()];

export { show, store, update, remove };
