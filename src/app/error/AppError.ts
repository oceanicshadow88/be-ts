import status from 'http-status';

export class AppError extends Error {
  public readonly statusCode: number;
  
  public readonly context?: Record<string, any>;

  constructor(message: string, statusCode: number, context?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.context = context;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(message = 'Input validation failed.', details?: any) {
    const context = details ? { validationErrors: details } : undefined;
    super(message, status.UNPROCESSABLE_ENTITY, context);
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found.', context?: Record<string, any>) {
    super(message, status.NOT_FOUND, context);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required to access this resource.', context?: Record<string, any>) {
    super(message, status.UNAUTHORIZED, context);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.', context?: Record<string, any>) {
    super(message, status.FORBIDDEN, context);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'The request could not be understood by the server.', context?: Record<string, any>) {
    super(message, status.BAD_REQUEST, context);
  }
}
