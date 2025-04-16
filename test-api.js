const axios = require('axios');

// Change this to match your API URL
const API_URL = 'http://localhost:3000/api/query';
// If using a development URL, can configure it here:
// const API_URL = 'https://your-recruiting-api-dev.example.com/api/query';

// Test queries for each table
const queries = [
  // Existing tables
  { name: 'search_candidates', query: 'Find all candidates with JavaScript skills' },
  { name: 'count_candidates', query: 'How many candidates do we have?' },
  { name: 'get_candidate_details', query: 'Show me details for candidate with email john.doe@example.com' },
  { name: 'search_jobs', query: 'Show me all open engineering jobs' },
  { name: 'count_jobs', query: 'How many job openings do we have?' },
  { name: 'search_applications', query: 'Show me all applications submitted last month' },
  { name: 'count_applications', query: 'How many applications are in the system?' },
  
  // New tables
  { name: 'search_activities', query: 'Find all candidate activities from last week' },
  { name: 'count_activities', query: 'How many activities are recorded in the system?' },
  { name: 'search_attachments', query: 'Show me all resume attachments' },
  { name: 'count_attachments', query: 'How many attachments do we have?' },
  { name: 'search_departments', query: 'List all engineering departments' },
  { name: 'count_departments', query: 'How many departments do we have?' },
  { name: 'search_scheduled_interviews', query: 'Find interviews scheduled for next week' },
  { name: 'count_scheduled_interviews', query: 'How many interviews are scheduled?' },
  { name: 'search_offers', query: 'Show me all offers sent this month' },
  { name: 'count_offers', query: 'How many offers have we sent out?' },
  { name: 'search_scorecards', query: 'Find all interview scorecards with positive recommendations' },
  { name: 'count_scorecards', query: 'How many scorecards do we have?' },
  { name: 'get_scorecard_details', query: 'Show me details for the scorecard with merge_id SC-12345' }
];

// Run all the tests
async function runTests() {
  console.log('🚀 Starting API Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of queries) {
    try {
      console.log(`Testing: ${test.name} - "${test.query}"`);
      
      const response = await axios.post(API_URL, { query: test.query });
      
      // Check if the intent matches what we expect
      if (response.data.meta && response.data.meta.intent === test.name) {
        console.log(`✅ PASSED: Intent correctly identified as ${test.name}`);
        passed++;
      } else {
        console.log(`❌ FAILED: Expected intent ${test.name}, got ${response.data.meta?.intent || 'unknown'}`);
        failed++;
      }
      
      // Print a condensed version of the response
      console.log(`Response: ${JSON.stringify({
        success: response.data.success,
        intent: response.data.meta?.intent,
        dataType: response.data.data ? 
          (Array.isArray(response.data.data) ? `array[${response.data.data.length}]` : 
           typeof response.data.data === 'object' ? 'object' : typeof response.data.data) : null
      })}\n`);
      
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      if (error.response) {
        console.log(`Error response: ${JSON.stringify(error.response.data)}\n`);
      }
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
}); 