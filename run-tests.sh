#!/bin/bash

# Array of test queries
queries=(
  "Show me all available tables in the database"
  "What columns are available in the candidates table?"
  "Find all candidates"
  "Find candidates with JavaScript skills who have more than 5 years of experience"
  "How many candidates do we have in our database?"
  "Show me details for the candidate with email john.doe@example.com"
  "Find all job openings"
  "Show me all senior engineering jobs in San Francisco with a salary above 150k"
  "How many open job positions do we have?"
  "Find experienced front-end developers and sort by years of experience in descending order"
  "Show me only the names, emails, and skills of all candidates"
)

# Array of descriptions
descriptions=(
  "List all tables in database"
  "List table schema"
  "Search all candidates"
  "Search candidates with filters"
  "Count candidates"
  "Specific candidate lookup"
  "Search jobs"
  "Search jobs with filters"
  "Count jobs"
  "Combined query with sorting"
  "Query with specific fields"
)

# Run all the test queries
for i in "${!queries[@]}"; do
  echo -e "\n\033[1;36m=== Test $((i+1)): ${descriptions[$i]} ===\033[0m"
  echo -e "\033[1;33mQuery: ${queries[$i]}\033[0m\n"
  
  # Run the curl command and format the JSON output
  curl -s -X POST http://localhost:3000/api/query \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"${queries[$i]}\"}" | jq
  
  # Wait a moment before the next request
  sleep 1
done 