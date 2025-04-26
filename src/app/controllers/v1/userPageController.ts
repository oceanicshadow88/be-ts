import { Request, Response } from 'express';
import status from 'http-status';
import { validationResult } from 'express-validator';
import { updateUserSetting } from '../../services/userService';

export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  await updateUserSetting(req);
  return res.sendStatus(status.OK);
};
