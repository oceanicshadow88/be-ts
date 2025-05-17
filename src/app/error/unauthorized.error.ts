import { AppError } from './appError';

export class UnauthorizedError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 401, context);
  }
}
