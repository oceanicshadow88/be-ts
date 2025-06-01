import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import {
  deleteSprint,
  findLatestSprints,
  findSprints,
  findSprint,
  updateSprint,
  createSprint,
} from '../../services/sprintService';
import { asyncHandler } from '../../utils/helper';
import status from 'http-status';

export const currentSprint = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const { projectId } = req.params;
  const sprints = await findLatestSprints(req.dbConnection, projectId);
  res.status(status.OK).send(sprints);
});

export const show = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const { projectId } = req.params;
  const isCompleted = req.query.isCompleted === 'true';
  const sprints = await findSprints(projectId, isCompleted, req.dbConnection);
  res.status(status.OK).send(sprints);
});

export const store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const sprint = await createSprint(req.dbConnection, req.body);
  const createdSprint = await findSprint(req.dbConnection, sprint.id);
  res.status(status.CREATED).send(replaceId(createdSprint));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sprint = await findSprint(req.dbConnection, id);
  if (!sprint) return res.status(404).send();

  const updatedSprint = await updateSprint(req.dbConnection, id, req.body);
  res.status(status.OK).json(replaceId(updatedSprint));
});

export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sprint = await findSprint(req.dbConnection, id);
  if (!sprint) return res.status(404).send();
  await deleteSprint(req.dbConnection, id);
  return res.status(status.OK).json({});
});
