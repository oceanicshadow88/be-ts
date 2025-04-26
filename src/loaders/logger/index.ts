import { buildDevLogger } from './winston/devLogger';
import { buildProdLogger } from './winston/prodLogger';
import { Logger } from 'winston';

const logger: Logger =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev'
    ? buildDevLogger()
    : buildProdLogger();

export { logger };
