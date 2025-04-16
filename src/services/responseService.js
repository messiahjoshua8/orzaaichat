const { logger } = require('../utils/logger');

/**
 * Format query results into a clean response
 * @param {Object} result - Query result data
 * @param {Object} intent - The original intent
 * @returns {Object} Formatted response
 */
const formatResponse = (result, intent) => {
  // If no result data, return empty response
  if (!result || !result.data) {
    return {
      success: true,
      data: null,
      meta: {
        count: 0,
        intent: intent.intent,
      },
    };
  }

  // Extract data and metadata
  const { data, metadata } = result;
  
  // Format based on query type
  switch (metadata.query_type) {
    case 'count':
      return {
        success: true,
        data: {
          count: data.count || 0,
        },
        meta: {
          intent: intent.intent,
          execution_time_ms: metadata.execution_time_ms,
        },
      };
    
    case 'select':
      return {
        success: true,
        data: Array.isArray(data) ? data : [],
        meta: {
          count: Array.isArray(data) ? data.length : 0,
          intent: intent.intent,
          execution_time_ms: metadata.execution_time_ms,
        },
      };
    
    case 'select_single':
      // If data is an array, take first element
      const item = Array.isArray(data) ? data[0] : data;
      
      return {
        success: true,
        data: item || null,
        meta: {
          intent: intent.intent,
          execution_time_ms: metadata.execution_time_ms,
        },
      };
    
    default:
      logger.warn({
        msg: 'Unknown query type for response formatting',
        query_type: metadata.query_type,
      });
      
      return {
        success: true,
        data,
        meta: {
          intent: intent.intent,
          execution_time_ms: metadata.execution_time_ms,
        },
      };
  }
};

/**
 * Format validation errors into a clean response
 * @param {Object} validationResult - Validation result with errors
 * @param {Object} intent - The original intent
 * @returns {Object} Error response
 */
const formatValidationErrorResponse = (validationResult, intent) => {
  return {
    success: false,
    error: {
      type: 'validation_error',
      message: 'Query validation failed',
      details: validationResult.errors || ['Unknown validation error'],
    },
    meta: {
      intent: intent.intent,
    },
  };
};

/**
 * Format a general error into a clean response
 * @param {Error} error - The error object
 * @returns {Object} Error response
 */
const formatErrorResponse = (error) => {
  return {
    success: false,
    error: {
      type: 'error',
      message: error.message || 'An unknown error occurred',
    },
  };
};

module.exports = {
  formatResponse,
  formatValidationErrorResponse,
  formatErrorResponse,
}; 