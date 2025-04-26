import { Request, Response, NextFunction } from 'express';
import * as Permission from '../../model/permission';
import status from 'http-status';
import { validationResult } from 'express-validator';
import { replaceId } from '../../services/replaceService';

//get
export const index = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  try {
    //use cache after all features move to v2
    const permission = await Permission.getModel(req.dbConnection).find();
    res.send(replaceId(permission));
  } catch (e) {
    next(e);
  }
};
