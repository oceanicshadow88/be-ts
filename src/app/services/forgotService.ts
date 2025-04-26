import { Request } from 'express';
import * as User from '../model/user';
import { forgetPasswordEmail } from '../utils/emailSender';
import jwt from 'jsonwebtoken';
import config from '../config/app';

export const forgotPassword = async (req: Request) => {
  const { email } = req.body;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findOne({ email, active: true });
  const token = jwt.sign({ email }, config.forgotSecret, {
    expiresIn: '30m',
  });
  await forgetPasswordEmail(email, user?.name, token, req.headers.origin ?? '');
  return user;
};

export const updatePassword = async (req: Request) => {
  const email = req.email;
  const { password } = req.body;
  const user = await User.getModel(req.tenantsConnection).findOne({ email });
  user.password = password;
  user.active = true;
  await user.save();
  if (user) return user;
  return null;
};
