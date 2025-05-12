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

  const [authType, token] = authorization.split(' ');

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
  const authorization = req.header('Authorization');

  if (!authorization) return res.status(status.UNAUTHORIZED).json({ error: 'missing auth header' });

  const [authType, , authRefreshToken] = authorization.split(' ');

  if (authType !== 'Bearer' || !authRefreshToken)
    return res.status(status.UNAUTHORIZED).json({ error: 'invalid token type' });

  jwt.verify(authRefreshToken, config.accessSecret, async (err, decoded) => {
    if (err) return res.status(status.UNAUTHORIZED).json({ error: 'Invalid token' });

    const userModel = await User.getModel(req.tenantsConnection);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      return res.status(status.UNAUTHORIZED).json({ message: 'Invalid token payload' });
    }

    const user = await userModel.findOne({ _id: decoded.id, refreshToken: authRefreshToken });

    if (!user) {
      return res
        .status(status.FORBIDDEN)
        .json({ message: 'User not found or refreshToken outdated!' });
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
