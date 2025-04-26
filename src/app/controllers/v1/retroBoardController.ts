import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import { getRetroBoards } from '../../services/retroBoardService';

export const index = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  const result = await getRetroBoards(req);
  return res.send(result);
};
