import { body } from 'express-validator';

export const store = [
  body(['name', 'projectId', 'board']).exists().notEmpty().isString(),
  body('isComplete').if(body('isComplete').exists()).isBoolean(),
  body('description').if(body('description').exists()).isString(),
];
