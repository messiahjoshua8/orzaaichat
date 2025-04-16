const { supabase } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { ValidationError } = require('../middleware/errorHandler');

/**
 * Map of intents to table names
 */
const INTENT_TO_TABLE = {
  search_candidates: 'candidates',
  search_jobs: 'job_postings',
  get_candidate_details: 'candidates',
  get_job_details: 'job_postings',
  count_candidates: 'candidates',
  count_jobs: 'job_postings',
  search_applications: 'applications',
  search_activities: 'activities',
  search_attachments: 'attachments',
  search_departments: 'departments',
  search_eeocs: 'eeocs',
  search_integrations: 'integrations',
  search_job_interview_stages: 'job_interview_stages',
  search_offers: 'offers',
  search_offices: 'offices',
  search_query_failures: 'query_failures',
  search_reject_reasons: 'reject_reasons',
  search_scheduled_interviews: 'scheduled_interviews',
  search_scorecards: 'scorecards',
  search_tags: 'tags',
  count_applications: 'applications',
  count_activities: 'activities',
  count_attachments: 'attachments',
  count_departments: 'departments',
  count_eeocs: 'eeocs',
  count_integrations: 'integrations',
  count_job_interview_stages: 'job_interview_stages',
  count_offers: 'offers',
  count_offices: 'offices',
  count_query_failures: 'query_failures',
  count_reject_reasons: 'reject_reasons',
  count_scheduled_interviews: 'scheduled_interviews',
  count_scorecards: 'scorecards',
  count_tags: 'tags',
  get_application_details: 'applications',
  get_activity_details: 'activities',
  get_attachment_details: 'attachments',
  get_department_details: 'departments',
  get_eeoc_details: 'eeocs',
  get_integration_details: 'integrations',
  get_job_interview_stage_details: 'job_interview_stages',
  get_offer_details: 'offers',
  get_office_details: 'offices',
  get_query_failure_details: 'query_failures',
  get_reject_reason_details: 'reject_reasons',
  get_scheduled_interview_details: 'scheduled_interviews',
  get_scorecard_details: 'scorecards',
  get_tag_details: 'tags',
};

/**
 * Map of intents to query types
 */
const INTENT_TO_QUERY_TYPE = {
  // Search intents
  search_candidates: 'select',
  search_jobs: 'select',
  search_applications: 'select',
  search_activities: 'select',
  search_attachments: 'select',
  search_departments: 'select',
  search_eeocs: 'select',
  search_integrations: 'select',
  search_job_interview_stages: 'select',
  search_offers: 'select',
  search_offices: 'select',
  search_query_failures: 'select',
  search_reject_reasons: 'select',
  search_scheduled_interviews: 'select',
  search_scorecards: 'select',
  search_tags: 'select',
  
  // Get single record details
  get_candidate_details: 'select_single',
  get_job_details: 'select_single',
  get_application_details: 'select_single',
  get_activity_details: 'select_single',
  get_attachment_details: 'select_single',
  get_department_details: 'select_single',
  get_eeoc_details: 'select_single',
  get_integration_details: 'select_single',
  get_job_interview_stage_details: 'select_single',
  get_offer_details: 'select_single',
  get_office_details: 'select_single',
  get_query_failure_details: 'select_single',
  get_reject_reason_details: 'select_single',
  get_scheduled_interview_details: 'select_single',
  get_scorecard_details: 'select_single',
  get_tag_details: 'select_single',
  
  // Count intents
  count_candidates: 'count',
  count_jobs: 'count',
  count_applications: 'count',
  count_activities: 'count',
  count_attachments: 'count',
  count_departments: 'count',
  count_eeocs: 'count',
  count_integrations: 'count',
  count_job_interview_stages: 'count',
  count_offers: 'count',
  count_offices: 'count',
  count_query_failures: 'count',
  count_reject_reasons: 'count',
  count_scheduled_interviews: 'count',
  count_scorecards: 'count',
  count_tags: 'count',
};

/**
 * Allowed operators and their Supabase equivalents
 */
const ALLOWED_OPERATORS = {
  eq: 'eq',
  neq: 'neq',
  gt: 'gt',
  gte: 'gte',
  lt: 'lt',
  lte: 'lte',
  contains: 'ilike',
  starts_with: 'ilike',
  ends_with: 'ilike',
  in: 'in',
  not_in: 'not.in',
};

