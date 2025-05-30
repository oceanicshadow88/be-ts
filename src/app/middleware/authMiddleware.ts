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
  const authorization = req.header('Authorization');
  if (!authorization) {
    return res.sendStatus(status.UNAUTHORIZED);
  }

  const [authType, token] = authorization.split(' ');
  if (!token) return res.sendStatus(status.UNAUTHORIZED);
  if (authType !== 'Bearer') return res.sendStatus(status.FORBIDDEN);

  jwt.verify(token, config.accessSecret, async (err, decoded) => {
    if (err) return res.sendStatus(status.FORBIDDEN);

    const userModel = await User.getModel(req.tenantsConnection);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded))
      return res.sendStatus(status.UNAUTHORIZED);
    const user = await userModel.findById(decoded.id);
    if (!user) return res.sendStatus(status.FORBIDDEN);

    req.user = user;
    req.token = token;
    req.userId = user.id;
    return next();
  });
};

const authenticationRefreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user) return next();
  const authorization = req.header('Authorization');

  if (!authorization) return res.sendStatus(status.UNAUTHORIZED);

  const [authType, , authRefreshToken] = authorization.split(' ');
  if (!authRefreshToken) return res.sendStatus(status.UNAUTHORIZED);

  if (authType !== 'Bearer') return res.sendStatus(status.FORBIDDEN);

  jwt.verify(authRefreshToken, config.accessSecret, async (err, decoded) => {
    if (err) return res.sendStatus(status.FORBIDDEN);

    const userModel = await User.getModel(req.tenantsConnection);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      return res.sendStatus(status.UNAUTHORIZED);
    }

    const user = await userModel.findOne({ _id: decoded.id, refreshToken: authRefreshToken });

    if (!user) {
      return res.sendStatus(status.FORBIDDEN);
    }

    const { token, refreshToken } = await user.generateAuthToken();

    Object.assign(req, {
      token,
      user,
      refreshToken,
      userId: user.id,
      isOwner: user.id === req.ownerId,
    });

    return next();
  });
};

export { authenticationTokenMiddleware, authenticationRefreshTokenMiddleware };
