/**
 * Integration test for the refresh query functionality
 */
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = require('../../server');
const userDataService = require('../../src/services/userDataService');
const { ApiError } = require('../../src/utils/errors');

// Path to test database
const testDbPath = path.join(__dirname, '../../data/test-user-data.db');

describe('Refresh Query API', () => {
  let testConnectionId;
  let testQueryId;
  let originalResults;

  // Setup test database and create test data
  beforeAll(async () => {
    // Ensure test directory exists
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Delete test database if it exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    // Initialize user data service with test database
    await userDataService.init(testDbPath);

    // Create a test SQLite connection
    const testDbFile = path.join(__dirname, '../fixtures/test.db');
    testConnectionId = uuidv4();
    await userDataService.saveConnection({
      id: testConnectionId,
      name: 'Test SQLite DB',
      type: 'sqlite',
      connection: JSON.stringify(testDbFile)
    });

    // Create a test query with results
    originalResults = [
      { id: 1, name: 'Test 1', value: 100 },
      { id: 2, name: 'Test 2', value: 200 }
    ];

    testQueryId = uuidv4();
    await userDataService.saveQuery({
      id: testQueryId,
      name: 'Test Query',
      query: 'Show me all test data',
      connection_id: testConnectionId,
      sql_query: 'SELECT * FROM test_table',
      results: JSON.stringify(originalResults),
      chart_type: 'bar',
      visualization_config: JSON.stringify({
        xAxis: 'name',
        yAxis: 'value'
      }),
      description: 'Test query for refresh functionality'
    });
  });

  // Clean up after tests
  afterAll(async () => {
    // Close the database connection
    if (userDataService.db) {
      await new Promise((resolve) => userDataService.db.close(resolve));
    }

    // Delete test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('should return 404 for non-existent query', async () => {
    const response = await request(app)
      .post('/api/saved-queries/non-existent-id/refresh')
      .expect(404);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('not found');
  });

  test('should return 400 if query has no SQL statement', async () => {
    // Create a query without SQL statement
    const queryWithoutSql = uuidv4();
    await userDataService.saveQuery({
      id: queryWithoutSql,
      name: 'Query Without SQL',
      query: 'This query has no SQL',
      connection_id: testConnectionId
    });

    const response = await request(app)
      .post(`/api/saved-queries/${queryWithoutSql}/refresh`)
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('does not have a SQL statement');
  });

  test('should return 400 if query has no connection', async () => {
    // Create a query without connection
    const queryWithoutConnection = uuidv4();
    await userDataService.saveQuery({
      id: queryWithoutConnection,
      name: 'Query Without Connection',
      query: 'This query has no connection',
      sql_query: 'SELECT * FROM test_table'
    });

    const response = await request(app)
      .post(`/api/saved-queries/${queryWithoutConnection}/refresh`)
      .expect(400);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('not associated with a database connection');
  });

  test('should return 404 if connection does not exist', async () => {
    // Create a query with non-existent connection
    const queryWithBadConnection = uuidv4();
    await userDataService.saveQuery({
      id: queryWithBadConnection,
      name: 'Query With Bad Connection',
      query: 'This query has a bad connection',
      connection_id: 'non-existent-connection',
      sql_query: 'SELECT * FROM test_table'
    });

    const response = await request(app)
      .post(`/api/saved-queries/${queryWithBadConnection}/refresh`)
      .expect(404);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toContain('connection was not found');
  });

  // This test is commented out because it requires a real database connection
  // Uncomment and modify it if you have a test database set up
  /*
  test('should successfully refresh a query', async () => {
    const response = await request(app)
      .post(`/api/saved-queries/${testQueryId}/refresh`)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.query).toBeDefined();
    expect(response.body.data.results).toBeDefined();
    expect(response.body.data.query.last_refreshed).toBeDefined();

    // Verify the results were updated
    const updatedQuery = await userDataService.getSavedQueryById(testQueryId);
    expect(updatedQuery.last_refreshed).toBeDefined();
  });
  */
});
