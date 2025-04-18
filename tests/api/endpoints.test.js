const request = require('supertest');
const app = require('../../server');
const { 
  setupTestEnvironment, 
  cleanupTestEnvironment 
} = require('../../src/config/test-config');
const { 
  createTestDatabase, 
  cleanupTestDatabase 
} = require('../../src/utils/testUtils');

describe('API Endpoints', () => {
  let db;
  let testConnectionId;
  let testQueryId;
  
  beforeAll(async () => {
    // Setup test environment
    setupTestEnvironment();
    
    // Create test database
    db = await createTestDatabase();
  });
  
  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase(db);
    
    // Cleanup test environment
    cleanupTestEnvironment();
  });
  
  describe('Connection Endpoints', () => {
    test('GET /api/connections should return all connections', async () => {
      const response = await request(app)
        .get('/api/connections')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data.connections');
      expect(Array.isArray(response.body.data.connections)).toBe(true);
    });
    
    test('POST /api/connections should create a new connection', async () => {
      const newConnection = {
        name: 'Test API Connection',
        type: 'sqlite',
        connection: 'path/to/api/test.db'
      };
      
      const response = await request(app)
        .post('/api/connections')
        .send(newConnection)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data.connection');
      expect(response.body.data.connection).toHaveProperty('id');
      expect(response.body.data.connection).toHaveProperty('name', 'Test API Connection');
      
      // Save the connection ID for later tests
      testConnectionId = response.body.data.connection.id;
    });
    
    test('GET /api/connections/:id should return a specific connection', async () => {
      const response = await request(app)
        .get(`/api/connections/${testConnectionId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data.connection');
      expect(response.body.data.connection).toHaveProperty('id', testConnectionId);
    });
    
    test('DELETE /api/connections/:id should delete a connection', async () => {
      const response = await request(app)
        .delete(`/api/connections/${testConnectionId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      
      // Verify the connection was deleted
      const getResponse = await request(app)
        .get(`/api/connections/${testConnectionId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(getResponse.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('Query Endpoints', () => {
    test('GET /api/saved-queries should return all saved queries', async () => {
      const response = await request(app)
        .get('/api/saved-queries')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data.queries');
      expect(Array.isArray(response.body.data.queries)).toBe(true);
    });
    
    test('POST /api/saved-queries should create a new saved query', async () => {
      const newQuery = {
        name: 'Test API Query',
        query: 'Show me all users from API test'
      };
      
      const response = await request(app)
        .post('/api/saved-queries')
        .send(newQuery)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data.query');
      expect(response.body.data.query).toHaveProperty('id');
      expect(response.body.data.query).toHaveProperty('name', 'Test API Query');
      
      // Save the query ID for later tests
      testQueryId = response.body.data.query.id;
    });
    
    test('GET /api/saved-queries/:id should return a specific saved query', async () => {
      const response = await request(app)
        .get(`/api/saved-queries/${testQueryId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data.query');
      expect(response.body.data.query).toHaveProperty('id', testQueryId);
    });
    
    test('DELETE /api/saved-queries/:id should delete a saved query', async () => {
      const response = await request(app)
        .delete(`/api/saved-queries/${testQueryId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message');
      
      // Verify the query was deleted
      const getResponse = await request(app)
        .get(`/api/saved-queries/${testQueryId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(getResponse.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('Query Processing Endpoint', () => {
    test('POST /api/query should process a natural language query', async () => {
      // This test uses mock mode, so it will return a mock SQL query
      const queryRequest = {
        userQuery: 'Show me all users older than 30',
        connection: {
          type: 'sqlite',
          connection: 'test.db'
        }
      };
      
      const response = await request(app)
        .post('/api/query')
        .send(queryRequest)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data.sqlQuery');
      expect(response.body).toHaveProperty('data.results');
      expect(response.body).toHaveProperty('data.databaseType', 'sqlite');
    });
    
    test('POST /api/query should return validation error for invalid query', async () => {
      const queryRequest = {
        userQuery: '', // Empty query
        connection: {
          type: 'sqlite',
          connection: 'test.db'
        }
      };
      
      const response = await request(app)
        .post('/api/query')
        .send(queryRequest)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });
  });
});
