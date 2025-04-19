// Mock dependencies before importing the service
const mockValidateUserQuery = jest.fn();
const mockExtractRelevantSchema = jest.fn();

// Mock the validation service
jest.mock('../../src/utils/validationService', () => ({
  validateUserQuery: mockValidateUserQuery
}));

// Mock the schema extractor
jest.mock('../../src/services/anthropic/schemaExtractor', () => ({
  extractRelevantSchema: mockExtractRelevantSchema
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Import the service and its dependencies after mocking
const AnthropicService = require('../../src/services/anthropic/anthropicService');
const PromptBuilder = require('../../src/services/anthropic/promptBuilder');
const ResponseParser = require('../../src/services/anthropic/responseParser');
const MockAnthropicClient = require('../../src/services/anthropic/clients/mockAnthropicClient');
const { ValidationError } = require('../../src/utils/errorHandler');

describe('AnthropicService', () => {
  let anthropicService;
  let mockClient;
  let promptBuilder;
  let responseParser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    mockClient = new MockAnthropicClient({ model: 'test-model' });
    promptBuilder = new PromptBuilder();
    responseParser = new ResponseParser();

    // Create the service with mock dependencies
    anthropicService = new AnthropicService(mockClient, promptBuilder, responseParser);

    // Mock the validation to return valid by default
    mockValidateUserQuery.mockReturnValue({ isValid: true, errors: {} });

    // Mock the schema extractor to return the input schema by default
    mockExtractRelevantSchema.mockImplementation(async (schema) => schema);
  });

  describe('generateSqlQuery', () => {
    test('should validate the user query', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const schema = { users: { columns: ['id', 'name'] } };
      const dbType = 'sqlite';

      // Act
      await anthropicService.generateSqlQuery(userQuery, schema, dbType);

      // Assert
      expect(mockValidateUserQuery).toHaveBeenCalledWith(userQuery);
    });

    test('should throw ValidationError if user query is invalid', async () => {
      // Arrange
      const userQuery = 'Hi';
      const schema = { users: { columns: ['id', 'name'] } };
      const dbType = 'sqlite';

      // Mock validation to return invalid
      mockValidateUserQuery.mockReturnValue({
        isValid: false,
        errors: { userQuery: 'Query must be at least 3 characters long' }
      });

      // Act & Assert
      await expect(anthropicService.generateSqlQuery(userQuery, schema, dbType))
        .rejects
        .toThrow(ValidationError);
    });

    test('should use the prompt builder to build the system prompt', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const schema = { users: { columns: ['id', 'name'] } };
      const dbType = 'sqlite';

      // Spy on the prompt builder
      const buildSpy = jest.spyOn(promptBuilder, 'buildSqlGenerationPrompt');

      // Act
      await anthropicService.generateSqlQuery(userQuery, schema, dbType);

      // Assert
      expect(buildSpy).toHaveBeenCalledWith({ schema, dbType });
    });

    test('should call the client with the correct parameters', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const schema = { users: { columns: ['id', 'name'] } };
      const dbType = 'sqlite';
      const systemPrompt = 'Test system prompt';

      // Mock the prompt builder
      jest.spyOn(promptBuilder, 'buildSqlGenerationPrompt').mockReturnValue(systemPrompt);

      // Spy on the client
      const generateSpy = jest.spyOn(mockClient, 'generateResponse');

      // Act
      await anthropicService.generateSqlQuery(userQuery, schema, dbType);

      // Assert
      expect(generateSpy).toHaveBeenCalledWith({
        systemPrompt,
        messages: [{ role: 'user', content: userQuery }],
        maxTokens: 1500
      });
    });

    test('should use the response parser to parse the response', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const schema = { users: { columns: ['id', 'name'] } };
      const dbType = 'sqlite';
      const mockResponse = { content: [{ text: 'SELECT * FROM users;' }] };

      // Mock the client response
      jest.spyOn(mockClient, 'generateResponse').mockResolvedValue(mockResponse);

      // Spy on the response parser
      const parseSpy = jest.spyOn(responseParser, 'parseResponse');

      // Act
      await anthropicService.generateSqlQuery(userQuery, schema, dbType);

      // Assert
      expect(parseSpy).toHaveBeenCalledWith(mockResponse);
    });

    test('should return the parsed SQL query and visualization recommendations', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const schema = { users: { columns: ['id', 'name'] } };
      const dbType = 'sqlite';
      const mockResponse = { content: [{ text: '{"sql":"SELECT * FROM users;","visualization":{"recommendedChartTypes":["bar","table"],"xAxis":"name","yAxis":"id","reasoning":"Bar chart is recommended to compare IDs across different users."}}' }] };
      const expectedResult = {
        sqlQuery: 'SELECT * FROM users;',
        visualization: {
          recommendedChartTypes: ['bar', 'table'],
          xAxis: 'name',
          yAxis: 'id',
          reasoning: 'Bar chart is recommended to compare IDs across different users.'
        }
      };

      // Mock the client response
      jest.spyOn(mockClient, 'generateResponse').mockResolvedValue(mockResponse);

      // Mock the response parser
      jest.spyOn(responseParser, 'parseResponse').mockReturnValue(expectedResult);

      // Act
      const result = await anthropicService.generateSqlQuery(userQuery, schema, dbType);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    test('should handle response with only SQL query (no visualization)', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const schema = { users: { columns: ['id', 'name'] } };
      const dbType = 'sqlite';
      const mockResponse = { content: [{ text: 'SELECT * FROM users;' }] };
      const expectedResult = {
        sqlQuery: 'SELECT * FROM users;',
        visualization: null
      };

      // Mock the client response
      jest.spyOn(mockClient, 'generateResponse').mockResolvedValue(mockResponse);

      // Mock the response parser
      jest.spyOn(responseParser, 'parseResponse').mockReturnValue(expectedResult);

      // Act
      const result = await anthropicService.generateSqlQuery(userQuery, schema, dbType);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    test('should optimize schema for large databases', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const largeSchema = {};
      // Create a large schema with 20 tables
      for (let i = 0; i < 20; i++) {
        largeSchema[`table${i}`] = {
          columns: [{ name: 'id', type: 'INTEGER' }]
        };
      }
      const dbType = 'sqlite';
      const optimizedSchema = { table0: { columns: [{ name: 'id', type: 'INTEGER' }] } };

      // Mock the schema extractor to return an optimized schema
      mockExtractRelevantSchema.mockResolvedValue(optimizedSchema);

      // Spy on the prompt builder
      const buildSpy = jest.spyOn(promptBuilder, 'buildSqlGenerationPrompt');

      // Act
      await anthropicService.generateSqlQuery(userQuery, largeSchema, dbType, { optimizeSchema: true });

      // Assert
      expect(mockExtractRelevantSchema).toHaveBeenCalledWith(largeSchema, userQuery, {
        maxTables: 20,
        includeForeignKeys: true
      });
      expect(buildSpy).toHaveBeenCalledWith({ schema: optimizedSchema, dbType });
    });

    test('should not optimize schema when optimizeSchema is false', async () => {
      // Arrange
      const userQuery = 'Show me all users';
      const largeSchema = {};
      // Create a large schema with 20 tables
      for (let i = 0; i < 20; i++) {
        largeSchema[`table${i}`] = {
          columns: [{ name: 'id', type: 'INTEGER' }]
        };
      }
      const dbType = 'sqlite';

      // Reset the mock to track calls
      mockExtractRelevantSchema.mockClear();

      // Spy on the prompt builder
      const buildSpy = jest.spyOn(promptBuilder, 'buildSqlGenerationPrompt');

      // Act
      await anthropicService.generateSqlQuery(userQuery, largeSchema, dbType, { optimizeSchema: false });

      // Assert
      expect(mockExtractRelevantSchema).not.toHaveBeenCalled();
      expect(buildSpy).toHaveBeenCalledWith({ schema: largeSchema, dbType });
    });
  });

  describe('isMockMode', () => {
    test('should return the mock mode status from the client', () => {
      // Arrange
      jest.spyOn(mockClient, 'isMockMode').mockReturnValue(true);

      // Act
      const result = anthropicService.isMockMode();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('getModel', () => {
    test('should return the model from the client', () => {
      // Arrange
      const expectedModel = 'test-model';
      jest.spyOn(mockClient, 'getModel').mockReturnValue(expectedModel);

      // Act
      const result = anthropicService.getModel();

      // Assert
      expect(result).toBe(expectedModel);
    });
  });
});
