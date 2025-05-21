import { AppError } from './appError';

class EntityError extends AppError {

  constructor(message: string, statusCode: number, context: Record<string, unknown> = {}) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
  }
}

export { EntityError };