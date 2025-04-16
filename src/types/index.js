/**
 * @typedef {Object} Intent
 * @property {string} intent - The type of intent (search_candidates, search_jobs, etc.)
 * @property {IntentParameters} parameters - Parameters for the intent
 */

/**
 * @typedef {Object} IntentParameters
 * @property {Array<Filter>} [filters] - List of filters to apply
 * @property {number} [limit=10] - Maximum number of results to return
 * @property {number} [offset=0] - Offset for pagination
 * @property {Sort} [sort] - Sorting criteria
 * @property {Array<string>} [fields] - Specific fields to return
 */

/**
 * @typedef {Object} Filter
 * @property {string} field - The field to filter on
 * @property {string} operator - The operator to use (eq, neq, gt, gte, lt, lte, contains, etc.)
 * @property {*} value - The value to filter by
 */

/**
 * @typedef {Object} Sort
 * @property {string} field - The field to sort by
 * @property {string} direction - The sort direction (asc or desc)
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the intent is valid
 * @property {Array<string>} [errors] - List of validation errors
 * @property {Object} [schema] - The database schema used for validation
 */

/**
 * @typedef {Object} QueryResult
 * @property {*} data - The query results
 * @property {QueryMetadata} metadata - Metadata about the query
 */

/**
 * @typedef {Object} QueryMetadata
 * @property {string} query_type - The type of query (select, select_single, count)
 * @property {string} table - The table that was queried
 * @property {number} execution_time_ms - Query execution time in milliseconds
 * @property {string} [sql] - The SQL string representation (for logging only)
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {*} [data] - The response data (if successful)
 * @property {Object} [error] - Error information (if not successful)
 * @property {Object} meta - Metadata about the response
 */

/**
 * @typedef {Object} ProcessLoggingData
 * @property {string} userQuery - The original natural language query
 * @property {Intent} [extractedIntent] - The extracted intent
 * @property {string} [generatedSql] - The generated SQL (string representation)
 * @property {ValidationResult} [validationResult] - The validation result
 * @property {*} [dbResult] - The database query result
 * @property {ApiResponse} [response] - The API response
 * @property {Error} [error] - Any error that occurred
 * @property {number} duration - Total processing time in milliseconds
 */

module.exports = {}; 