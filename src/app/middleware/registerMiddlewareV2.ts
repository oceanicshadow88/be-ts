import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as User from '../model/user';
import * as Tenant from '../model/tenants';
import status from 'http-status';
import config from '../../app/config/app';
declare module 'express-serve-static-core' {
  interface Request {
    verifyEmail?: string;
  }
}

const authenticationEmailTokenMiddlewareV2 = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.params.token;
  jwt.verify(token, config.emailSecret, async (err: any) => {
    if (err) return res.status(status.FORBIDDEN).send();
    const result: any = await jwt.verify(token, config.emailSecret);
    const resUserDbConnection = req.tenantsConnection;

    const userModel = await User.getModel(resUserDbConnection);
    const user = await userModel.findById(result.id);

    // if user is not active, continue registration process
    if (user && !user.active) {
      req.verifyEmail = user.email;
      return next();
    }
    if (!user?.tenants) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    // if user is active, skip registration and active this tenant
    const activeTenant = user.tenants.at(-1);
    const tenantModel = await Tenant.getModel(resUserDbConnection);
    await tenantModel.findByIdAndUpdate(activeTenant, { active: true });

    res.status(200).json({
      user,
      active: user.active,
    });
  });
};

export { authenticationEmailTokenMiddlewareV2 };
