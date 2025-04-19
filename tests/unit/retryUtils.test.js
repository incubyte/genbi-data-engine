const RetryUtils = require('../../src/utils/retryUtils');

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('RetryUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isRetryableError', () => {
    test('should identify network errors as retryable', () => {
      const networkErrors = [
        { code: 'ECONNRESET', message: 'Connection reset' },
        { code: 'ETIMEDOUT', message: 'Connection timed out' },
        { code: 'ECONNREFUSED', message: 'Connection refused' },
        { code: 'ENOTFOUND', message: 'Host not found' },
        { message: 'Network error occurred' },
        { message: 'Request timed out' }
      ];

      // Test each error individually to identify which one is failing
      expect(RetryUtils.isRetryableError(networkErrors[0])).toBe(true); // ECONNRESET
      expect(RetryUtils.isRetryableError(networkErrors[1])).toBe(true); // ETIMEDOUT
      expect(RetryUtils.isRetryableError(networkErrors[2])).toBe(true); // ECONNREFUSED
      expect(RetryUtils.isRetryableError(networkErrors[3])).toBe(true); // ENOTFOUND
      expect(RetryUtils.isRetryableError(networkErrors[4])).toBe(true); // Network error message
      expect(RetryUtils.isRetryableError(networkErrors[5])).toBe(true); // Timeout message
    });

    test('should identify rate limit errors as retryable', () => {
      const rateLimitErrors = [
        { status: 429, message: 'Too many requests' },
        { statusCode: 429, message: 'Rate limit exceeded' },
        { message: 'You have exceeded your rate limit' },
        { message: 'Too many requests, please try again later' },
        { type: 'rate_limit_error', message: 'Rate limit exceeded' }
      ];

      rateLimitErrors.forEach(error => {
        expect(RetryUtils.isRetryableError(error)).toBe(true);
      });
    });

    test('should identify server errors as retryable', () => {
      const serverErrors = [
        { status: 500, message: 'Internal server error' },
        { status: 502, message: 'Bad gateway' },
        { status: 503, message: 'Service unavailable' },
        { status: 504, message: 'Gateway timeout' },
        { statusCode: 500, message: 'Internal server error' },
        { type: 'server_error', message: 'Server error' },
        { type: 'service_unavailable', message: 'Service unavailable' }
      ];

      serverErrors.forEach(error => {
        expect(RetryUtils.isRetryableError(error)).toBe(true);
      });
    });

    test('should identify client errors as non-retryable', () => {
      const clientErrors = [
        { status: 400, message: 'Bad request' },
        { status: 401, message: 'Unauthorized' },
        { status: 403, message: 'Forbidden' },
        { status: 404, message: 'Not found' },
        { statusCode: 400, message: 'Bad request' },
        { type: 'authentication_error', message: 'Authentication failed' }
      ];

      clientErrors.forEach(error => {
        expect(RetryUtils.isRetryableError(error)).toBe(false);
      });
    });
  });

  describe('categorizeError', () => {
    test('should categorize network errors correctly', () => {
      const networkError = { code: 'ECONNRESET', message: 'Connection reset' };
      const result = RetryUtils.categorizeError(networkError);

      expect(result.isRetryable).toBe(true);
      expect(result.category).toBe('network');
      expect(result.description).toBe('Network error or timeout');
      expect(result.originalError).toBe(networkError);
    });

    test('should categorize rate limit errors correctly', () => {
      const rateLimitError = { status: 429, message: 'Too many requests' };
      const result = RetryUtils.categorizeError(rateLimitError);

      expect(result.isRetryable).toBe(true);
      expect(result.category).toBe('rate_limit');
      expect(result.description).toBe('Rate limit exceeded');
      expect(result.originalError).toBe(rateLimitError);
    });

    test('should categorize server errors correctly', () => {
      const serverError = { status: 500, message: 'Internal server error' };
      const result = RetryUtils.categorizeError(serverError);

      expect(result.isRetryable).toBe(true);
      expect(result.category).toBe('server');
      expect(result.description).toBe('Server error');
      expect(result.originalError).toBe(serverError);
    });

    test('should categorize authentication errors correctly', () => {
      const authError = { status: 401, message: 'Unauthorized' };
      const result = RetryUtils.categorizeError(authError);

      expect(result.isRetryable).toBe(false);
      expect(result.category).toBe('authentication');
      expect(result.description).toBe('Authentication error');
      expect(result.originalError).toBe(authError);
    });

    test('should categorize client errors correctly', () => {
      const clientError = { status: 400, message: 'Bad request' };
      const result = RetryUtils.categorizeError(clientError);

      expect(result.isRetryable).toBe(false);
      expect(result.category).toBe('client');
      expect(result.description).toBe('Client error');
      expect(result.originalError).toBe(clientError);
    });

    test('should categorize unknown errors correctly', () => {
      const unknownError = { message: 'Unknown error' };
      const result = RetryUtils.categorizeError(unknownError);

      expect(result.isRetryable).toBe(false);
      expect(result.category).toBe('unknown');
      expect(result.description).toBe('Unknown error');
      expect(result.originalError).toBe(unknownError);
    });
  });

  describe('retry', () => {
    test('should return the result if the function succeeds on the first try', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await RetryUtils.retry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should retry the function if it fails with a retryable error', async () => {
      const retryableError = { status: 500, message: 'Internal server error' };
      const fn = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce('success');

      const result = await RetryUtils.retry(fn, { initialDelay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test('should not retry the function if it fails with a non-retryable error', async () => {
      const nonRetryableError = { status: 400, message: 'Bad request' };
      const fn = jest.fn().mockRejectedValue(nonRetryableError);

      await expect(RetryUtils.retry(fn)).rejects.toEqual(nonRetryableError);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('should stop retrying after reaching the maximum number of attempts', async () => {
      const retryableError = { status: 500, message: 'Internal server error' };
      const fn = jest.fn().mockRejectedValue(retryableError);

      await expect(RetryUtils.retry(fn, { maxAttempts: 3, initialDelay: 10 })).rejects.toEqual(retryableError);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('should call the onRetry callback before each retry', async () => {
      const retryableError = { status: 500, message: 'Internal server error' };
      const fn = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce('success');

      const onRetry = jest.fn();

      const result = await RetryUtils.retry(fn, {
        maxAttempts: 3,
        initialDelay: 10,
        onRetry
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(retryableError, 1, expect.any(Number));
      expect(onRetry).toHaveBeenCalledWith(retryableError, 2, expect.any(Number));
    });

    test('should use exponential backoff for delays between retries', async () => {
      const retryableError = { status: 500, message: 'Internal server error' };
      const fn = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce('success');

      const onRetry = jest.fn();

      const result = await RetryUtils.retry(fn, {
        maxAttempts: 4,
        initialDelay: 10,
        maxDelay: 1000,
        backoffMultiplier: 2,
        onRetry
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(4);
      expect(onRetry).toHaveBeenCalledTimes(3);

      // Check that delays follow exponential backoff pattern
      expect(onRetry.mock.calls[0][2]).toBe(10); // Initial delay
      expect(onRetry.mock.calls[1][2]).toBe(20); // Initial delay * backoffMultiplier
      expect(onRetry.mock.calls[2][2]).toBe(40); // Previous delay * backoffMultiplier
    });

    test('should respect the maximum delay', async () => {
      const retryableError = { status: 500, message: 'Internal server error' };
      const fn = jest.fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce('success');

      const onRetry = jest.fn();

      const result = await RetryUtils.retry(fn, {
        maxAttempts: 5,
        initialDelay: 100,
        maxDelay: 300,
        backoffMultiplier: 2,
        onRetry
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(5);
      expect(onRetry).toHaveBeenCalledTimes(4);

      // Check that delays follow exponential backoff pattern but respect maxDelay
      expect(onRetry.mock.calls[0][2]).toBe(100); // Initial delay
      expect(onRetry.mock.calls[1][2]).toBe(200); // Initial delay * backoffMultiplier
      expect(onRetry.mock.calls[2][2]).toBe(300); // Max delay reached
      expect(onRetry.mock.calls[3][2]).toBe(300); // Still at max delay
    });
  });
});
