/**
 * App Error Module
 *
 * Provides a standardized error handling foundation for the application.
 * Implements a hierarchy of error types with appropriate status codes
 * and formatting utilities for logging and API responses.
 */

/**
 * Error context type definition
 */
export type ErrorContext = Record<string, unknown>;

/**
 * HTTP Status Codes enum
 */
export enum HttpStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Error Code Prefix for default error codes
 */
const ERROR_CODE_PREFIX = 'ERR';

/**
 * Base error class for application errors
 */
export class AppError extends Error {
  readonly statusCode: number;

  readonly isOperational: boolean;

  readonly context?: ErrorContext;

  readonly code?: string;

  readonly entity?: string;

  /**
   * Creates an instance of AppError
   * @param message Human-readable description of the error
   * @param statusCode HTTP status code
   * @param code Error code for client to identify error type
   * @param context Additional context information
   * @param entity The type of entity/resource this error relates to (only used by NotFound)
   */
  constructor(
    message: string,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    code?: string,
    context?: ErrorContext,
    entity?: string,
  ) {
    // If no custom message provided but entity is, create a default message
    const errorMessage = !message && entity ? `${entity} operation failed` : message;

    super(errorMessage);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // Marks this as a known operational error vs programming error
    this.context = context;
    this.code = code;
    this.entity = entity;

    // Capture stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Format error for logging purposes
   * Contains all details including stack trace
   * @returns Formatted error for logging
   */
  toLoggerFormat(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      entity: this.entity,
      isOperational: this.isOperational,
      context: this.context,
      stack: this.stack,
    };
  }

  /**
   * Format error for API response
   * Omits sensitive information like stack traces
   * @returns Formatted error for API response
   */
  toResponseFormat(): Record<string, unknown> {
    return {
      error: {
        message: this.message,
        code: this.code || `${ERROR_CODE_PREFIX}_${this.statusCode}`,
        statusCode: this.statusCode,
        ...(this.entity && { entity: this.entity }),
        ...(this.context && { context: this.context }),
      },
    };
  }

  /**
   * HTTP Error Factory Methods
   */

  /**
   * Creates a Bad Request (400) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static BadRequest(message: string, code = 'BAD_REQUEST', context?: ErrorContext): AppError {
    return new AppError(message, HttpStatus.BAD_REQUEST, code, context);
  }

  /**
   * Creates an Unauthorized (401) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static Unauthorized(message: string, code = 'UNAUTHORIZED', context?: ErrorContext): AppError {
    return new AppError(message, HttpStatus.UNAUTHORIZED, code, context);
  }

  /**
   * Creates a Forbidden (403) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static Forbidden(message: string, code = 'FORBIDDEN', context?: ErrorContext): AppError {
    return new AppError(message, HttpStatus.FORBIDDEN, code, context);
  }

  /**
   * Creates a Not Found (404) error
   * @param message Error message (optional, will use "{entity} not found" if not provided)
   * @param entity The entity that was not found (default: 'Resource')
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static NotFound(
    message = '',
    entity = 'Resource',
    code = 'NOT_FOUND',
    context?: ErrorContext,
  ): AppError {
    // Special case for NotFound to match existing NotFoundError behavior
    const errorMessage = message || `${entity} not found`;
    return new AppError(errorMessage, HttpStatus.NOT_FOUND, code, context, entity);
  }

  /**
   * Creates a Method Not Allowed (405) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static MethodNotAllowed(
    message: string,
    code = 'METHOD_NOT_ALLOWED',
    context?: ErrorContext,
  ): AppError {
    return new AppError(message, HttpStatus.METHOD_NOT_ALLOWED, code, context);
  }

  /**
   * Creates a Conflict (409) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static Conflict(message: string, code = 'CONFLICT', context?: ErrorContext): AppError {
    return new AppError(message, HttpStatus.CONFLICT, code, context);
  }

  /**
   * Creates an Unprocessable Entity (422) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static UnprocessableEntity(
    message: string,
    code = 'UNPROCESSABLE_ENTITY',
    context?: ErrorContext,
  ): AppError {
    return new AppError(message, HttpStatus.UNPROCESSABLE_ENTITY, code, context);
  }

  /**
   * Creates a Too Many Requests (429) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static TooManyRequests(
    message: string,
    code = 'TOO_MANY_REQUESTS',
    context?: ErrorContext,
  ): AppError {
    return new AppError(message, HttpStatus.TOO_MANY_REQUESTS, code, context);
  }

  /**
   * Creates an Internal Server Error (500)
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static InternalServer(
    message = 'Internal Server Error',
    code = 'INTERNAL_SERVER_ERROR',
    context?: ErrorContext,
  ): AppError {
    return new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR, code, context);
  }

  /**
   * Creates a Service Unavailable (503) error
   * @param message Error message
   * @param code Error code
   * @param context Additional error context
   * @returns AppError instance
   */
  static ServiceUnavailable(
    message: string,
    code = 'SERVICE_UNAVAILABLE',
    context?: ErrorContext,
  ): AppError {
    return new AppError(message, HttpStatus.SERVICE_UNAVAILABLE, code, context);
  }
}
