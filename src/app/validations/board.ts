const { param } = require('express-validator');

const show = [
  param('id').isString(),
];

export { show };
