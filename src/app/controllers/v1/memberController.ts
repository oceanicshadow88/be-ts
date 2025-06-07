import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import status from 'http-status';
import {
  getUserProjectRole,
  inviteUserToProject,
  removeRoleFromProject,
  updateUserProjectRole,
} from '../../services/roleService';

export const index = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const result = await getUserProjectRole(req);
  res.send(replaceId(result));
};

export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const result = await updateUserProjectRole(req);
  res.send(replaceId(result));
};

export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new Error('Validation failed');
  }
  const result = await removeRoleFromProject(req);
  res.send(replaceId(result));
};

export const inviteOne = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const result = await inviteUserToProject(req);
  res.send(replaceId(result));
};
