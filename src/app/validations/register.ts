import { body } from 'express-validator';

const register = [
  body('email').notEmpty().isEmail(),
  body('company').notEmpty(),
];

const store = [
  body('email').notEmpty().isEmail(),
  body('name').notEmpty(),
  body('password').notEmpty(),
];

export { register, store };