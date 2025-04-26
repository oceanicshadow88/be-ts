import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import {
  createRetroItem,
  deleteRetroItem,
  showRetroItems,
  updateRetroItem,
} from '../../services/retroItemService';

export const index = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await showRetroItems(req);
  return res.send(result);
};

export const store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await createRetroItem(req);
  return res.send(result);
};

export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await updateRetroItem(req);
  return res.send(result);
};

export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await deleteRetroItem(req);
  return res.send(result);
};
