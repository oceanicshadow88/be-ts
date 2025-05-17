export class AppError extends Error {
  readonly statusCode: number;

  readonly context: Record<string, unknown>;

  constructor(message: string, statusCode = 500, context: Record<string, unknown> = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.context = {
      ...context,
    };

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

}
