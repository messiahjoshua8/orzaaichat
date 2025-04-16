const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
  try {
    if (!token) return null;
    
    // Verify the token using the JWT secret from environment variables
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    
    // Log that we extracted the org_id (but not the actual value for security)
    if (decoded && decoded.org_id) {
      logger.info('Successfully extracted organization ID from JWT');
    }
    
    return decoded;
  } catch (error) {
    logger.error('JWT verification failed:', error.message);
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Remove 'Bearer ' prefix to get the token
  return authHeader.substring(7);
};

/**
 * Create a Supabase client with user's JWT token
 * @param {Object} supabaseModule - The Supabase module with createClient
 * @param {string} token - User's JWT token
 * @returns {Object} Supabase client with user's auth context
 */
const createUserSupabaseClient = (token) => {
  const { createClient } = require('@supabase/supabase-js');
  
  // Create a new Supabase client with the user's token
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};

module.exports = {
  verifyToken,
  extractTokenFromHeader,
  createUserSupabaseClient,
}; 