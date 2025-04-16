const { createRequestLogger } = require('../utils/logger');

/**
 * Middleware to add a request-specific logger to each request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLoggerMiddleware = (req, res, next) => {
  // Create a request-specific logger
  req.logger = createRequestLogger(req);
  
  // Log request start
  req.logger.info({
    msg: `Request started`,
    body: req.method === 'POST' ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });
  
  // Store request start time
  req.startTime = Date.now();
  
  // Track response
  const originalSend = res.send;
  res.send = function(body) {
    res.responseBody = body;
    originalSend.apply(res, arguments);
  };
  
  // Log response when request completes
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    
    // Don't log response body for non-error responses
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    const responseBody = res.statusCode >= 400 && res.responseBody 
      ? JSON.parse(res.responseBody) 
      : undefined;
    
    req.logger[logLevel]({
      msg: `Request completed`,
      statusCode: res.statusCode,
      responseTime: duration,
      responseBody: responseBody,
    });
  });
  
  next();
};

module.exports = requestLoggerMiddleware; 