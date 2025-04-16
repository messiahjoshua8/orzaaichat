/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Use request-specific logger if available, or fallback to console
  const logger = req.logger || console;
  
  // Log the error
  logger.error({
    msg: 'Error occurred during request processing',
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
    },
  });
  
  // Determine status code based on error type
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Invalid request data';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = 'Access denied';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorMessage = 'Resource not found';
  }
  
  // Send appropriate error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: errorMessage,
      details: process.env.NODE_ENV === 'production' ? undefined : err.message,
    },
  });
};

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

module.exports = {
  errorHandler,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
}; 