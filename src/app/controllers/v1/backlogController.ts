import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/helper';
import { replaceId } from '../../services/replaceService';
import httpStatus from 'http-status';
import {
  fetchBacklogTickets,
} from '../../services/backlogService';

// GET all
export const index = asyncHandler(async (req: Request, res: Response) => {
  const result = await fetchBacklogTickets(req);
  return res.status(httpStatus.OK).json(replaceId(result));
});
