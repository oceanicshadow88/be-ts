import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { asyncHandler } from '../../utils/helper';
import mongoose from 'mongoose';
import * as Tenant from '../../model/tenants';
import * as User from '../../model/user';
import { emailRegister } from '../../services/registerServiceV2';
import { logger } from '../../../loaders/logger';
import { tenantsDBConnection } from '../../database/connections';
import config from '../../config/app';
import { ValidationError } from '../../error/validation.error';
import { BadRequestError } from '../../error/badRequest.error';
import { ConflictError } from '../../error/conflict.error';

export const invalidSubdomains: { [key: string]: boolean } = {
  localhost: true,
  local: true,
  dev: true,
  staging: true,
  uat: true,
  testing: true,
  test: true,
  develop: true,
  qat: true,
  qa: true,
  www: true,
  'api-dev': true,
  'api-staging': true,
  api: true,
  'api-develop': true,
  'api-uat': true,
  'api-qa': true,
  'api-qat': true,
};

const canRegisterCompany = (company: string) => {
  if (invalidSubdomains[company]) {
    return false;
  }
  return true;
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  // check Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Registration validation failed', {
      errors: errors.array(),
    });
  }

  const { email, company } = req.body;
  if (!canRegisterCompany(company)) {
    throw new BadRequestError(
      'Invalid company name. ' + Object.keys(invalidSubdomains).join(' ') + ' are not allowed.',
    );
  }

  let tenantsUrl = `${config.protocol}${company}.${config.mainDomain}`;
  const tenantsDbConnection = await tenantsDBConnection();

  // create new Tenant
  const tenantModel = await Tenant.getModel(tenantsDbConnection);

  // Check if tenant with this origin already exists
  const existingTenant = await tenantModel.findOne({ origin: tenantsUrl });
  if (existingTenant) {
    throw new ConflictError('Company name already registered', { company });
  }

  // Create new tenant
  const newTenants = await tenantModel.create({ origin: tenantsUrl });

  try {
    // update User and send email
    const { newUser, validationToken } = await emailRegister(
      tenantsDbConnection,
      email,
      newTenants,
      req.headers.origin ?? null,
    );

    newTenants.owner = new mongoose.Types.ObjectId(newUser.id);
    await newTenants.save();

    res.json({ status: 'success', data: { newTenants, newUser, validationToken } });
  } catch (err: any) {
    logger.error('registerV2Controller Fail:' + err);
    await tenantModel.findOneAndDelete({ origin: tenantsUrl });
    throw err; 
  }
});

//Active account
export const store = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid account information', {
      errors: errors.array(),
    });
  }

  const { email, name, password } = req.body;
  const user = await User.getModel(req.tenantsConnection).saveInfo(email, name, password);
  user.activeAccount();
  const activeTenant = user.tenants.at(-1);
  const tenantModel = await Tenant.getModel(req.tenantsConnection);
  await tenantModel.findByIdAndUpdate(activeTenant, { active: true });
  res.send({ user });
});

//Verify Email by token
export const verify = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid verification request', {
      errors: errors.array(),
    });
  }

  const email = req.verifyEmail ?? '';
  const user = await User.getModel(req.tenantsConnection).findOne({ email });
  res.send({ email, active: user.active });
});
