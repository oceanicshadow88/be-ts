const { body } = require('express-validator');

const forgetPasswordApplication = [body('email').notEmpty().isEmail()];

const updateUserPassword = [body('password').notEmpty().isString()];

export { forgetPasswordApplication, updateUserPassword };
