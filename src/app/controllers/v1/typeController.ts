import { Request, Response } from 'express';
import { replaceId } from '../../services/replaceService';
import typeService from '../../services/typeService';

export const index = async (req: Request, res: Response) => {
  const result = await typeService.getTicketType(req);
  res.send(replaceId(result));
};

const typeController = { index };

export default typeController;
