import { Request, Response } from 'express';
import { replaceId } from '../../services/replaceService';
import {
  createTicket,
  deleteTicket,
  getShowTicket,
  getTicketsByProject,
  getTicketsByEpic,
  toggleActive,
  updateTicket,
  getStatusSummaryBySprintId,
} from '../../services/ticketService';
import { asyncHandler } from '../../utils/helper';

import httpStatus from 'http-status';
import { validationResult } from 'express-validator';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export const getSprintStatusSummary = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: errors });
  }
  const { projectId, sprintId } = req.params;
  const statusSummary = await getStatusSummaryBySprintId(projectId, sprintId, req.dbConnection);
  if (!statusSummary) {
    return res.status(httpStatus.NOT_FOUND).json({ error: 'Status summary not found.' });
  }
  return res.json(statusSummary);
});

export const show = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  const result = await getShowTicket(req);
  res.status(200).send(replaceId(result[0]));
});

export const ticketsByProject = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: errors });
  }
  const result = await getTicketsByProject(req);
  res.status(200).send(replaceId(result));
});

export const ticketsByEpic = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: errors });
  }
  const result = await getTicketsByEpic(req);
  res.status(200).send(replaceId(result));
});

export const store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
  }
  const result = await createTicket(req);
  res.status(httpStatus.CREATED).json(replaceId(result));
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }

  const result = await updateTicket(req);
  if (!result) {
    res.status(httpStatus.NOT_FOUND).send();
  }
  return res.status(httpStatus.OK).json(replaceId(result));
});

// DELETE HARD
export const destroy = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  const result = await deleteTicket(req);
  if (!result) {
    res.status(httpStatus.NOT_FOUND).send();
  }
  return res.status(httpStatus.NO_CONTENT).send();
});

// DELETE SOFT, TOGGLE isActive
export const toggleActivate = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }
  const result = await toggleActive(req);
  if (!result) {
    res.status(httpStatus.NOT_FOUND).send();
  }
  return res.status(httpStatus.OK).json(replaceId(result));
});