/**
 * Build and execute a Supabase query based on the extracted intent
 * @param {Object} intent - The extracted intent object
 * @returns {Object} Query result and metadata
 */
const buildAndExecuteQuery = async (intent) => {
  // Validate the intent
  if (!intent || !intent.intent || !INTENT_TO_TABLE[intent.intent]) {
    throw new ValidationError(`Invalid or unsupported intent: ${intent?.intent}`);
  }

  const table = INTENT_TO_TABLE[intent.intent];
  const queryType = INTENT_TO_QUERY_TYPE[intent.intent];
  const parameters = intent.parameters || {};
  
  try {
    // Start building the query
    let query = supabase.from(table);
    let count = null;
    
    // Apply query type
    if (queryType === 'count') {
      // For count queries, we'll create a properly initialized query
      // Create a base select query to work with
      query = query.select('id');
      
      // Apply filters
      if (parameters.filters && Array.isArray(parameters.filters)) {
        for (const filter of parameters.filters) {
          if (!filter.field || !filter.operator || filter.value === undefined) {
            logger.warn({
              msg: 'Skipping invalid filter',
              filter,
            });
            continue;
          }
          
          // Check if operator is allowed
          if (!ALLOWED_OPERATORS[filter.operator]) {
            logger.warn({
              msg: 'Skipping filter with unsupported operator',
              operator: filter.operator,
            });
            continue;
          }
          
          const operator = ALLOWED_OPERATORS[filter.operator];
          
          // Special handling for pattern matching operators
          if (filter.operator === 'contains') {
            // Special handling for tags_json in candidates table
            if (table === 'candidates' && filter.field === 'tags_json') {
              // Use proper JSONB containment for arrays
              query = query.filter('tags_json', 'cs', `["${filter.value}"]`);
            } else {
              query = query.ilike(filter.field, `%${filter.value}%`);
            }
          } else if (filter.operator === 'starts_with') {
            query = query.ilike(filter.field, `${filter.value}%`);
          } else if (filter.operator === 'ends_with') {
            query = query.ilike(filter.field, `%${filter.value}`);
          } else {
            // Fix for query.filter is not a function error
            // Use the proper Supabase operator methods instead of filter
            if (operator === 'eq') {
              // Special handling for timestamp fields
              if (filter.value === null && typeof filter.field === 'string' &&
                  (filter.field.includes('_at') || filter.field.includes('_date'))) {
                query = query.is(filter.field, null);
              } else {
                query = query.eq(filter.field, filter.value);
              }
            } else if (operator === 'neq') {
              // Special handling for timestamp fields
              if (filter.value === null && typeof filter.field === 'string' &&
                  (filter.field.includes('_at') || filter.field.includes('_date'))) {
                // Fix for "failed to parse filter (not.sent_at.null)"
                query = query.not(filter.field, 'is', null);
              } else {
                query = query.neq(filter.field, filter.value);
              }
            } else if (operator === 'gt') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.gt(filter.field, filter.value);
              }
            } else if (operator === 'gte') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.gte(filter.field, filter.value);
              }
            } else if (operator === 'lt') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.lt(filter.field, filter.value);
              }
            } else if (operator === 'lte') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.lte(filter.field, filter.value);
              }
            } else if (operator === 'in') {
              query = query.in(filter.field, filter.value);
            } else if (operator === 'not.in') {
              query = query.not('in', filter.field, filter.value);
            } else {
              logger.warn({
                msg: 'Unsupported operator in count query',
                operator,
              });
            }
          }
        }
      }
      
      // Execute the query and count the results ourselves
      const startTime = Date.now();
      const { data, error } = await query;
      const queryTime = Date.now() - startTime;
      
      if (error) {
        logger.error({
          msg: 'Database query error during count',
          error: error.message,
        });
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      count = data ? data.length : 0;
      
      // Log the successful query
      logger.info({
        msg: 'Count query executed successfully',
        table,
        queryType,
        count,
        queryTime,
      });
      
      return {
        data: { count },
        metadata: {
          query_type: 'count',
          table,
          execution_time_ms: queryTime,
        }
      };
    } else {
      // Select specific fields or all fields
      query = parameters.fields && parameters.fields.length > 0
        ? query.select(parameters.fields.join(','))
        : query.select('*');
      
      // For single record queries, add limit 1
      if (queryType === 'select_single') {
        query = query.limit(1);
      }
      
      // Apply filters
      if (parameters.filters && Array.isArray(parameters.filters)) {
        for (const filter of parameters.filters) {
          if (!filter.field || !filter.operator || filter.value === undefined) {
            logger.warn({
              msg: 'Skipping invalid filter',
              filter,
            });
            continue;
          }
          
          // Check if operator is allowed
          if (!ALLOWED_OPERATORS[filter.operator]) {
            logger.warn({
              msg: 'Skipping filter with unsupported operator',
              operator: filter.operator,
            });
            continue;
          }
          
          const operator = ALLOWED_OPERATORS[filter.operator];
          
          // Special handling for pattern matching operators
          if (filter.operator === 'contains') {
            // Special handling for tags_json in candidates table
            if (table === 'candidates' && filter.field === 'tags_json') {
              // Use proper JSONB containment for arrays
              query = query.filter('tags_json', 'cs', `["${filter.value}"]`);
            } else {
              query = query.ilike(filter.field, `%${filter.value}%`);
            }
          } else if (filter.operator === 'starts_with') {
            query = query.ilike(filter.field, `${filter.value}%`);
          } else if (filter.operator === 'ends_with') {
            query = query.ilike(filter.field, `%${filter.value}`);
          } else {
            // Use the proper Supabase operator methods instead of filter
            if (operator === 'eq') {
              // Special handling for timestamp fields
              if (filter.value === null && typeof filter.field === 'string' &&
                  (filter.field.includes('_at') || filter.field.includes('_date'))) {
                query = query.is(filter.field, null);
              } else {
                query = query.eq(filter.field, filter.value);
              }
            } else if (operator === 'neq') {
              // Special handling for timestamp fields
              if (filter.value === null && typeof filter.field === 'string' &&
                  (filter.field.includes('_at') || filter.field.includes('_date'))) {
                // Fix for "failed to parse filter (not.sent_at.null)"
                query = query.not(filter.field, 'is', null);
              } else {
                query = query.neq(filter.field, filter.value);
              }
            } else if (operator === 'gt') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.gt(filter.field, filter.value);
              }
            } else if (operator === 'gte') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.gte(filter.field, filter.value);
              }
            } else if (operator === 'lt') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.lt(filter.field, filter.value);
              }
            } else if (operator === 'lte') {
              // Skip null values for gt/lt operations on timestamps
              if (filter.value !== null || !typeof filter.field === 'string' ||
                  (!filter.field.includes('_at') && !filter.field.includes('_date'))) {
                query = query.lte(filter.field, filter.value);
              }
            } else if (operator === 'in') {
              query = query.in(filter.field, filter.value);
            } else if (operator === 'not.in') {
              query = query.not('in', filter.field, filter.value);
            } else {
              logger.warn({
                msg: 'Unsupported operator in query',
                operator,
              });
            }
          }
        }
      }
      
      // Apply pagination for select queries
      if (queryType === 'select') {
        const limit = parameters.limit && !isNaN(parameters.limit) ? 
          Math.min(Math.max(1, parameters.limit), 100) : 10;
        
        const offset = parameters.offset && !isNaN(parameters.offset) ? 
          Math.max(0, parameters.offset) : 0;
        
        query = query.range(offset, offset + limit - 1);
      }
      
      // Apply sorting
      if (parameters.sort && parameters.sort.field) {
        const direction = parameters.sort.direction === 'desc' ? 'desc' : 'asc';
        query = query.order(parameters.sort.field, { ascending: direction === 'asc' });
      }
      
      // Get query string representation (for logging)
      const queryString = query.toString();
      
      // Execute the query
      const startTime = Date.now();
      const { data, error } = await query;
      const queryTime = Date.now() - startTime;
      
      if (error) {
        logger.error({
          msg: 'Database query error',
          error: error.message,
          queryString,
        });
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      // Log the successful query
      logger.info({
        msg: 'Query executed successfully',
        table,
        queryType,
        filtersCount: parameters.filters?.length || 0,
        resultCount: Array.isArray(data) ? data.length : (data ? 1 : 0),
        queryTime,
        queryString,
      });
      
      return {
        data,
        metadata: {
          query_type: queryType,
          table,
          execution_time_ms: queryTime,
        }
      };
    }
  } catch (error) {
    logger.error({
      msg: 'Error building or executing query',
      intent,
      error: error.message,
      stack: error.stack,
    });
    
    throw new Error(`Error executing query: ${error.message}`);
  }
};

module.exports = {
  buildAndExecuteQuery,
}; 