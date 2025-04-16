const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../utils/logger');

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  logger.error('Missing required Supabase configuration. Set SUPABASE_URL and SUPABASE_KEY in .env file.');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

/**
 * Initialize and verify Supabase connection
 * @returns {Promise<boolean>} Connection status
 */
const initSupabase = async () => {
  try {
    // Simple health check query
    const { data, error } = await supabase.from('_health').select('*').limit(1);
    
    if (error) {
      logger.error('Failed to connect to Supabase:', error);
      return false;
    }
    
    logger.info('Successfully connected to Supabase');
    return true;
  } catch (err) {
    logger.error('Supabase connection error:', err);
    return false;
  }
};

module.exports = {
  supabase,
  initSupabase,
}; 