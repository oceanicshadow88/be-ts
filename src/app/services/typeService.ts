import { Request } from 'express';
import * as database from '../database/init';
import * as Type from '../model/type';

export const getTicketType = async (req: Request) => {
  const typeModel = Type.getModel(req.dbConnection);
  let result = await typeModel.find();
  if (result.length === 0) {
    await database.createTicketType(req.dbConnection);
    const res = await typeModel.find();
    return res;
  }
  return result;
};

const typeService = { getTicketType };

export default typeService;
