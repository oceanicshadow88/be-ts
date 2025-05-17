import { AppError } from './appError';

export class NotFoundError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 404, context);
  }
}
