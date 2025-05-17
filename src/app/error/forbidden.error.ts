import { AppError } from './appError';

export class ForbiddenError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 403, context);
  }
}
