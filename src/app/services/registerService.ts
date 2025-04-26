import { randomStringGenerator } from '../utils/randomStringGenerator';
import { emailSender } from '../utils/emailSender';
import * as User from '../model/user';
import jwt from 'jsonwebtoken';
import config from '../config/app';
import { logger } from '../../loaders/logger';

const emailRegister = async (email: string, dbConnection: any, domain: string) => {
  const activeCode = randomStringGenerator(16);
  try {
    const user = await User.getModel(dbConnection).findOneAndUpdate(
      { email },
      { email, activeCode, isAdmin: 1 },
      { new: true, upsert: true },
    );

    if (!config?.emailSecret) {
      logger.error('Missing email secret in env');
      return null;
    }

    const validationToken = jwt.sign({ email, activeCode }, config.emailSecret);
    emailSender(email, `token=${validationToken}`, domain);
    return user;
  } catch (e) {
    await User.getModel(dbConnection).deleteOne({ email });
    return null;
  }
};

export { emailRegister };
