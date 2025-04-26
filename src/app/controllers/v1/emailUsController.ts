import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { contactFormEmail } from '../../services/emailService';

export const contactForm = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  await contactFormEmail(req);
  res.status(202).json({ message: 'Email Sent Successfully.' });
};
