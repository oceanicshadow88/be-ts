import { Request, Response } from 'express';
import { logger } from '../../../loaders/logger';
import status from 'http-status';
import { ErrorHandlerStrategy } from './errorHandlerStrategy';

/**
 * Handles validation errors (e.g., from express-validator)
 */
export class ValidationErrorHandler implements ErrorHandlerStrategy {
  handles(error: Error): boolean {
    // Check if error is a validation error
    return error.name === 'ValidationError' || (error as any).errors !== undefined;
  }

  handle(error: Error, req: Request, res: Response): void {
    logger.info(`Validation error handled: ${error.message}`);

    // Format validation errors in a consistent structure
    const validationErrors = (error as any).errors || {};

    res.status(status.UNPROCESSABLE_ENTITY).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: status.UNPROCESSABLE_ENTITY,
        errors: validationErrors,
      },
    });
  }
}
