import { logger } from './logger/winston/logger';

class ErrorHandler {
  public handleError(error: Error): void {
    logger.error(
      error.message, 
      { error },             
    );
  }

}

export const errorHandler = new ErrorHandler();