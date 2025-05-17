import { AppError } from './appError';

export class ConflictError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 409, context);
  }
}
