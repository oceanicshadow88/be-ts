/**
 * Error Handler Middleware
 *
 * Central error handling middleware for the application.
 * Catches all errors, formats them, logs them, and sends appropriate responses.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../loaders/logger';
import { ValidationErrorHandler } from './validationErrorHandler';
import { DatabaseErrorHandler } from './databaseErrorHandler';
import { ErrorHandlerStrategy } from './errorHandlerStrategy';
import status from 'http-status';

// Use require to avoid case sensitivity issues with TypeScript imports
// @ts-ignore
const { AppError } = require('../../error/appError');

/**
 * AppError Handler - handles all errors that inherit from AppError
 */
class AppErrorHandler implements ErrorHandlerStrategy {
  handles(error: Error): boolean {
    return error instanceof AppError;
  }

  handle(error: Error, req: Request, res: Response): void {
    const appError = error as any; // Cast to any to access AppError properties
    const { statusCode, message } = appError;

    res.status(statusCode).json(appError.toResponseFormat());
    logger.info(`AppError handled: ${message}`);
  }
}

/**
 * Default Error Handler - fallback for all unhandled errors
 */
class DefaultErrorHandler implements ErrorHandlerStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handles(error: Error): boolean {
    // This is the fallback handler - always returns true
    return true;
  }

  handle(error: Error, _req: Request, res: Response): void {
    logger.error('Unhandled error type:', error);

    res.status(status.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_SERVER_ERROR',
        statusCode: status.INTERNAL_SERVER_ERROR,
      },
    });
  }
}

/**
 * Error Handler Chain manages error handlers registration and execution
 */
class ErrorHandlerManager {
  private handlers: ErrorHandlerStrategy[] = [];

  /**
   * Register default handlers in order of specificity
   */
  constructor() {
    // Register handlers for third-party or non-AppError errors first
    this.registerHandler(new ValidationErrorHandler());
    this.registerHandler(new DatabaseErrorHandler());

    // AppError handler - handles all errors derived from AppError
    this.registerHandler(new AppErrorHandler());

    // Default handler should always be last
    this.registerHandler(new DefaultErrorHandler());
  }

  /**
   * Register a new error handler
   * @param handler The handler to register
   */
  registerHandler(handler: ErrorHandlerStrategy): void {
    this.handlers.push(handler);
  }

  /**
   * Handle an error using the first matching handler in the chain
   * @param error The error to handle
   * @param req The request object
   * @param res The response object
   */
  handleError(error: Error, req: Request, res: Response): void {
    // Find the first handler that can handle this error
    for (const handler of this.handlers) {
      if (handler.handles(error)) {
        handler.handle(error, req, res);
        return;
      }
    }
  }
}

// Create a singleton instance of the error handler manager
const errorHandlerManager = new ErrorHandlerManager();

/**
 * Central error handling middleware
 * This should be registered as the last middleware in the app
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // If headers are already sent, let Express handle it
  if (res.headersSent) {
    return next(error);
  }

  // Log request information
  logger.info(`Error caught in errorHandler for ${req.method} ${req.path}`);

  // Process the error through handlers
  errorHandlerManager.handleError(error, req, res);
};

/**
 * Register a custom error handler
 * Allows application to extend error handling with custom handlers
 * @param handler The custom error handler to register
 */
export const registerErrorHandler = (handler: ErrorHandlerStrategy): void => {
  errorHandlerManager.registerHandler(handler);
};

/**
 * Async handler to wrap route handlers and automatically catch errors
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not found middleware - creates 404 errors for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = AppError.NotFound(`Route ${req.originalUrl} not found`, 'Route');
  next(error);
};

/**
 * Initialize global error handlers for uncaught exceptions and unhandled promise rejections
 * This should be called once at application startup
 *
 * Usage:
 * ```
 * // In your app.js or server.js (main entry point)
 * import { initGlobalErrorHandlers } from './app/middleware/errorHandler';
 *
 * // Initialize at the start of your application
 * initGlobalErrorHandlers();
 * ```
 */
export const initGlobalErrorHandlers = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception:', error);

    if (error instanceof AppError) {
      const appError = error as any;
      logger.info(`AppError: ${error.message}`, appError.toLoggerFormat());
    }
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled rejection:', error);

    if (error instanceof AppError) {
      const appError = error as any;
      logger.info(`AppError: ${error.message}`, appError.toLoggerFormat());
    }
  });

  logger.info('Global error handlers initialized');
};
