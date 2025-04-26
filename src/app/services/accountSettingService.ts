import { Response, Request, NextFunction } from 'express';
import status from 'http-status';
import * as User from '../model/user';
import { passwordAuth } from './passwordAuthService';
import { encryption } from '../utils/encryptionUtils';

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, oldPassword } = req.body;
  const userId = req.body.userInfo.id;
  const userModel = await User.getModel(req.tenantsConnection);
  const user = await userModel.findOne({ _id: userId });
  try {
    const checkPasswordFlag = await passwordAuth(oldPassword, user.password);
    if (!checkPasswordFlag) {
      return res.sendStatus(status.NOT_ACCEPTABLE);
    }
    const newHashPassword = await encryption(newPassword);
    const passwordUpdateFlag = await User.getModel(req.tenantsConnection).updateOne(
      { _id: userId },
      { password: newHashPassword },
    );
    return !passwordUpdateFlag;
  } catch (e) {
    next(e);
  }
};
