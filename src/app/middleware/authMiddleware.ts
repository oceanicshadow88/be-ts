import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as User from '../model/user';
import status from 'http-status';
import config from '../config/app';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: User.IUser;
    verifyEmail?: string;
    token?: string;
    refreshToken?: string;
  }
}

const authenticationTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  const authType = authHeader?.split(' ')[0];
  const authToken = authHeader?.split(' ')[1];

  if (!authHeader || !authToken) return res.sendStatus(401);
  if (authType === 'Bearer') {
    jwt.verify(authToken, config.accessSecret, async (err: any) => {
      if (err) return res.status(status.FORBIDDEN).send();
      const verifyUser: any = jwt.verify(authToken, config.accessSecret);
      const userDb = await User.getModel(req.tenantsConnection);
      const user = await userDb.findOne({ _id: verifyUser.id });
      if (!user) {
        res.status(status.FORBIDDEN).send();
        return;
      }
      req.user = user;
      req.token = authToken;
      req.userId = user.id;
      return next();
    });
    return;
  }
  res.status(status.FORBIDDEN).send();
};

const authenticationRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (Object.keys(req.user ?? {}).length !== 0) return next();
  const authHeader = req.headers.authorization;

  const authType = authHeader && authHeader.split(' ')[0];
  const authRefreshToken = authHeader && authHeader.split(' ')[2];

  if (!authHeader || !authRefreshToken) return res.sendStatus(401);

  if (authType === 'Bearer') {
    jwt.verify(authRefreshToken, config.accessSecret, async (err: any) => {
      if (err) return next();
      const verifyUser: any = jwt.verify(authRefreshToken, config.accessSecret);
      const userDb = await User.getModel(req.tenantsConnection);
      const user = await userDb.findOne({
        _id: verifyUser.id,
        refreshToken: verifyUser.refreshToken,
      });
      req.user = user;
      if (!user) {
        res.status(status.FORBIDDEN).send();
        return;
      }
      if (user._id.toString() === req.ownerId) {
        req.isOwner = true;
      } else {
        req.isOwner = false;
      }

      req.token = await jwt.sign({ id: user._id.toString() }, config.accessSecret, {
        expiresIn: '48h',
      });
      req.refreshToken = jwt.sign(
        { id: user._id, refreshToken: user.refreshToken },
        config.accessSecret,
        {
          expiresIn: '360h',
        },
      );
      req.userId = user.id;
      return next();
    });
    return;
  }
  res.status(status.FORBIDDEN).send();
};

export { authenticationTokenMiddleware, authenticationRefreshTokenMiddleware };
