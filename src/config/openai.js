const OpenAI = require('openai');
const { logger } = require('../utils/logger');

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  logger.error('Missing required OpenAI configuration. Set OPENAI_API_KEY in .env file.');
  process.exit(1);
}

// Use the specified model or default to gpt-4o
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// Create an OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Initialize and verify OpenAI connection
 * @returns {Promise<boolean>} Connection status
 */
const initOpenAI = async () => {
  try {
    // Simple availability check
    const response = await openai.models.list();
    
    // Verify that the specified model is available
    const modelExists = response.data.some(model => model.id === OPENAI_MODEL);
    
    if (!modelExists) {
      logger.warn(`The specified model ${OPENAI_MODEL} is not available. Available models: ${response.data.map(m => m.id).join(', ')}`);
      return false;
    }
    
    logger.info(`Successfully connected to OpenAI API. Using model: ${OPENAI_MODEL}`);
    return true;
  } catch (err) {
    logger.error('OpenAI connection error:', err);
    return false;
  }
};

module.exports = {
  openai,
  OPENAI_MODEL,
  initOpenAI,
}; 