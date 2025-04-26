import { param, body } from 'express-validator';

const register = [
  param('email').isEmail(),
];

const store = [
  body('email').notEmpty(),
  body('name').notEmpty(),
  body('password').notEmpty(),
];

export { register, store };