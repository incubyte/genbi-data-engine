const AnthropicServiceFactory = require('../../src/services/anthropic/anthropicServiceFactory');
const AnthropicService = require('../../src/services/anthropic/anthropicService');
const RealAnthropicClient = require('../../src/services/anthropic/clients/realAnthropicClient');
const MockAnthropicClient = require('../../src/services/anthropic/clients/mockAnthropicClient');

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('AnthropicServiceFactory', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('should create a service with a mock client when API key is not provided', () => {
    // Arrange
    const config = {
      api: {
        anthropic: {
          apiKey: null,
          model: 'test-model'
        }
      }
    };

    // Act
    const service = AnthropicServiceFactory.create(config);

    // Assert
    expect(service).toBeInstanceOf(AnthropicService);
    expect(service.isMockMode()).toBe(true);
  });

  test('should create a service with a mock client when API key is the placeholder', () => {
    // Arrange
    const config = {
      api: {
        anthropic: {
          apiKey: 'your_anthropic_api_key_here',
          model: 'test-model'
        }
      }
    };

    // Act
    const service = AnthropicServiceFactory.create(config);

    // Assert
    expect(service).toBeInstanceOf(AnthropicService);
    expect(service.isMockMode()).toBe(true);
  });

  test('should create a service with a real client when API key is provided', () => {
    // Arrange
    const config = {
      api: {
        anthropic: {
          apiKey: 'test_api_key',
          model: 'test-model'
        }
      }
    };

    // Act
    const service = AnthropicServiceFactory.create(config);

    // Assert
    expect(service).toBeInstanceOf(AnthropicService);
    expect(service.isMockMode()).toBe(false);
  });

  test('should create a service with a mock client when forceMockMode is true', () => {
    // Arrange
    const config = {
      api: {
        anthropic: {
          apiKey: 'test_api_key',
          model: 'test-model'
        }
      }
    };

    // Act
    const service = AnthropicServiceFactory.create(config, { forceMockMode: true });

    // Assert
    expect(service).toBeInstanceOf(AnthropicService);
    expect(service.isMockMode()).toBe(true);
  });

  test('should pass options to the prompt builder and response parser', () => {
    // Arrange
    const config = {
      api: {
        anthropic: {
          apiKey: 'test_api_key',
          model: 'test-model'
        }
      }
    };

    const options = {
      includeExamples: false,
      includeChainOfThought: false,
      validateSql: false
    };

    // Create spies for the constructors
    const promptBuilderSpy = jest.spyOn(require('../../src/services/anthropic/promptBuilder').prototype, 'buildSqlGenerationPrompt')
      .mockImplementation(() => 'mock prompt');

    const responseParserSpy = jest.spyOn(require('../../src/services/anthropic/responseParser').prototype, 'parseResponse')
      .mockImplementation(() => 'mock sql');

    // Act
    const service = AnthropicServiceFactory.create(config, options);

    // Assert
    expect(service).toBeInstanceOf(AnthropicService);

    // Clean up
    promptBuilderSpy.mockRestore();
    responseParserSpy.mockRestore();
  });
});
