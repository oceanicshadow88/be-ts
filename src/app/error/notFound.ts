export default class NotFoundError extends Error {
  entity: string;

  statusCode: number;

  isOperational: boolean;

  /**
   * Creates an instance of NotFoundError.
   * @param {string} message - Human-readable description of the error.
   * @param {string} [entity='Resource'] - The entity that was not found.
   */
  constructor(message: string, entity = 'Resource') {
    super(message || `${entity} not found`);
    this.name = 'NotFoundError';
    this.entity = entity;
    this.statusCode = 500;
    this.isOperational = true; // to indicate this is a known, operational error
  }
}
