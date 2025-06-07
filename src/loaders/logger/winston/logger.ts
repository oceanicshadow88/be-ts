import * as winston from 'winston';
import * as path from 'path';
import 'winston-daily-rotate-file';
import * as fs from 'fs';

// checks whether the log directory exists, if not, create it
// recursive is true means it creates parent directories if they don't exist
const logDir = 'storage/logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const createLogger = (logSourceFilePath?: string) => {
  
  const dailyRotateFileTransport = new (winston.transports as any).DailyRotateFile({
    filename: path.join(logDir, 'error-logger-%DATE%.log'),
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
      sourceFile: logSourceFilePath ? path.basename(logSourceFilePath) : undefined,
    },
    format: winston.format.combine(
      winston.format.colorize(), // Apply colors
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(
        ({ timestamp, level, message, sourceFile, error, apiRoute, httpMethod, errorType, stack, validationErrors }) => {
            let logOutput = `\n========== ERROR LOG ==========`; // Header for the error block
            logOutput += `\n  Timestamp: ${timestamp}`;
            logOutput += `\n  Level:     ${level}`; // Will display with color codes
            
            if (errorType) {
              logOutput += `\n  Type:      ${errorType}`;
            }
            if (apiRoute) {
              logOutput += `\n  Route:     ${httpMethod ? httpMethod.toUpperCase() + ' ' : ''}${apiRoute}`;
            }
            if (sourceFile) {
              logOutput += `\n  File:      ${sourceFile}`; // Originating file of the error
            }
            // logOutput += `\n  Message:   ${message}`; // Main error message
            logOutput += `\n  Message:   ${typeof message === 'string' ? message : message?.message || 'No message'}`;


            // Validation Errors (if present and has content)
            if (validationErrors && Object.keys(validationErrors).length > 0) {
              logOutput += `\n\n  Validation Errors:`;
              try {
                // Indent JSON string for better readability
                logOutput += `\n${JSON.stringify(validationErrors, null, 2).split('\n').map(l => `    ${l}`).join('\n')}`;
              } catch (stringifyError: any) {
                logOutput += `\n    (Could not stringify validation errors: ${stringifyError.message})`;
              }
            }

            
            // Context property directly on the error object (if it exists)
            if (error?.context && Object.keys(error.context).length > 0) {
              logOutput += `\n\n  Context Data:`;
              try {
                // Indent JSON string for better readability
                logOutput += `\n${JSON.stringify(error.context, null, 2).split('\n').map(l => `    ${l}`).join('\n')}`;
              } catch (stringifyError: any) {
                logOutput += `\n    (Could not stringify context data: ${stringifyError.message})`;
              }
            }
            
            // Stack Trace (if available)
            // console.log('STACK:', stack);
            const errorStack = stack || (typeof message === 'object' && message?.stack) || undefined;
            if (errorStack) {
              const prettifiedStack = errorStack.split('\n').map((l: string) => `    ${l.trim()}`).join('\n');
              logOutput += `\n\n  Stack Trace:\n${prettifiedStack}`;
            }
            
            logOutput += `\n===============================\n`; // Footer for the error block
            return logOutput;
        },
      ),
    ),
    transports,
  });
  return logger;
};

const logger = createLogger();
export { createLogger, logger };