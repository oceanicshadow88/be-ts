import { AppError } from './appError';

export class ValidationError extends AppError {
  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message, 422, context);
  }
}
