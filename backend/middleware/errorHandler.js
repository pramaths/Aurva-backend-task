const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    method: req.method,
    path: req.path
  });

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;