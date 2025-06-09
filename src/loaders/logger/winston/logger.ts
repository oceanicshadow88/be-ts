import * as winston from 'winston';
import * as path from 'path';
import 'winston-daily-rotate-file';
import * as fs from 'fs';

const logDir = 'storage/logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const createLogger = (logSourceFilePath?: string) => {

  const dailyRotateFileTransport = new (winston.transports as any).DailyRotateFile({
    filename: path.join(logDir, 'logger-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  });

  const transports: winston.transport[] = [dailyRotateFileTransport];

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    transports.push(new winston.transports.Console());
  }

  const logger = winston.createLogger({
    level: 'info',
    defaultMeta: {
      file: logSourceFilePath ? path.basename(logSourceFilePath) : undefined,
    },
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, sourceFile, apiRoute, httpMethod, context, error }) => {
        const fileInfo = sourceFile ? `[${sourceFile}]` : '';
        const errorType = error?.name ? `${error.name}` : '';
        const requestInfo = apiRoute && httpMethod ? `[${httpMethod} ${apiRoute}]` : '';
        const contextInfo = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
        const stackTrace = error?.stack ? `\nStack: ${error.stack}` : '';
        
        return `\n========== ${level.toUpperCase()}: ${errorType} ==========
        Timestamp: ${timestamp}
        Source:   ${fileInfo || 'N/A'}
        Route:    ${requestInfo || 'N/A'}
        Message:  ${message}${contextInfo ? `\n${contextInfo.replace(/\n/g, '\n  ')}` : ''}${stackTrace ? `\n${stackTrace.replace(/\n/g, '\n  ')}` : ''}
===============================`;
      })
    ),
    transports,
  });
  return logger;
};

const logger = createLogger();
export { createLogger, logger };