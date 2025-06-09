import * as status from 'http-status';


export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}


export class NotFoundError extends AppError {
  constructor(message: string = 'The requested resource was not found.') {
    super(message, status.NOT_FOUND);
  }
}


export class ValidationError extends AppError {
  public readonly details?: any;

  constructor(message: string = 'Input validation failed.', details?: any) {
    super(message, status.UNPROCESSABLE_ENTITY);
    this.details = details;
  }
}


export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication is required to access this resource.') {
    super(message, status.UNAUTHORIZED);
  }
}


export class ForbiddenError extends AppError {
  constructor(message: string = "You do not have permission to perform this action.") {
    super(message, status.FORBIDDEN);
  }
}


export class BadRequestError extends AppError {
  constructor(message: string = "The request could not be understood by the server.") {
    super(message, status.BAD_REQUEST);
  }
}
