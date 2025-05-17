import { Response, Request } from 'express';
import * as User from '../../model/user';

import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/helper';
import { checkUserTenants } from '../../services/loginService';
import config from '../../config/app';
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

export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Login validation failed', {
      errors: errors.array(),
    });
  }

  const origin = req.get('origin');

  const user = await User.getModel(req.tenantsConnection).findByCredentials(
    req.body.email,
    req.body.password,
  );

  if (user === null) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user === undefined) {
    throw new UnauthorizedError('Account has been disabled or lacks permission');
  }

  // check the if the domain is in user's tenants when user login
  if (config.environment.toLowerCase() === 'local') {
    const token = await user.generateAuthToken();
    return res.send({ user, ...token });
  }

  const qualifiedTenants = await checkUserTenants(req.body.email, origin, req.tenantsConnection);
  if (qualifiedTenants.length > 0) {
    const token = await user.generateAuthToken();
    return res.send({ user, ...token });
  } else {
    throw new UnauthorizedError('User does not have access to this tenant');
  }
});

export const autoFetchUserInfo = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError('Invalid request parameters', {
      errors: errors.array(),
    });
  }

  if (!req.userId) {
    throw new ForbiddenError('Unauthorized access, please login first');
  }

  res.send({ user: req.user, token: req.token, refreshToken: req.refreshToken });
});
