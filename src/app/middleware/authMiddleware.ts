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
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(status.UNAUTHORIZED).json({ message: 'Token not provided' });
  }

  jwt.verify(token, config.accessSecret, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(status.UNAUTHORIZED).json({ message: 'Access token expired' });
      }
      return res.status(status.UNAUTHORIZED).json({ message: 'Invalid token' });
    }

    try {
      const userModel = await User.getModel(req.tenantsConnection);
      if (!decoded || typeof decoded !== 'object' || !('id' in decoded))
        throw new Error('Invalid token payload');
      const user = await userModel.findById(decoded.id);
      if (!user) throw new Error('User not found');
      req.user = user;
      req.token = token;
      req.userId = user.id;
      return next();
    } catch (e) {
      return res
        .status(status.INTERNAL_SERVER_ERROR)
        .json({ message: e instanceof Error ? e.message : 'Service internal error' });
    }
  });
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
