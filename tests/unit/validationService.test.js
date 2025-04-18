const { 
  validateConnection, 
  validateQuery, 
  validateUserQuery 
} = require('../../src/utils/validationService');

describe('Validation Service', () => {
  describe('validateConnection', () => {
    test('should validate a valid SQLite connection', () => {
      const connectionInfo = {
        type: 'sqlite',
        connection: 'path/to/database.db'
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should validate a valid PostgreSQL connection string', () => {
      const connectionInfo = {
        type: 'postgres',
        connection: 'postgres://user:password@localhost:5432/database'
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should validate a valid PostgreSQL connection object', () => {
      const connectionInfo = {
        type: 'postgres',
        connection: {
          host: 'localhost',
          port: 5432,
          database: 'database',
          user: 'user',
          password: 'password'
        }
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should validate a valid MySQL connection string', () => {
      const connectionInfo = {
        type: 'mysql',
        connection: 'mysql://user:password@localhost:3306/database'
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should validate a valid MySQL connection object', () => {
      const connectionInfo = {
        type: 'mysql',
        connection: {
          host: 'localhost',
          port: 3306,
          database: 'database',
          user: 'user',
          password: 'password'
        }
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should invalidate a connection with missing type', () => {
      const connectionInfo = {
        connection: 'path/to/database.db'
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('type');
    });
    
    test('should invalidate a connection with invalid type', () => {
      const connectionInfo = {
        type: 'invalid',
        connection: 'path/to/database.db'
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('type');
    });
    
    test('should invalidate a SQLite connection with missing path', () => {
      const connectionInfo = {
        type: 'sqlite',
        connection: ''
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('connection');
    });
    
    test('should invalidate a PostgreSQL connection object with missing host', () => {
      const connectionInfo = {
        type: 'postgres',
        connection: {
          port: 5432,
          database: 'database',
          user: 'user',
          password: 'password'
        }
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('host');
    });
    
    test('should invalidate a MySQL connection object with invalid port', () => {
      const connectionInfo = {
        type: 'mysql',
        connection: {
          host: 'localhost',
          port: -1,
          database: 'database',
          user: 'user',
          password: 'password'
        }
      };
      
      const result = validateConnection(connectionInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('port');
    });
  });
  
  describe('validateQuery', () => {
    test('should validate a valid query', () => {
      const queryData = {
        name: 'Test Query',
        query: 'Show me all users'
      };
      
      const result = validateQuery(queryData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should validate a valid query with connection ID', () => {
      const queryData = {
        name: 'Test Query',
        query: 'Show me all users',
        connection_id: 'test-connection-id'
      };
      
      const result = validateQuery(queryData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should invalidate a query with missing name', () => {
      const queryData = {
        query: 'Show me all users'
      };
      
      const result = validateQuery(queryData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('name');
    });
    
    test('should invalidate a query with missing query text', () => {
      const queryData = {
        name: 'Test Query'
      };
      
      const result = validateQuery(queryData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('query');
    });
    
    test('should invalidate a query with invalid connection ID', () => {
      const queryData = {
        name: 'Test Query',
        query: 'Show me all users',
        connection_id: 123 // Should be a string
      };
      
      const result = validateQuery(queryData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('connection_id');
    });
  });
  
  describe('validateUserQuery', () => {
    test('should validate a valid user query', () => {
      const userQuery = 'Show me all users';
      
      const result = validateUserQuery(userQuery);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    test('should invalidate an empty user query', () => {
      const userQuery = '';
      
      const result = validateUserQuery(userQuery);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('userQuery');
    });
    
    test('should invalidate a user query that is too short', () => {
      const userQuery = 'Hi';
      
      const result = validateUserQuery(userQuery);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('userQuery');
    });
    
    test('should invalidate a user query that is too long', () => {
      const userQuery = 'a'.repeat(1001);
      
      const result = validateUserQuery(userQuery);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('userQuery');
    });
  });
});
