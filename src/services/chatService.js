const { createUserSupabaseClient } = require('../utils/jwtHelper');
const { logger } = require('../utils/logger');
const { extractIntent } = require('./nlpService');
const { validateIntent } = require('./validationService');
const { buildAndExecuteQuery } = require('./queryBuilderService');
const { 
  formatResponse, 
  formatValidationErrorResponse, 
  formatErrorResponse 
} = require('./responseService');

/**
 * Generate a human-readable response based on query results and intent
 * @param {Object} queryResult - The result of the database query
 * @param {Object} intent - The extracted intent
 * @returns {string} A human-readable response
 */
const generateHumanReadableResponse = (queryResult, intent) => {
  const { data, metadata } = queryResult;
  
  // Handle count intents
  if (metadata.query_type === 'count') {
    const count = data.count || 0;
    const entityType = intent.intent.replace('count_', '');
    
    switch (entityType) {
      case 'candidates':
        return `You currently have ${count} candidates in your ATS.`;
      case 'jobs':
      case 'job_postings':
        return `You currently have ${count} job postings in your ATS.`;
      case 'applications':
        return `You currently have ${count} applications in your ATS.`;
      case 'offers':
        return `You currently have ${count} offers in your ATS.`;
      default:
        return `You currently have ${count} ${entityType.replace('_', ' ')} in your ATS.`;
    }
  }
  
  // Handle search intents
  if (metadata.query_type === 'select') {
    const count = Array.isArray(data) ? data.length : 0;
    const entityType = intent.intent.replace('search_', '');
    
    if (count === 0) {
      return `I couldn't find any ${entityType.replace('_', ' ')} matching your criteria.`;
    }
    
    return `I found ${count} ${entityType.replace('_', ' ')} matching your criteria.`;
  }
  
  // Handle get_details intents
  if (metadata.query_type === 'select_single') {
    if (!data) {
      return `I couldn't find that specific record in your ATS.`;
    }
    
    const entityType = intent.intent.replace('get_', '').replace('_details', '');
    return `Here are the details for the ${entityType.replace('_', ' ')} you requested.`;
  }
  
  // Fallback response
  return `I've processed your request about ${intent.intent.replace('_', ' ')}.`;
};

/**
 * Process a chat request using the existing query pipeline
 * @param {string} message - User's chat message
 * @param {string} token - User's JWT token 
 * @param {string} userId - User's ID from the token
 * @param {string} orgId - Organization ID from the token
 * @returns {Object} Chat response
 */
const processChat = async (message, token, userId, orgId) => {
  const startTime = Date.now();
  const processData = {
    userQuery: message,
    userId,
    orgId
  };

  try {
    // Create a Supabase client with the user's token (for user-specific queries)
    const userSupabase = createUserSupabaseClient(token);
    
    // Log minimal information (don't expose the token or full user details)
    logger.info(`Processing chat request from user belonging to organization: ${orgId}`);
    
    // 1. Extract intent from the natural language message
    const intent = await extractIntent(message);
    processData.extractedIntent = intent;
    
    // Add organization filter to ensure data is scoped properly
    if (orgId) {
      if (!intent.parameters) {
        intent.parameters = {};
      }
      
      if (!intent.parameters.filters) {
        intent.parameters.filters = [];
      }
      
      // Add organization_id filter explicitly
      intent.parameters.filters.push({
        field: 'organization_id',
        operator: 'eq',
        value: orgId
      });
      
      logger.info(`Added organization_id filter to enforce data isolation for org: ${orgId}`);
    }
    
    // 2. Validate intent against database schema
    const validationResult = await validateIntent(intent);
    processData.validationResult = validationResult;
    
    if (!validationResult.valid) {
      // Return validation errors
      const errorResponse = formatValidationErrorResponse(validationResult, intent);
      
      // Log the complete process
      processData.response = errorResponse;
      processData.duration = Date.now() - startTime;
      logger.info('Chat validation failed', processData);
      
      return errorResponse;
    }
    
    // 3. Build and execute the query
    const queryResult = await buildAndExecuteQuery(intent, userSupabase);
    processData.dbResult = queryResult.data;
    processData.generatedSql = queryResult.metadata ? queryResult.metadata.sql : null;
    
    // 4. Format the response
    const response = formatResponse(queryResult, intent);
    processData.response = response;
    
    // 5. Generate a human-readable response
    const humanReadableResponse = generateHumanReadableResponse(queryResult, intent);
    
    // If we have count results, log them for debugging
    if (queryResult.metadata?.query_type === 'count' && queryResult.data?.count !== undefined) {
      logger.info(`🧠 Final ${intent.intent} count: ${queryResult.data.count}`);
    }
    
    // Add human-readable response and metadata
    response.response = humanReadableResponse;
    response.meta = {
      ...response.meta,
      user_id: userId,
      org_id: orgId,
      execution_time_ms: Date.now() - startTime
    };
    
    // Log success without exposing sensitive data
    processData.duration = Date.now() - startTime;
    logger.info('Chat processed successfully', {
      userId,
      orgId,
      intent: intent.intent,
      duration: processData.duration
    });
    
    return response;
  } catch (error) {
    // Log the error
    logger.error('Error processing chat:', error);
    
    const errorResponse = formatErrorResponse(error);
    errorResponse.response = "I encountered an error processing your request. Please try again.";
    
    // Log the complete process data
    processData.error = error;
    processData.response = errorResponse;
    processData.duration = Date.now() - startTime;
    
    return errorResponse;
  }
};

module.exports = {
  processChat
}; 