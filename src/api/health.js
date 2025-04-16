const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { openai } = require('../config/openai');

/**
 * @route GET /api/health
 * @desc Check the health status of the API and its dependencies
 * @access Public
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  const healthStatus = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      supabase: {
        status: 'unknown',
      },
      openai: {
        status: 'unknown',
      },
    },
  };

  try {
    // Check Supabase connection
    const { error: supabaseError } = await supabase.from('_health').select('*').limit(1);
    
    healthStatus.services.supabase.status = supabaseError ? 'error' : 'ok';
    if (supabaseError) {
      healthStatus.services.supabase.message = supabaseError.message;
    }
  } catch (error) {
    healthStatus.services.supabase.status = 'error';
    healthStatus.services.supabase.message = error.message;
  }

  try {
    // Check OpenAI connection (just a basic API call)
    await openai.models.list({ limit: 1 });
    healthStatus.services.openai.status = 'ok';
  } catch (error) {
    healthStatus.services.openai.status = 'error';
    healthStatus.services.openai.message = error.message;
  }

  // Set overall status based on services
  if (
    healthStatus.services.supabase.status === 'error' ||
    healthStatus.services.openai.status === 'error'
  ) {
    healthStatus.status = 'degraded';
  }

  // Add response time
  healthStatus.responseTime = `${Date.now() - startTime}ms`;

  // Return status with appropriate HTTP status code
  const httpStatus = healthStatus.status === 'ok' ? 200 : 
                    healthStatus.status === 'degraded' ? 200 : 500;
  
  return res.status(httpStatus).json(healthStatus);
});

module.exports = router; 