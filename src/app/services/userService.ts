import { Request } from 'express';
import * as User from '../model/user';

export const updateUserSetting = async (req: Request) => {
  const { id } = req.params;
  const { name, jobTitle, department, location, avatarIcon, abbreviation, userName } = req.body;
  const updateUserPageFlag = await User.getModel(req.tenantsConnection).findOneAndUpdate(
    { userId: id },
    { name, jobTitle, department, location, avatarIcon, abbreviation, userName },
  );
  if (!updateUserPageFlag) {
    throw new Error('Cannot update user');
  }
};
