const { verifyToken, extractTokenFromHeader } = require('../utils/jwtHelper');
const { logger } = require('../utils/logger');

/**
 * Middleware to verify JWT token and set user data on request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateJWT = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      logger.warn('Missing authorization token');
      return res.status(401).json({
        success: false,
        error: {
          type: 'auth_error',
          message: 'Authentication required. Please provide a valid token.'
        }
      });
    }
    
    // Verify token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      logger.warn('Invalid authorization token');
      return res.status(401).json({
        success: false,
        error: {
          type: 'auth_error',
          message: 'Invalid authentication token.'
        }
      });
    }
    
    // Extract organization ID from app_metadata
    const orgId = decodedToken.app_metadata?.org_id || null;
    
    // Set user and organization data on request object
    req.user = {
      id: decodedToken.sub,
      orgId: orgId,
      token: token
    };
    
    logger.info(`Authenticated request for user ID: ${decodedToken.sub}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        type: 'auth_error',
        message: 'Authentication error. Please try again.'
      }
    });
  }
};

module.exports = {
  authenticateJWT
}; 