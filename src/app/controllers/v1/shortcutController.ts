import { Request, Response, NextFunction } from 'express';
import status from 'http-status';
import { validationResult } from 'express-validator';
import { createShortcut, deleteShortcut, updateShortcut } from '../../services/shortcutService';

export const store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const result = await createShortcut(req);
  if (result.error) {
    res.sendStatus(result.status);
  } else {
    res.status(result.status).send(result.data);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  try {
    await updateShortcut(req);
    res.sendStatus(status.OK);
  } catch (e) {
    next(e);
  }
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  try {
    const result = await deleteShortcut(req);
    return res.sendStatus(result.status);
  } catch (e) {
    next(e);
  }
};
