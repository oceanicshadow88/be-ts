import { Request } from 'express';
import * as Tenant from '../model/tenants';

import { tenantsDBConnection } from '../database/connections';
import config from '../config/app';

export const getDomain = async (req: Request) => {
  const { userId } = req.body;
  const domainURL = req.headers.origin;
  const tenantModel = await Tenant.getModel(req.tenantsConnection);
  const tenantInfo = await tenantModel.findOne({ origin: domainURL }).exec();
  if (!tenantInfo) {
    return false;
  }
  const ownerId = tenantInfo.owner.valueOf().toString();
  return ownerId === userId;
};

export const getIsValidDomain = async (req: Request) => {
  const tenantsConnection = await tenantsDBConnection();
  const domainURL = req.headers.origin;
  const tenantModel = await Tenant.getModel(tenantsConnection);
  const tenantInfo =
    config.environment === 'local'
      ? await tenantModel.findOne({ origin: { $regex: domainURL } }).exec()
      : await tenantModel.findOne({ origin: domainURL }).exec();
  return !!tenantInfo;
};
