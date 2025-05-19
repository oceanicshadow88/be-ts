import { AppError } from './appError';
import httpStatus from 'http-status';

class EntityError extends AppError {

  constructor(message: string, statusCode: number, context: Record<string, unknown> = {}) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
  }

  static unprocessableEntity(message: string, context = {}) {
    return new EntityError(message, httpStatus.UNPROCESSABLE_ENTITY, context);
  }

  static alreadyExists(message: string, context = {}) {
    return new EntityError(message, httpStatus.CONFLICT, context);
  }
}

export { EntityError };