import * as User from '../model/user';

export const createUser = async (
  tenantsDbConnection: any,
  emailAdd: string,
  password: string,
  tenantId: string,
  name: string = 'techscrum',
) => {
  const user = await User.getModel(tenantsDbConnection);
  const resUser = await user.findOneAndUpdate(
    { email: emailAdd.toString() },
    {
      $setOnInsert: {
        active: false,
        refreshToken: '',
      },
      $addToSet: { tenants: tenantId },
    },
    {
      upsert: true,
      new: true,
    },
  );
  await resUser.activeAccount();
  await User.getModel(tenantsDbConnection).saveInfo(emailAdd, name, password);
  return resUser;
};
