import { param } from 'express-validator';

const show = [param('id').notEmpty().isMongoId()];

export { show };
