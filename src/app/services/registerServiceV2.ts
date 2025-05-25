import { emailSender, getDomain } from '../utils/emailSender';
import jwt from 'jsonwebtoken';
import { winstonLogger } from '../../loaders/logger';
import mongoose from 'mongoose';
import * as User from '../model/user';
import config from '../config/app';

export const emailRegister = async (
  resUserDbConnection: any,
  email: string,
  newTenants: any,
  origin: string | null,
) => {
  if (!config?.emailSecret) {
    winstonLogger.error('Missing email secret in env');
    throw new Error('Missing email secret in env');
  }
  const userModel = User.getModel(resUserDbConnection);
  const targetUser = await userModel.findOne({ email });
  const tenantsId = new mongoose.Types.ObjectId(newTenants.id);
  let newUser;
  let validationToken;
  if (targetUser?.active) {
    targetUser.tenants.push(tenantsId);
    newUser = await targetUser.save();
  } else if (!targetUser) {
    newUser = await userModel.create({
      email,
      active: false,
      refreshToken: '',
      tenants: [tenantsId],
    });
  } else {
    newUser = targetUser;
  }

  try {
    //TODO: fix
    if (!newUser) {
      throw new Error('RegisterService Cannot find user');
    }
    validationToken = jwt.sign({ id: newUser.id }, config.emailSecret);
    emailSender(email, `token=${validationToken}`, getDomain(newTenants.origin, origin || ''));
  } catch (e) {
    winstonLogger.error('registerServiceV2 Fail:' + e);
    if (newUser.tenants.length === 0) {
      userModel.deleteOne({ email });
    } else {
      newUser.tenants.pop();
      await newUser.save();
    }
    throw new Error('Email sent failed');
  }

  return { newUser, validationToken };
};
