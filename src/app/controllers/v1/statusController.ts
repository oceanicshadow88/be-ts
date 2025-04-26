import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import httpStatus from 'http-status';
import { asyncHandler } from '../../utils/helper';
import { replaceId } from '../../services/replaceService';
import { getAllStatus } from '../../services/statusService';

// GET all
export const index = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);
  }

  const statuses = await getAllStatus(req);
  return res.status(httpStatus.OK).json(replaceId(statuses));
});
