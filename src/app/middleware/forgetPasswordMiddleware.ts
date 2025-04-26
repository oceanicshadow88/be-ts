import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import status from 'http-status';
import config from '../config/app';
declare module 'express-serve-static-core' {
  interface Request {
    email?: string;
  }
}

export const authenticationForgetPasswordMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.params.token;
  jwt.verify(token, config.forgotSecret, async (err: any) => {
    if (err) return res.status(status.FORBIDDEN).send();
    const result: any = await jwt.verify(token, config.forgotSecret);
    req.email = result.email;
    next();
  });
};
