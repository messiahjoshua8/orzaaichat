const { createUserSupabaseClient } = require('../utils/jwtHelper');
const { logger } = require('../utils/logger');

/**
 * Process a chat request using a user-specific Supabase client
 * @param {string} message - User's chat message
 * @param {string} token - User's JWT token 
 * @param {string} userId - User's ID from the token
 * @param {string} orgId - Organization ID from the token
 * @returns {Object} Chat response
 */
const processChat = async (message, token, userId, orgId) => {
  try {
    // Create a Supabase client with the user's token (respects RLS)
    const userSupabase = createUserSupabaseClient(token);
    
    // Log minimal information (don't expose the token or full user details)
    logger.info(`Processing chat request from user belonging to organization: ${orgId}`);
    
    // This is a simplified placeholder implementation
    // Replace with actual chat processing logic that uses the authenticated Supabase client
    
    // Example: query candidates table using the authenticated client to demonstrate RLS
    let dbData = null;
    let dbError = null;
    
    try {
      // Try to query the candidates table with RLS applied
      const { data, error } = await userSupabase
        .from('candidates')
        .select('id')
        .limit(1);
      
      dbData = data;
      dbError = error;
    } catch (error) {
      logger.warn('Could not query candidates table:', error.message);
      // Continue processing even if database query fails
    }
    
    // Process the message and return a response
    return {
      success: true,
      data: {
        message: `Processed message: ${message}`,
        response: "This is a secure chat endpoint with JWT authentication and RLS support",
        // Include database query results if available
        db_result: dbData || null,
        db_error: dbError ? dbError.message : null
      },
      meta: {
        user_id: userId,
        org_id: orgId,
        authenticated: true,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    logger.error('Error processing chat:', error);
    throw error;
  }
};

module.exports = {
  processChat
}; 