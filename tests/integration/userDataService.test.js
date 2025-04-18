const userDataService = require('../../src/services/userDataService');
const { 
  setupTestEnvironment, 
  cleanupTestEnvironment 
} = require('../../src/config/test-config');
const { 
  createTestDatabase, 
  cleanupTestDatabase 
} = require('../../src/utils/testUtils');

describe('User Data Service', () => {
  let db;
  
  beforeAll(async () => {
    // Setup test environment
    setupTestEnvironment();
    
    // Create test database
    db = await createTestDatabase();
    
    // Initialize user data service
    await userDataService.init();
  });
  
  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase(db);
    
    // Cleanup test environment
    cleanupTestEnvironment();
  });
  
  describe('Connections', () => {
    test('should get all saved connections', async () => {
      const connections = await userDataService.getSavedConnections();
      
      expect(connections).toHaveLength(2);
      expect(connections[0]).toHaveProperty('id');
      expect(connections[0]).toHaveProperty('name');
      expect(connections[0]).toHaveProperty('type');
      expect(connections[0]).toHaveProperty('connection');
      expect(connections[0]).toHaveProperty('created_at');
    });
    
    test('should get a saved connection by ID', async () => {
      const connection = await userDataService.getSavedConnectionById('test-conn-1');
      
      expect(connection).toHaveProperty('id', 'test-conn-1');
      expect(connection).toHaveProperty('name', 'Test SQLite Connection');
      expect(connection).toHaveProperty('type', 'sqlite');
      expect(connection).toHaveProperty('connection');
    });
    
    test('should save a new connection', async () => {
      const newConnection = {
        name: 'New Test Connection',
        type: 'sqlite',
        connection: 'path/to/new/database.db'
      };
      
      const savedConnection = await userDataService.saveConnection(newConnection);
      
      expect(savedConnection).toHaveProperty('id');
      expect(savedConnection).toHaveProperty('name', 'New Test Connection');
      expect(savedConnection).toHaveProperty('type', 'sqlite');
      expect(savedConnection).toHaveProperty('connection', 'path/to/new/database.db');
      expect(savedConnection).toHaveProperty('created_at');
      
      // Verify it was saved to the database
      const connections = await userDataService.getSavedConnections();
      expect(connections).toHaveLength(3);
      
      // Delete the test connection
      await userDataService.deleteConnection(savedConnection.id);
    });
    
    test('should delete a connection', async () => {
      // First, save a connection to delete
      const newConnection = {
        name: 'Connection to Delete',
        type: 'sqlite',
        connection: 'path/to/delete/database.db'
      };
      
      const savedConnection = await userDataService.saveConnection(newConnection);
      
      // Verify it was saved
      const connectionsBeforeDelete = await userDataService.getSavedConnections();
      const initialCount = connectionsBeforeDelete.length;
      
      // Delete the connection
      await userDataService.deleteConnection(savedConnection.id);
      
      // Verify it was deleted
      const connectionsAfterDelete = await userDataService.getSavedConnections();
      expect(connectionsAfterDelete).toHaveLength(initialCount - 1);
      
      // Verify the connection is no longer in the database
      try {
        await userDataService.getSavedConnectionById(savedConnection.id);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toHaveProperty('statusCode', 404);
      }
    });
  });
  
  describe('Queries', () => {
    test('should get all saved queries', async () => {
      const queries = await userDataService.getSavedQueries();
      
      expect(queries).toHaveLength(2);
      expect(queries[0]).toHaveProperty('id');
      expect(queries[0]).toHaveProperty('name');
      expect(queries[0]).toHaveProperty('query');
      expect(queries[0]).toHaveProperty('created_at');
    });
    
    test('should get a saved query by ID', async () => {
      const query = await userDataService.getSavedQueryById('test-query-1');
      
      expect(query).toHaveProperty('id', 'test-query-1');
      expect(query).toHaveProperty('name', 'Test Query 1');
      expect(query).toHaveProperty('query', 'Show me all users');
      expect(query).toHaveProperty('connection_id', 'test-conn-1');
    });
    
    test('should save a new query', async () => {
      const newQuery = {
        name: 'New Test Query',
        query: 'Show me all products',
        connection_id: null
      };
      
      const savedQuery = await userDataService.saveQuery(newQuery);
      
      expect(savedQuery).toHaveProperty('id');
      expect(savedQuery).toHaveProperty('name', 'New Test Query');
      expect(savedQuery).toHaveProperty('query', 'Show me all products');
      expect(savedQuery).toHaveProperty('created_at');
      
      // Verify it was saved to the database
      const queries = await userDataService.getSavedQueries();
      expect(queries.length).toBeGreaterThan(2);
      
      // Delete the test query
      await userDataService.deleteQuery(savedQuery.id);
    });
    
    test('should delete a query', async () => {
      // First, save a query to delete
      const newQuery = {
        name: 'Query to Delete',
        query: 'Delete me',
        connection_id: null
      };
      
      const savedQuery = await userDataService.saveQuery(newQuery);
      
      // Verify it was saved
      const queriesBeforeDelete = await userDataService.getSavedQueries();
      const initialCount = queriesBeforeDelete.length;
      
      // Delete the query
      await userDataService.deleteQuery(savedQuery.id);
      
      // Verify it was deleted
      const queriesAfterDelete = await userDataService.getSavedQueries();
      expect(queriesAfterDelete).toHaveLength(initialCount - 1);
      
      // Verify the query is no longer in the database
      try {
        await userDataService.getSavedQueryById(savedQuery.id);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toHaveProperty('statusCode', 404);
      }
    });
  });
});
