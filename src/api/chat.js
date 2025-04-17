const express = require('express');
const router = express.Router();
const { processChat } = require('../services/chatService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { logger } = require('../utils/logger');

/**
 * @route POST /api/chat
 * @desc Process a chat message with JWT authentication
 * @access Private - requires valid JWT
 */
router.post('/', authenticateJWT, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Validate request body
    if (!req.body.message || typeof req.body.message !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          type: 'validation_error',
          message: 'Message is required and must be a string'
        }
      });
    }
    
    // Get user data from the authenticated request
    const { id: userId, orgId: tokenOrgId, token } = req.user;
    
    // Use organizationId from request body if provided, otherwise fall back to token
    const orgId = req.body.organizationId || tokenOrgId;
    
    // Log the organization being used
    logger.info(`Processing chat request from user belonging to organization: ${orgId}`);
    
    // Process the chat message using the user's authenticated context
    const response = await processChat(
      req.body.message,
      token,
      userId,
      orgId
    );
    
    // Add execution time to response
    response.meta.execution_time_ms = Date.now() - startTime;
    
    // Send the response
    res.json(response);
    
    // Log success without exposing sensitive data
    logger.info({
      msg: 'Chat processed successfully',
      userId,
      orgId,
      duration: Date.now() - startTime
    });
  } catch (error) {
    // Log the error
    logger.error({
      msg: 'Error processing chat',
      error: error.message,
      duration: Date.now() - startTime
    });
    
    // Determine appropriate status code
    const statusCode = error.message.includes('Authentication') ? 401 : 500;
    
    // Send error response
    res.status(statusCode).json({
      success: false,
      error: {
        type: 'chat_error',
        message: error.message
      }
    });
  }
});

module.exports = router; 