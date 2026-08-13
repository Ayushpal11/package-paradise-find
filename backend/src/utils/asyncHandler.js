/**
 * Async Handler wrapper
 * Wraps async route handlers to catch and forward errors to error middleware.
 * Eliminates need for try-catch in every controller.
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * HTTP Error class for throwing controlled errors
 */
export class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const BadRequest = (message, details) => new HttpError(400, message, details);
export const Unauthorized = (message = 'Unauthorized') => new HttpError(401, message);
export const Forbidden = (message = 'Forbidden') => new HttpError(403, message);
export const NotFound = (message = 'Resource not found') => new HttpError(404, message);
export const InternalServerError = (message = 'Internal server error') => new HttpError(500, message);
