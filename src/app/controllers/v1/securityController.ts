import { Request, Response } from 'express';
import status from 'http-status';

export const index = async (req: Request, res: Response) => {
  res.sendStatus(status.OK);
};
