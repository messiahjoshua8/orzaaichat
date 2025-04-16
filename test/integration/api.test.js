const request = require('supertest');
// Using Jest's built-in assertions instead of Chai
const app = require('../../src/index');

describe('API Integration Tests', () => {
  describe('POST /api/query', () => {
    it('should successfully process a search_candidates request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Find candidates who applied in the last 3 months'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_candidates');
    });

    it('should successfully process a count_candidates request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many candidates do we have?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_candidates');
    });

    it('should successfully process a search_jobs request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Show me open software engineering positions'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_jobs');
    });

    it('should successfully process a count_jobs request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many job postings do we have that are remote?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_jobs');
    });

    it('should successfully process a get_candidate_details request', async () => {
      // This assumes you have a candidate with the specified merge_id in your test database
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Tell me about the candidate with merge_id CAN-12345'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('get_candidate_details');
    });

    it('should successfully process a get_job_details request', async () => {
      // This assumes you have a job posting with the specified name in your test database
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Tell me about the Software Engineer job posting'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('get_job_details');
    });

    it('should successfully process a search_applications request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Show me applications that were rejected last month'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_applications');
    });

    it('should successfully process a count_applications request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many applications do we have in total?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_applications');
    });

    // Tests for new tables
    it('should successfully process a search_activities request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Show me recent candidate activities'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_activities');
    });

    it('should successfully process a count_activities request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many activities are recorded in the system?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_activities');
    });

    it('should successfully process a search_attachments request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Find all resume attachments'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_attachments');
    });

    it('should successfully process a count_attachments request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many attachments do we have?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_attachments');
    });

    it('should successfully process a search_departments request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'List all engineering departments'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_departments');
    });

    it('should successfully process a count_departments request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many departments do we have?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_departments');
    });

    it('should successfully process a search_scheduled_interviews request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Show me interviews scheduled for next week'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_scheduled_interviews');
    });

    it('should successfully process a count_scheduled_interviews request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many interviews are scheduled?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_scheduled_interviews');
    });

    it('should successfully process a search_offers request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Show me all offers sent this month'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_offers');
    });

    it('should successfully process a count_offers request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many offers have we sent out this month?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_offers');
    });

    it('should successfully process a search_scorecards request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Find all interview scorecards with positive recommendations'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('search_scorecards');
    });

    it('should successfully process a count_scorecards request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'How many scorecards do we have?'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('count');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('count_scorecards');
    });

    it('should successfully process a get_scorecard_details request', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'Tell me about the scorecard with merge_id SC-12345'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('intent');
      expect(response.body.meta.intent).toBe('get_scorecard_details');
    });

    it('should handle invalid queries gracefully', async () => {
      const response = await request(app)
        .post('/api/query')
        .send({
          query: 'This is a completely irrelevant query that should not match any intent'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 