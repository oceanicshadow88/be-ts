import { Request } from 'express';
import * as Type from '../model/type';

export const getTicketType = async (req: Request) => {
  const typeModel = Type.getModel(req.dbConnection);
  let result = await typeModel.find();
  return result;
};

const typeService = { getTicketType };

export default typeService;
