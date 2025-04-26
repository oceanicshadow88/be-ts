import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/helper';
import status from 'http-status';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';
import {
  createProjectNewRole,
  deleteProjectRole,
  getDefaultRoles,
  getProjectRole,
  getRoleById,
  updateProjectRole,
} from '../../services/roleService';

export const index = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const rolesArr = await getProjectRole(req);
  res.send(replaceId(rolesArr));
};

export const roleById = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const rolesArr = getRoleById(req);
  res.send(replaceId(rolesArr));
};

export const addNewRole = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }

  const result = await createProjectNewRole(req);
  res.status(status.OK).send(result);
});

export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const updatedProject = await updateProjectRole(req);
  res.send(replaceId(updatedProject));
};

export const destroy = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const updateProject = await deleteProjectRole(req);
  res.send(replaceId(updateProject));
};

export const defaultRoles = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const roles = await getDefaultRoles(req);
  return res.status(status.OK).json(replaceId(roles));
};
