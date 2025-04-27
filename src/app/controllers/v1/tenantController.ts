import { Request, Response, NextFunction } from 'express';
import status from 'http-status';
import { getModel } from '../../model/tenants';
import { validationResult } from 'express-validator';
import { tenantService } from '../../services/tenantService';
//GET ALL
export const index = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
  }
  res.send('Express + TypeScript Server5');
};

//POST
export const store = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
  }
  const Tenant = getModel(req.tenantsConnection);
  const tenant = new Tenant(req.body);

  try {
    await tenant.save();
    res.status(status.CREATED).send({ tenant });
  } catch (e: any) {
    next(e);
  }
};

export const checkTenantOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(status.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
    }
    const userId = req.query.userId as string;
    const ownerId = req.ownerId;
    const isOwner = await tenantService.checkTenantOwnership(userId, ownerId);
    res.send(isOwner);
  } catch (e: any) {
    next(e);
  }
};
