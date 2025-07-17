import { param, body } from 'express-validator';
import mongoose from 'mongoose';

const baseValidations = [
  body('title')
    .isString()
    .withMessage('Title must be a string')
    .trim(),
    
  body('color')
    .optional()
    .isHexColor()
    .withMessage('Color must be a valid hex code'),
    
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim(),
    
  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
    
  body('dueAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
    
  body('reporter')
    .optional()
    .custom((value) => !value || mongoose.Types.ObjectId.isValid(value))
    .withMessage('Reporter must be a valid ObjectId'),
    
  body('assign')
    .optional()
    .custom((value) => !value || mongoose.Types.ObjectId.isValid(value))
    .withMessage('Assign must be a valid ObjectId'),
    
  body('isComplete')
    .optional()
    .isBoolean()
    .withMessage('isComplete must be a boolean'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
    
  body('goal')
    .optional()
    .isString()
    .withMessage('Goal must be a string'),
    
  body('attachmentUrls')
    .optional()
    .isArray()
    .withMessage('Attachment URLs must be an array')
    .bail()
    .custom((value) => value.every((url: string) => typeof url === 'string'))
    .withMessage('All attachment URLs must be strings'),
];


const store = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .bail(),

  body('project')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Project must be a valid ObjectId'),

  
  ...baseValidations,
];

const showEpicByProject = [
  param('projectId')
    .notEmpty()
    .withMessage('ProjectId is required')
    .bail()
    .isString()
    .withMessage('ProjectId must be a string')
    .bail()
    .custom((value: string) => {
      return mongoose.Types.ObjectId.isValid(value);
    })
    .withMessage('ProjectId must be a valid ObjectId'),
];

const show = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .bail()
    .isString()
    .withMessage('id must be a string')
    .bail()
    .custom((value: string) => {
      return mongoose.Types.ObjectId.isValid(value);
    })
    .withMessage('id must be a valid ObjectId'),
];

const update = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('ID must be a valid ObjectId'),
  
  ...baseValidations,
  body('project')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Project must be a valid ObjectId'),
];

const destroy = [
  param('id')
    .notEmpty()
    .withMessage('id is required')
    .bail()
    .isString()
    .withMessage('id must be a string')
    .bail()
    .custom((value: string) => {
      return mongoose.Types.ObjectId.isValid(value);
    })
    .withMessage('id must be a valid ObjectId'),
];



export { store, showEpicByProject, show, update, destroy };