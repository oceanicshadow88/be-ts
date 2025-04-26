import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import {
  createComment,
  deleteComment,
  getComment,
  updateComment,
} from '../../services/commentService';

export const show = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await getComment(req);
  return res.send(result);
};

export const store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await createComment(req);
  return res.send(result);
};

export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await updateComment(req);
  return res.send(result);
};

export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  await deleteComment(req);
  return res.sendStatus(status.OK);
};
