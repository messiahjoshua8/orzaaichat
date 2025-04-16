/**
 * This script contains test queries for the AI recruiting assistant.
 * Run them with curl or a tool like Postman to test the system.
 */

// Sample test queries to exercise different tables and columns
const testQueries = [
  // Basic table listing queries
  {
    "description": "List all tables in database",
    "query": "Show me all available tables in the database"
  },
  {
    "description": "List table schema",
    "query": "What columns are available in the candidates table?"
  },
  
  // Candidate queries
  {
    "description": "Search all candidates",
    "query": "Find all candidates" 
  },
  {
    "description": "Search candidates with filters",
    "query": "Find candidates with JavaScript skills who have more than 5 years of experience"
  },
  {
    "description": "Count candidates",
    "query": "How many candidates do we have in our database?"
  },
  {
    "description": "Specific candidate lookup",
    "query": "Show me details for the candidate with email john.doe@example.com"
  },
  
  // Job queries
  {
    "description": "Search jobs",
    "query": "Find all job openings"
  },
  {
    "description": "Search jobs with filters",
    "query": "Show me all senior engineering jobs in San Francisco with a salary above 150k"
  },
  {
    "description": "Count jobs",
    "query": "How many open job positions do we have?"
  },
  
  // Complex queries
  {
    "description": "Combined query with sorting",
    "query": "Find experienced front-end developers and sort by years of experience in descending order"
  },
  {
    "description": "Query with specific fields",
    "query": "Show me only the names, emails, and skills of all candidates"
  }
];

/**
 * Example curl command to run a query:
 * 
 * curl -X POST http://localhost:3000/api/query \
 *   -H "Content-Type: application/json" \
 *   -d '{"query": "Find all candidates with JavaScript skills"}'
 */

/**
 * Run all tests with this bash script:
 *
 * for i in {0..10}; do
 *   echo "Running test $i: ${testQueries[$i].description}"
 *   curl -X POST http://localhost:3000/api/query \
 *     -H "Content-Type: application/json" \
 *     -d "{\"query\": \"${testQueries[$i].query}\"}"
 *   echo -e "\n\n"
 *   sleep 1
 * done
 */ 