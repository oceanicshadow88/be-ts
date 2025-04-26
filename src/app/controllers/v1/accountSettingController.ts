import { Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import * as User from '../../model/user';
import * as accountSettingService from '../../services/accountSettingService';

const { passwordAuth } = require('../../services/passwordAuthService');

interface IUser {
  _id?: Object;
  password?: string;
}

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const result = await accountSettingService.updatePassword(req, res, next);
  return res.sendStatus(!result ? status.NOT_ACCEPTABLE : status.OK);
};

export const update = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }
  const {
    name = '',
    avatarIcon = '',
    userName = '',
    abbreviation = '',
    jobTitle = '',
    location = '',
  } = req.body;

  const user: any = req.user;
  if (!user) {
    return;
  }

  const userModel = await User.getModel(req.tenantsConnection);
  const updateUser = await userModel.findOneAndUpdate(
    { _id: user._id },
    {
      name,
      avatarIcon,
      userName,
      abbreviation,
      jobTitle,
      location,
    },
    { new: true },
  );
  if (!updateUser) {
    res.sendStatus(status.NOT_ACCEPTABLE);
    return;
  }
  res.send(updateUser);
};

export const destroy = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(status.UNPROCESSABLE_ENTITY).json({});
  }

  const password = req.body.password;
  if (typeof req.user === 'object') {
    const user: IUser = req.user;
    try {
      const checkPasswordFlag = await passwordAuth(password, user.password ?? 'string');
      if (!checkPasswordFlag) {
        res.sendStatus(status.FORBIDDEN);
      }
      const userModel = await User.getModel(req.tenantsConnection);
      await userModel.deleteOne({ _id: user._id });
      return res.sendStatus(status.OK);
    } catch (e) {
      next(e);
    }
  }
  res.sendStatus(status.UNPROCESSABLE_ENTITY);
};
