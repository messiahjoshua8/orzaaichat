const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../../utils/logger');

/**
 * @route POST /admin/attach-org
 * @desc Attach an organization to a user by updating their app_metadata
 * @access Admin only
 */
router.post('/', async (req, res) => {
  try {
    const { userId, orgId } = req.body;
    
    // Validate required parameters
    if (!userId || !orgId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: userId and orgId are required' 
      });
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Update user's app_metadata to include org_id
    const { data: user, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { app_metadata: { org_id: orgId } }
    );

    if (error) {
      logger.error('Error updating user app_metadata:', error);
      return res.status(500).json({ error: error.message });
    }

    logger.info(`Successfully attached orgId ${orgId} to userId ${userId}`);
    return res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error('Error in attach-org endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router; 