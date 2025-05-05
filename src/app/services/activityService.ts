import { Request } from 'express';
import * as User from '../model/user';
import * as Activity from '../model/activity';

export const getActivity = async (req: Request) => {
  const { tid } = req.params;
  const userModel = await User.getModel(req.tenantsConnection);

  const result = await Activity.getModel(req.dbConnection)
    .find({ ticket: tid })
    .sort({ createdAt: -1 })
    .populate({ path: 'user', model: userModel });
  return result;
};

export const deleteActivity = async (req: Request) => {
  const ticketId = req.params.id;
  await Activity.getModel(req.dbConnection).updateMany({ ticket: ticketId }, { isDeleted: true });
  await Activity.getModel(req.dbConnection).find({ ticket: ticketId });
};
