import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import { forgotPassword, updatePassword } from '../../services/forgotService';

declare module 'express-serve-static-core' {
  interface Request {
    email?: string;
  }
}

export const forgetPasswordApplication = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const result = await forgotPassword(req);
  return result ? res.status(status.OK).send() : res.status(status.NOT_FOUND).send();
};

export const getUserEmail = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  return res.status(status.OK).send({ email: req.email });
};

export const updateUserPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const result = await updatePassword(req);
  return result ? res.status(status.OK).send() : res.status(status.NOT_FOUND).send();
};
