import { AppError } from './appError';

export class BadRequestError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 400, context);
  }
}
