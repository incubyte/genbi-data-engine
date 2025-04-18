const ResponseParser = require('../../src/services/anthropic/responseParser');
const { ApiError } = require('../../src/utils/errorHandler');

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('ResponseParser', () => {
  let responseParser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new instance for each test
    responseParser = new ResponseParser();
  });

  describe('parseResponse', () => {
    test('should parse a JSON response with SQL and visualization', () => {
      // Arrange
      const jsonResponse = {
        content: [
          {
            text: `{
              "sql": "SELECT * FROM users;",
              "visualization": {
                "recommendedChartTypes": ["bar", "table"],
                "xAxis": "name",
                "yAxis": "id",
                "reasoning": "Bar chart is recommended to compare IDs across different users."
              }
            }`
          }
        ]
      };

      // Act
      const result = responseParser.parseResponse(jsonResponse);

      // Assert
      expect(result).toEqual({
        sqlQuery: 'SELECT * FROM users;',
        visualization: {
          recommendedChartTypes: ['bar', 'table'],
          xAxis: 'name',
          yAxis: 'id',
          reasoning: 'Bar chart is recommended to compare IDs across different users.'
        }
      });
    });

    test('should parse a JSON response with SQL but no visualization', () => {
      // Arrange
      const jsonResponse = {
        content: [
          {
            text: `{
              "sql": "SELECT * FROM users;"
            }`
          }
        ]
      };

      // Act
      const result = responseParser.parseResponse(jsonResponse);

      // Assert
      expect(result).toEqual({
        sqlQuery: 'SELECT * FROM users;',
        visualization: null
      });
    });

    test('should parse a JSON response wrapped in code blocks', () => {
      // Arrange
      const jsonResponse = {
        content: [
          {
            text: '```json\n{\n  "sql": "SELECT * FROM users;",\n  "visualization": {\n    "recommendedChartTypes": ["bar", "table"],\n    "xAxis": "name",\n    "yAxis": "id",\n    "reasoning": "Bar chart is recommended to compare IDs across different users."\n  }\n}\n```'
          }
        ]
      };

      // Act
      const result = responseParser.parseResponse(jsonResponse);

      // Assert
      expect(result).toEqual({
        sqlQuery: 'SELECT * FROM users;',
        visualization: {
          recommendedChartTypes: ['bar', 'table'],
          xAxis: 'name',
          yAxis: 'id',
          reasoning: 'Bar chart is recommended to compare IDs across different users.'
        }
      });
    });

    test('should fall back to SQL extraction if JSON parsing fails', () => {
      // Arrange
      const sqlResponse = {
        content: [
          {
            text: 'SELECT * FROM users;'
          }
        ]
      };

      // Act
      const result = responseParser.parseResponse(sqlResponse);

      // Assert
      expect(result).toEqual({
        sqlQuery: 'SELECT * FROM users;',
        visualization: null
      });
    });

    test('should extract SQL from code blocks if JSON parsing fails', () => {
      // Arrange
      const sqlResponse = {
        content: [
          {
            text: '```sql\nSELECT * FROM users;\n```'
          }
        ]
      };

      // Act
      const result = responseParser.parseResponse(sqlResponse);

      // Assert
      expect(result).toEqual({
        sqlQuery: 'SELECT * FROM users;',
        visualization: null
      });
    });

    test('should throw an error for invalid response', () => {
      // Arrange
      const invalidResponse = {};

      // Act & Assert
      expect(() => responseParser.parseResponse(invalidResponse)).toThrow(ApiError);
    });

    test('should throw an error for empty content', () => {
      // Arrange
      const emptyResponse = {
        content: [{ text: '' }]
      };

      // Act & Assert
      expect(() => responseParser.parseResponse(emptyResponse)).toThrow(ApiError);
    });
  });

  describe('extractJsonContent', () => {
    test('should extract JSON from code blocks', () => {
      // Arrange
      const text = '```json\n{"key": "value"}\n```';

      // Act
      const result = responseParser.extractJsonContent(text);

      // Assert
      expect(result).toBe('{"key": "value"}');
    });

    test('should extract JSON from generic code blocks', () => {
      // Arrange
      const text = '```\n{"key": "value"}\n```';

      // Act
      const result = responseParser.extractJsonContent(text);

      // Assert
      expect(result).toBe('{"key": "value"}');
    });

    test('should return the text as is if no code blocks', () => {
      // Arrange
      const text = '{"key": "value"}';

      // Act
      const result = responseParser.extractJsonContent(text);

      // Assert
      expect(result).toBe('{"key": "value"}');
    });
  });

  describe('extractSqlQuery', () => {
    test('should extract SQL from sql code blocks', () => {
      // Arrange
      const text = '```sql\nSELECT * FROM users;\n```';

      // Act
      const result = responseParser.extractSqlQuery(text);

      // Assert
      expect(result).toBe('SELECT * FROM users;');
    });

    test('should extract SQL from generic code blocks', () => {
      // Arrange
      const text = '```\nSELECT * FROM users;\n```';

      // Act
      const result = responseParser.extractSqlQuery(text);

      // Assert
      expect(result).toBe('SELECT * FROM users;');
    });

    test('should return the text as is if no code blocks', () => {
      // Arrange
      const text = 'SELECT * FROM users;';

      // Act
      const result = responseParser.extractSqlQuery(text);

      // Assert
      expect(result).toBe('SELECT * FROM users;');
    });
  });
});
