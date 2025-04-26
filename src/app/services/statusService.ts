import { Request } from 'express';
import * as Status from '../model/status';
import { Types } from 'mongoose';

export const getAllStatus = (req: Request) => {
  const { tenantId } = req;
  return Status.getModel(req.dbConnection).find(
    { tenant: new Types.ObjectId(tenantId) },
    { createdAt: 0, updatedAt: 0 },
    { sort: { order: 1 } },
  );
};
