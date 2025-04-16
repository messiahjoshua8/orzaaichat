const { supabase } = require('../config/supabase');
const { logger } = require('../utils/logger');
const { ValidationError } = require('../middleware/errorHandler');

// Cache for table schemas
const schemaCache = {};

/**
 * Get schema information for a table
 * @param {string} table - The table name
 * @returns {Object} Table schema information
 */
const getTableSchema = async (table) => {
  // Return cached schema if available
  if (schemaCache[table]) {
    return schemaCache[table];
  }
  
  try {
    // Query the database to get table schema information
    const { data, error } = await supabase.rpc('get_table_definition', { table_name: table });
    
    if (error) {
      logger.error({
        msg: 'Error fetching table schema',
        table,
        error: error.message,
      });
      throw new Error(`Failed to fetch schema for table ${table}: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      logger.error({
        msg: 'Table not found or no column information',
        table,
      });
      throw new Error(`Table ${table} not found or has no columns`);
    }
    
    // Process the schema information
    const schema = {
      columns: {},
      primary_keys: [],
    };
    
    data.forEach(column => {
      schema.columns[column.column_name] = {
        type: column.data_type,
        nullable: column.is_nullable === 'YES',
        is_primary: column.is_primary === 'YES',
      };
      
      if (column.is_primary === 'YES') {
        schema.primary_keys.push(column.column_name);
      }
    });
    
    // Cache the schema
    schemaCache[table] = schema;
    
    return schema;
  } catch (error) {
    // Provide a fallback schema based on the actual database structure
    logger.warn({
      msg: 'Using fallback schema definition',
      table,
      reason: error.message,
    });
    
    // Basic schemas for the main tables based on actual DB structure
    const fallbackSchemas = {
      candidates: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          first_name: { type: 'text', nullable: true, is_primary: false },
          last_name: { type: 'text', nullable: true, is_primary: false },
          email: { type: 'text', nullable: true, is_primary: false },
          phone: { type: 'text', nullable: true, is_primary: false },
          location: { type: 'text', nullable: true, is_primary: false },
          company: { type: 'text', nullable: true, is_primary: false },
          title: { type: 'text', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          tags_json: { type: 'jsonb', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      job_postings: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          remote_id: { type: 'text', nullable: false, is_primary: false },
          name: { type: 'text', nullable: true, is_primary: false },
          description: { type: 'text', nullable: true, is_primary: false },
          status: { type: 'text', nullable: true, is_primary: false },
          job_type: { type: 'text', nullable: true, is_primary: false },
          remote: { type: 'boolean', nullable: true, is_primary: false },
          location: { type: 'text', nullable: true, is_primary: false },
          department: { type: 'text', nullable: true, is_primary: false },
          salary_min: { type: 'numeric', nullable: true, is_primary: false },
          salary_max: { type: 'numeric', nullable: true, is_primary: false },
          salary_currency: { type: 'text', nullable: true, is_primary: false },
          url: { type: 'text', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: false, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      applications: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          remote_id: { type: 'text', nullable: true, is_primary: false },
          candidate_id: { type: 'text', nullable: true, is_primary: false },
          job_id: { type: 'text', nullable: true, is_primary: false },
          status: { type: 'text', nullable: true, is_primary: false },
          stage: { type: 'text', nullable: true, is_primary: false },
          rejection_reason: { type: 'text', nullable: true, is_primary: false },
          applied_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          rejected_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          source: { type: 'text', nullable: true, is_primary: false },
          current_salary: { type: 'numeric', nullable: true, is_primary: false },
          desired_salary: { type: 'numeric', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: false, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      activities: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          activity_type: { type: 'text', nullable: true, is_primary: false },
          subject: { type: 'text', nullable: true, is_primary: false },
          body: { type: 'text', nullable: true, is_primary: false },
          candidate_merge_id: { type: 'text', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      attachments: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          attachment_type: { type: 'text', nullable: true, is_primary: false },
          file_url: { type: 'text', nullable: true, is_primary: false },
          file_name: { type: 'text', nullable: true, is_primary: false },
          candidate_merge_id: { type: 'text', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      departments: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          name: { type: 'text', nullable: true, is_primary: false },
          parent_department_merge_id: { type: 'text', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      eeocs: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          candidate_merge_id: { type: 'text', nullable: true, is_primary: false },
          gender: { type: 'text', nullable: true, is_primary: false },
          race: { type: 'text', nullable: true, is_primary: false },
          disability_status: { type: 'text', nullable: true, is_primary: false },
          veteran_status: { type: 'text', nullable: true, is_primary: false },
          submitted_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      integrations: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          user_id: { type: 'uuid', nullable: true, is_primary: false },
          integration_type: { type: 'text', nullable: true, is_primary: false },
          status: { type: 'text', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      job_interview_stages: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          remote_id: { type: 'text', nullable: true, is_primary: false },
          name: { type: 'text', nullable: true, is_primary: false },
          stage_order: { type: 'integer', nullable: true, is_primary: false },
          job_id: { type: 'text', nullable: true, is_primary: false },
          interview_type: { type: 'text', nullable: true, is_primary: false },
          interview_format: { type: 'text', nullable: true, is_primary: false },
          status: { type: 'text', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      offers: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          remote_id: { type: 'text', nullable: true, is_primary: false },
          application_merge_id: { type: 'text', nullable: true, is_primary: false },
          status: { type: 'text', nullable: true, is_primary: false },
          start_date: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          offer_details: { type: 'jsonb', nullable: true, is_primary: false },
          sent_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          closed_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      offices: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          name: { type: 'text', nullable: true, is_primary: false },
          location: { type: 'text', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      query_failures: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          query: { type: 'text', nullable: true, is_primary: false },
          error: { type: 'text', nullable: true, is_primary: false },
          user_message: { type: 'text', nullable: true, is_primary: false },
          resolved: { type: 'boolean', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      reject_reasons: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          name: { type: 'text', nullable: true, is_primary: false },
          remote_id: { type: 'text', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      scheduled_interviews: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          remote_id: { type: 'text', nullable: true, is_primary: false },
          application_merge_id: { type: 'text', nullable: true, is_primary: false },
          job_interview_stage_merge_id: { type: 'text', nullable: true, is_primary: false },
          organizer_merge_id: { type: 'text', nullable: true, is_primary: false },
          interviewers_merge_ids: { type: 'jsonb', nullable: true, is_primary: false },
          start_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          end_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          location: { type: 'text', nullable: true, is_primary: false },
          status: { type: 'text', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      scorecards: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          remote_id: { type: 'text', nullable: true, is_primary: false },
          application_merge_id: { type: 'text', nullable: true, is_primary: false },
          interview_step_merge_id: { type: 'text', nullable: true, is_primary: false },
          interviewer_merge_id: { type: 'text', nullable: true, is_primary: false },
          submitted_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          overall_recommendation: { type: 'text', nullable: true, is_primary: false },
          sections: { type: 'jsonb', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
      tags: {
        columns: {
          id: { type: 'uuid', nullable: false, is_primary: true },
          merge_id: { type: 'text', nullable: false, is_primary: false },
          name: { type: 'text', nullable: true, is_primary: false },
          organization_id: { type: 'uuid', nullable: true, is_primary: false },
          created_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
          updated_at: { type: 'timestamp with time zone', nullable: true, is_primary: false },
        },
        primary_keys: ['id'],
      },
    };
    
    return fallbackSchemas[table] || null;
  }
};

/**
 * Validate if a field exists in the table schema
 * @param {string} table - The table name
 * @param {string} field - The field name to validate
 * @returns {boolean} Whether the field exists
 */
const validateField = async (table, field) => {
  const schema = await getTableSchema(table);
  
  if (!schema) {
    throw new ValidationError(`Schema not found for table ${table}`);
  }
  
  return !!schema.columns[field];
};

/**
 * Validate if a value is compatible with the field type
 * @param {string} table - The table name
 * @param {string} field - The field name
 * @param {any} value - The value to validate
 * @param {string} operator - The operator being used
 * @returns {boolean} Whether the value is valid for the field
 */
const validateValue = async (table, field, value, operator) => {
  const schema = await getTableSchema(table);
  
  if (!schema || !schema.columns[field]) {
    return false;
  }
  
  const column = schema.columns[field];
  
  // Handle null values
  if (value === null) {
    return column.nullable;
  }
  
  // Type validation based on PostgreSQL types
  switch (column.type) {
    case 'uuid':
      // UUID format validation
      return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    
    case 'integer':
    case 'bigint':
    case 'smallint':
      return Number.isInteger(Number(value));
    
    case 'numeric':
    case 'decimal':
    case 'real':
    case 'double precision':
      return !isNaN(Number(value));
    
    case 'boolean':
      return typeof value === 'boolean' || value === 'true' || value === 'false';
    
    case 'date':
    case 'timestamp':
    case 'timestamp with time zone':
      return !isNaN(Date.parse(value));
    
    case 'text':
    case 'varchar':
    case 'char':
      return typeof value === 'string';
    
    case 'jsonb':
    case 'json':
      return true; // Assuming JSON validation is handled elsewhere
    
    default:
      // For unknown types, be permissive
      return true;
  }
};

/**
 * Validate an intent object against the database schema
 * @param {Object} intent - The intent object to validate
 * @returns {Object} Validation result
 */
const validateIntent = async (intent) => {
  if (!intent || !intent.intent) {
    return {
      valid: false,
      errors: ['Intent is required'],
    };
  }
  
  // Map of intents to tables
  const intentToTable = {
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
    unknown: null,
  };
  
  const table = intentToTable[intent.intent];
  
  if (!table) {
    return {
      valid: false,
      errors: [`Unsupported intent: ${intent.intent}`],
    };
  }
  
  const parameters = intent.parameters || {};
  const errors = [];
  
  try {
    // Get table schema
    const schema = await getTableSchema(table);
    
    if (!schema) {
      return {
        valid: false,
        errors: [`Schema not found for table ${table}`],
      };
    }
    
    // Validate filters
    if (parameters.filters && Array.isArray(parameters.filters)) {
      for (let i = 0; i < parameters.filters.length; i++) {
        const filter = parameters.filters[i];
        
        // Check if filter has all required properties
        if (!filter.field || !filter.operator) {
          errors.push(`Filter at index ${i} is missing required properties`);
          continue;
        }
        
        // Check if field exists in schema
        if (!schema.columns[filter.field]) {
          errors.push(`Field '${filter.field}' in filter at index ${i} does not exist in table ${table}`);
          continue;
        }
        
        // Validate operator
        const validOperators = [
          'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 
          'contains', 'starts_with', 'ends_with', 
          'in', 'not_in'
        ];
        
        if (!validOperators.includes(filter.operator)) {
          errors.push(`Operator '${filter.operator}' in filter at index ${i} is not supported`);
          continue;
        }
        
        // Skip value validation for operators that might not have a value
        if (filter.value === undefined) {
          continue;
        }
        
        // Validate value
        const isValueValid = await validateValue(table, filter.field, filter.value, filter.operator);
        if (!isValueValid) {
          errors.push(`Value for field '${filter.field}' in filter at index ${i} is not valid for type ${schema.columns[filter.field].type}`);
        }
      }
    }
    
    // Validate sort
    if (parameters.sort && parameters.sort.field) {
      if (!schema.columns[parameters.sort.field]) {
        errors.push(`Sort field '${parameters.sort.field}' does not exist in table ${table}`);
      }
      
      if (parameters.sort.direction && !['asc', 'desc'].includes(parameters.sort.direction)) {
        errors.push(`Sort direction '${parameters.sort.direction}' is not valid. Use 'asc' or 'desc'`);
      }
    }
    
    // Validate fields
    if (parameters.fields && Array.isArray(parameters.fields)) {
      for (const field of parameters.fields) {
        if (!schema.columns[field]) {
          errors.push(`Field '${field}' does not exist in table ${table}`);
        }
      }
    }
    
    // Validate limit and offset
    if (parameters.limit !== undefined && (isNaN(parameters.limit) || parameters.limit < 0)) {
      errors.push(`Limit must be a non-negative number`);
    }
    
    if (parameters.offset !== undefined && (isNaN(parameters.offset) || parameters.offset < 0)) {
      errors.push(`Offset must be a non-negative number`);
    }
    
    // Return validation result
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : null,
      schema,
    };
  } catch (error) {
    logger.error({
      msg: 'Error validating intent',
      intent,
      error: error.message,
      stack: error.stack,
    });
    
    return {
      valid: false,
      errors: [`Validation error: ${error.message}`],
    };
  }
};

module.exports = {
  validateIntent,
  getTableSchema,
}; 