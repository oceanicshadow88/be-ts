import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import status from 'http-status';
import { createLabel, deleteLabel, getLabel, updateLabel } from '../../services/labelService';

export const index = async (req: Request, res: Response) => {
  const result = await getLabel(req);
  res.send(replaceId(result));
};

export const store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await createLabel(req);
  res.send(replaceId(result));
};

// put
export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await updateLabel(req);
  res.send(replaceId(result));
};

//delete
export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  await deleteLabel(req);
  res.sendStatus(status.OK);
};

export const remove = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const result = await createLabel(req);
  res.send(replaceId(result));
};
