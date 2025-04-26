import { Request } from 'express';
import { emailRecipientTemplate } from '../utils/emailSender';
import config from '../config/app';

export const contactFormEmail = async (req: Request) => {
  const emailFrom = `noreply@${config.mainDomain}`;
  const emailTo = ['infotechscrum@gmail.com'];
  await emailRecipientTemplate(emailFrom, emailTo, req.body, 'contactPageEmailTemplate');
  return true;
};
