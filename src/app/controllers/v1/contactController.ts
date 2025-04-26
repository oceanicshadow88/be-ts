import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import status from 'http-status';
import { sendContactEmail } from '../../services/contactService';

export const store = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.sendStatus(status.UNPROCESSABLE_ENTITY);
  }
  sendContactEmail(req);
};
