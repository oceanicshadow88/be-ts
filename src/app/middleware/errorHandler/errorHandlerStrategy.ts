import { Request, Response } from 'express';

/**
 * Error handler interface - all error handlers should implement this
 */
export interface ErrorHandlerStrategy {
  /**
   * Determines if this handler can handle the given error
   * @param error The error to check
   */
  handles(error: Error): boolean;

  /**
   * Handles the error by formatting a response
   * @param error The error to handle
   * @param req The request object
   * @param res The response object to send the error response
   */
  handle(error: Error, req: Request, res: Response): void;
}
