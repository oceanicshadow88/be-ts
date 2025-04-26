import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import { deleteActivity, getActivity } from '../../services/activityService';

export const show = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await getActivity(req);
  res.send(result);
};

export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  await deleteActivity(req);
  return res.send(status.OK);
};
