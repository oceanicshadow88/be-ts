const { param } = require('express-validator');

const projectAndRole = [param('projectId').notEmpty().isString(), param('roleId').notEmpty().isString()];

const getProject = [param('projectId').notEmpty().isString()];

export { projectAndRole, getProject };
