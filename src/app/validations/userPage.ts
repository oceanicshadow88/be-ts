const { param } = require('express-validator');

const update = [param('id').notEmpty().isString()];

export { update };