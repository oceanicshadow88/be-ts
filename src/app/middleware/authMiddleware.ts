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
  const authorization = req.header('Authoriztion');
  if (!authorization) {
    return res.status(status.UNAUTHORIZED).json({ error: 'missing auth header' });
  }

  const [authType, token] = authorization?.split(' ') || [];

  if (authType !== 'Bearer' || !token)
    return res.status(status.UNAUTHORIZED).json({ error: 'invalid token type' });

  jwt.verify(token, config.accessSecret, async (err, decoded) => {
    if (err) return res.status(status.UNAUTHORIZED).json({ error: 'Invalid token' });

    const userModel = await User.getModel(req.tenantsConnection);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded))
      return res.status(status.UNAUTHORIZED).json({ error: 'Invalid token payload' });
    const user = await userModel.findById(decoded.id);
    if (!user) res.status(status.FORBIDDEN).json({ error: 'User not found!' });
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

  const [authType, , authRefreshToken] = req.headers.authorization?.split(' ') || [];

  if (authType !== 'Bearer')
    return res.status(status.UNAUTHORIZED).json({ message: 'wrong request type' });

  if (!authRefreshToken)
    return res.status(status.UNAUTHORIZED).json({ message: 'Token not provided' });

  jwt.verify(authRefreshToken, config.accessSecret, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(status.UNAUTHORIZED).json({ message: 'Access token expired' });
      }
      return res.status(status.UNAUTHORIZED).json({ message: 'Invalid token' });
    }

    try {
      const userModel = await User.getModel(req.tenantsConnection);
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded))
        return res.status(status.UNAUTHORIZED).json({ message: 'Invalid token payload' });
      const user = await userModel.findOne({ _id: decoded.id, refreshToken: decoded.refreshToken });
      if (!user) res.status(status.FORBIDDEN).json({ message: 'User not found!' });
      const { token, refreshToken } = await user.generateAuthToken();

      Object.assign(req, {
        token,
        user,
        refreshToken,
        userId: user.id,
        isOwner: user.id === req.ownerId,
      });
      return next();
    } catch (error) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ message: error instanceof Error ? error.message : 'Service internal error' });
    }
  });
};

export { authenticationTokenMiddleware, authenticationRefreshTokenMiddleware };
