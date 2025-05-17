import { Response, Request } from 'express';
import * as User from '../../model/user';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/helper';
import { BadRequestError } from '../../error/badRequest.error';
import { UnauthorizedError } from '../../error/unauthorized.error';
import { ForbiddenError } from '../../error/forbidden.error';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
    user?: User.IUser;
    verifyEmail?: string;
    token?: string;
    refreshToken?: string;
  }
}

const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Login validation failed', {
      errors: errors.array(),
    });
  }

  const user = await User.getModel(req.dbConnection).findByCredentials(
    req.body.email,
    req.body.password,
  );

  if (user === null) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user === undefined) {
    throw new ForbiddenError('Account has been disabled or lacks permission');
  }

  const token = await user.generateAuthToken();
  res.send({ user, ...token });
});

const autoFetchUserInfo = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Invalid request parameters', {
      errors: errors.array(),
    });
  }

  if (!req.userId) {
    throw new ForbiddenError('Unauthorized access, please login first');
  }

  res.send({
    user: req.user,
    token: req.token,
    refreshToken: req.refreshToken,
  });
});

export { login, autoFetchUserInfo };
