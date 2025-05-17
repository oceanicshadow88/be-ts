import { body } from 'express-validator';

const register = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('company').notEmpty().withMessage('Company name is required'),
];

const store = [body('email').notEmpty(), body('name').notEmpty(), body('password').notEmpty()];

export { register, store };
