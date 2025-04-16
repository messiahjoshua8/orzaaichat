#!/bin/bash

# This script tests the AI recruiting assistant API with actual database schema queries

echo -e "\n\033[1;36m=== Testing candidate search query ===\033[0m"
curl -s -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Find candidates who work at Google"}' | jq

sleep 2

echo -e "\n\033[1;36m=== Testing job search query ===\033[0m"
curl -s -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me all remote job postings"}' | jq

sleep 2

echo -e "\n\033[1;36m=== Testing application query ===\033[0m"
curl -s -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "List all applications in the interview stage"}' | jq

sleep 2

echo -e "\n\033[1;36m=== Testing candidate count query ===\033[0m"
curl -s -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "How many candidates do we have in total?"}' | jq

sleep 2

echo -e "\n\033[1;36m=== Testing candidate details query ===\033[0m"
curl -s -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Get details for the candidate with email john@example.com"}' | jq 