import { logger } from '../logger/winston/logger';
import { Request, Response } from 'express';
import { getSourceFileFromStack } from '../utils/getSourceFileFromStack';
import { getStatusCode } from '../utils/getStatusCode';

class ErrorHandlerMiddleware {
  public handleError(err: any, req: Request, res: Response): void {
    const logContext = {
      errorType: err.name || 'Error',
      apiRoute: req.originalUrl,
      httpMethod: req.method,
      sourceFile: getSourceFileFromStack(err.stack),
      context: err.context || {
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
      },
      error: err,
    };

    logger.error(err.message, logContext);
    
    const statusCode = getStatusCode(err);
    res.status(statusCode).json({
      success: false,
      message: err.message,
      statusCode: statusCode,
    });
  }
}

export const errorHandler = new ErrorHandlerMiddleware();