import { logger } from '../../loaders/logger/winston/logger';
import { Request, Response } from 'express';
import { getSourceFileFromStack } from '../utils/getSourceFileFromStack';

const errorNameToStatus: { [key: string]: number } = {
  "ValidationError": 422,
  "CastError": 400,
  "UnauthorizedError": 401,
  "ForbiddenError": 403,
  "NotFoundError": 404,
  "SyntaxError": 400,
  "Error": 500,
};

class ErrorHandlerMiddleware {
  public handleError(err: any, req: Request, res: Response): void {
    console.log("HEREHRERERERERER", err.stack)
    const sourceFile = getSourceFileFromStack(err.stack)
    console.log("SOURCEFILE", sourceFile)

    const logContext = {
      errorType: err.name || 'Error',
      apiRoute: req.originalUrl,
      httpMethod: req.method,
      sourceFile: sourceFile,
      context: err.context || {
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
      },
      error: err,
    };

    logger.error(err.message, logContext);
    
    const statusCode = this.getStatusCode(err);
    console.log('statusCode', statusCode);
    res.status(statusCode).json({
      success: false,
      message: err.message,
      statusCode: statusCode,
    });
  }


  private getStatusCode(err: unknown): number {
    if (typeof err === 'object' && err !== null) {
      const e = err as { name?: string; statusCode?: number; status?: number };
      return e.statusCode || e.status || errorNameToStatus[e.name ?? 'Error'] || 501;
    }
    return 501;
  }
}

export const errorHandler = new ErrorHandlerMiddleware();