const express = require('express');
const router = express.Router();
const { extractIntent } = require('../services/nlpService');
const { validateIntent } = require('../services/validationService');
const { buildAndExecuteQuery } = require('../services/queryBuilderService');
const { 
  formatResponse, 
  formatValidationErrorResponse, 
  formatErrorResponse 
} = require('../services/responseService');
const { logQueryProcess } = require('../utils/logger');
const { ValidationError } = require('../middleware/errorHandler');

/**
 * @route POST /api/query
 * @desc Process a natural language query and return results
 * @access Public
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();
  const processData = {
    userQuery: req.body.query,
  };

  try {
    // Validate request body
    if (!req.body.query || typeof req.body.query !== 'string') {
      throw new ValidationError('Query is required and must be a string');
    }

    // 1. Extract intent from natural language query
    req.logger.info(`Processing query: ${req.body.query}`);
    const intent = await extractIntent(req.body.query);
    processData.extractedIntent = intent;
    
    // 2. Validate intent against database schema
    const validationResult = await validateIntent(intent);
    processData.validationResult = validationResult;
    
    if (!validationResult.valid) {
      // Return validation errors
      const errorResponse = formatValidationErrorResponse(validationResult, intent);
      res.status(400).json(errorResponse);
      
      // Log the complete process
      processData.response = errorResponse;
      processData.duration = Date.now() - startTime;
      logQueryProcess(processData, req.logger);
      
      return;
    }
    
    // 3. Build and execute the query
    const queryResult = await buildAndExecuteQuery(intent);
    processData.dbResult = queryResult.data;
    processData.generatedSql = queryResult.metadata ? queryResult.metadata.sql : null;
    
    // 4. Format the response
    const response = formatResponse(queryResult, intent);
    processData.response = response;
    
    // 5. Send the response
    res.json(response);
  } catch (error) {
    // Handle errors
    const errorResponse = formatErrorResponse(error);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error instanceof ValidationError) {
      statusCode = 400;
    }
    
    res.status(statusCode).json(errorResponse);
    
    // Log the error and process data
    processData.error = error;
    processData.response = errorResponse;
  } finally {
    // Log the complete process regardless of success or failure
    processData.duration = Date.now() - startTime;
    logQueryProcess(processData, req.logger);
  }
});

module.exports = router; 