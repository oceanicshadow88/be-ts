import * as winston from 'winston';
import * as path from 'path';

const createLogger = (filename?: string) => {
  const transports: winston.transport[] = [
    new winston.transports.File({ filename: 'storage/logs/combined.log' }),
    new winston.transports.File({
      level: 'error',
      filename: 'storage/logs/error.log',
    }),
  ];

  if (process.env.NODE_ENV === 'development' || 'local') {
    transports.push(new winston.transports.Console());
  }
  
  const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
      file: filename ? path.basename(filename) : undefined,
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        ({ timestamp, level, message, file, error, requestPath, method }) => {
          const fileInfo = file ? `[${file}]` : '';
          const requestInfo = requestPath && method ? `[${method} ${requestPath}]` : '';
          const stack = error?.stack;
          const contextInfo = error?.context ? `\n${JSON.stringify(error.context)}` : '';
          const stackTrace = stack ? `\n${stack}` : '';
          return `[${timestamp}]${fileInfo}${requestInfo} [${level}]: ${message}${contextInfo}${stackTrace}`;
        },
      ),
    ),
    transports,
  });
  return logger;
};

const logger = createLogger();
export { createLogger, logger };