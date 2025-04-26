import winston, { format, createLogger } from 'winston';
const { timestamp, combine, align, printf } = format;
import path from 'path';

function buildProdLogger(): any {
  return createLogger({
    format: combine(
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss A',
      }),
      align(),
      printf((info: any) => `[${info.timestamp}] ${info.level}: ${info.message}`),
    ),
    transports: [
      new winston.transports.File({
        filename: path.join('storage/logs', '/logger.log'),
      }),
    ],
  });
}

export { buildProdLogger };
