const pino = require('pino');
const { v4: uuidv4 } = require('uuid');

// Configure the logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  transport: process.env.NODE_ENV !== 'production' 
    ? { target: 'pino-pretty' } 
    : undefined,
});

/**
 * Create a child logger with request-specific context
 * @param {Object} req - Express request object
 * @returns {Object} Child logger instance
 */
const createRequestLogger = (req) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  
  return logger.child({
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
};

/**
 * Log a complete query processing cycle
 * @param {Object} data - Query processing data
 * @param {Object} requestLogger - Request-specific logger
 */
const logQueryProcess = (data, requestLogger = logger) => {
  const { 
    userQuery,
    extractedIntent,
    generatedSql,
    validationResult,
    dbResult,
    response,
    error,
    duration
  } = data;

  requestLogger.info({
    type: 'query_process',
    userQuery,
    extractedIntent,
    generatedSql,
    validationResult: validationResult ? { valid: validationResult.valid } : null,
    dbResultSize: dbResult ? Array.isArray(dbResult) ? dbResult.length : 1 : 0,
    responseSize: response ? JSON.stringify(response).length : 0,
    error: error ? { message: error.message, stack: error.stack } : null,
    duration,
  });
};

module.exports = {
  logger,
  createRequestLogger,
  logQueryProcess,
}; 