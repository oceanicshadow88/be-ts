import { Request, Response } from 'express';
import { logger } from '../../../loaders/logger';
import status from 'http-status';
import { ErrorHandlerStrategy } from './errorHandlerStrategy';

/**
 * Handles database errors
 */
export class DatabaseErrorHandler implements ErrorHandlerStrategy {
  handles(error: Error): boolean {
    // Mongoose/MongoDB error detection
    return (
      error.name === 'MongoError' ||
      error.name === 'MongooseError' ||
      error.name === 'CastError' ||
      error.message.includes('database') ||
      (error as any).code === 11000 // Duplicate key error
    );
  }

  handle(error: Error, req: Request, res: Response): void {
    logger.error(`Database error: ${error.message}`, error);

    // Handle duplicate key error specifically
    if ((error as any).code === 11000) {
      res.status(status.CONFLICT).json({
        error: {
          message: 'A duplicate entry was detected',
          code: 'DUPLICATE_ENTRY',
          statusCode: status.CONFLICT,
        },
      });
      return;
    }

    // Generic database error
    res.status(status.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'A database error occurred',
        code: 'DATABASE_ERROR',
        statusCode: status.INTERNAL_SERVER_ERROR,
      },
    });
  }
}
