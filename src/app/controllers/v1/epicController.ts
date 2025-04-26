import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import * as epicService from '../../services/epicService';
import httpStatus from 'http-status';
import { replaceId } from '../../services/replaceService';

export const store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  const result = await epicService.createEpic(req);
  res.status(httpStatus.CREATED).json(replaceId(result));
};

export const showEpicByProject = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  const result = await epicService.getEpicByProject(req.params.projectId, req.dbConnection);
  res.status(httpStatus.OK).json(replaceId(result));
};

export const show = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  const result = await epicService.getEpicById({
    id: req.params.id,
    dbConnection: req.dbConnection,
  });
  res.status(httpStatus.OK).json(replaceId(result));
};

export const update = async (req: Request, res: Response) => {
  const result = await epicService.updateEpicById(req);
  res.status(httpStatus.OK).json(replaceId(result));
};

export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  await epicService.deleteEpicById({
    id: req.params.id,
    dbConnection: req.dbConnection,
  });
  res.sendStatus(httpStatus.OK);
};
