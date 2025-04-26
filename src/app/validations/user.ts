import { param } from 'express-validator';

const show = [param('id').notEmpty().isString()];

export { show };
