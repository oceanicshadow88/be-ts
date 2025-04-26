import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import logger from 'winston';
import status from 'http-status';
import {
  createDailyScrum,
  deleteDailyScrum,
  showDailyScrum,
  updateDailyScrum,
} from '../../services/dailyScrumService';

export const show = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await showDailyScrum(req);
  return res.send(result);
};

export const store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await createDailyScrum(req);
  return res.send(result);
};

export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.status(status.UNPROCESSABLE_ENTITY).json({
      errors,
    });
  }
  const result = await updateDailyScrum(req);
  return res.send(result);
};

export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  await deleteDailyScrum(req);
  res.sendStatus(status.OK);
};
