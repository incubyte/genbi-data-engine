const logger = require('./logger');

/**
 * Utility for retrying operations with exponential backoff
 */
class RetryUtils {
  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - The function to retry
   * @param {Object} options - Retry options
   * @param {number} options.maxAttempts - Maximum number of retry attempts (default: 3)
   * @param {number} options.initialDelay - Initial delay in milliseconds (default: 1000)
   * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 10000)
   * @param {number} options.backoffMultiplier - Backoff multiplier (default: 2)
   * @param {Function} options.retryCondition - Function to determine if an error is retryable (default: isRetryableError)
   * @param {Function} options.onRetry - Function to call before each retry attempt (default: null)
   * @returns {Promise<any>} - Result of the function
   */
  static async retry(fn, options = {}) {
    const maxAttempts = options.maxAttempts || 3;
    const initialDelay = options.initialDelay || 1000;
    const maxDelay = options.maxDelay || 10000;
    const backoffMultiplier = options.backoffMultiplier || 2;
    const retryCondition = options.retryCondition || RetryUtils.isRetryableError;
    const onRetry = options.onRetry || null;

    let attempt = 1;
    let delay = initialDelay;

    while (true) {
      try {
        return await fn();
      } catch (error) {
        // Check if we should retry
        if (attempt >= maxAttempts || !retryCondition(error)) {
          // We've reached the maximum number of attempts or the error is not retryable
          logger.error(`Retry failed after ${attempt} attempts:`, error);
          throw error;
        }

        // Store the current delay for the callback
        const currentDelay = delay;

        // Calculate the next delay with exponential backoff for the next iteration
        delay = Math.min(delay * backoffMultiplier, maxDelay);

        // Log the retry attempt
        logger.warn(`Attempt ${attempt} failed, retrying in ${currentDelay}ms:`, {
          error: error.message,
          errorType: error.name,
          statusCode: error.status || error.statusCode,
          attempt,
          maxAttempts,
          delay: currentDelay
        });

        // Call the onRetry callback if provided
        if (onRetry) {
          onRetry(error, attempt, currentDelay);
        }

        // Wait for the delay
        await new Promise(resolve => setTimeout(resolve, currentDelay));

        // Increment the attempt counter
        attempt++;
      }
    }
  }

  /**
   * Determine if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean} - True if the error is retryable
   */
  static isRetryableError(error) {
    if (!error) return false;

    // Check for network errors
    if (error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND') {
      return true;
    }

    // Check for network-related error messages
    if (error.message) {
      const message = error.message.toLowerCase();
      if (message.includes('network') ||
          message.includes('timeout') ||
          message.includes('timed out')) {
        return true;
      }
    }

    // Check for rate limit errors
    if (error.status === 429 || error.statusCode === 429) {
      return true;
    }

    // Check for rate limit related error messages
    if (error.message) {
      const message = error.message.toLowerCase();
      if (message.includes('rate limit') || message.includes('too many requests')) {
        return true;
      }
    }

    // Check for specific error types
    if (error.type === 'rate_limit_error' ||
        error.type === 'server_error' ||
        error.type === 'service_unavailable') {
      return true;
    }

    // Check for server errors (5xx)
    if ((error.status && error.status >= 500 && error.status < 600) ||
        (error.statusCode && error.statusCode >= 500 && error.statusCode < 600)) {
      return true;
    }

    // By default, errors are not retryable
    return false;
  }

  /**
   * Categorize an error as retryable or non-retryable
   * @param {Error} error - The error to categorize
   * @returns {Object} - Object with error category information
   */
  static categorizeError(error) {
    if (!error) {
      return {
        isRetryable: false,
        category: 'unknown',
        description: 'Unknown error',
        originalError: error
      };
    }

    const isRetryable = RetryUtils.isRetryableError(error);
    let category = 'unknown';
    let description = 'Unknown error';

    // Determine the error category
    if (RetryUtils._isNetworkError(error)) {
      category = 'network';
      description = 'Network error or timeout';
    } else if (RetryUtils._isRateLimitError(error)) {
      category = 'rate_limit';
      description = 'Rate limit exceeded';
    } else if (RetryUtils._isServerError(error)) {
      category = 'server';
      description = 'Server error';
    } else if (RetryUtils._isAuthenticationError(error)) {
      category = 'authentication';
      description = 'Authentication error';
    } else if (RetryUtils._isClientError(error)) {
      category = 'client';
      description = 'Client error';
    }

    return {
      isRetryable,
      category,
      description,
      originalError: error
    };
  }

  /**
   * Check if an error is a network error
   * @param {Error} error - The error to check
   * @returns {boolean} - True if the error is a network error
   * @private
   */
  static _isNetworkError(error) {
    if (!error) return false;

    // Check for specific error codes
    if (error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND') {
      return true;
    }

    // Check for network-related error messages
    if (error.message) {
      const message = error.message.toLowerCase();
      if (message.includes('network') ||
          message.includes('timeout') ||
          message.includes('timed out')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an error is a rate limit error
   * @param {Error} error - The error to check
   * @returns {boolean} - True if the error is a rate limit error
   * @private
   */
  static _isRateLimitError(error) {
    if (!error) return false;

    // Check for specific status codes
    if (error.status === 429 || error.statusCode === 429) {
      return true;
    }

    // Check for specific error types
    if (error.type === 'rate_limit_error') {
      return true;
    }

    // Check for rate limit related error messages
    if (error.message) {
      const message = error.message.toLowerCase();
      if (message.includes('rate limit') || message.includes('too many requests')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an error is a server error
   * @param {Error} error - The error to check
   * @returns {boolean} - True if the error is a server error
   * @private
   */
  static _isServerError(error) {
    if (!error) return false;

    // Check for server error status codes (5xx)
    if (error.status && error.status >= 500 && error.status < 600) {
      return true;
    }

    if (error.statusCode && error.statusCode >= 500 && error.statusCode < 600) {
      return true;
    }

    // Check for specific error types
    if (error.type === 'server_error' || error.type === 'service_unavailable') {
      return true;
    }

    return false;
  }

  /**
   * Check if an error is an authentication error
   * @param {Error} error - The error to check
   * @returns {boolean} - True if the error is an authentication error
   * @private
   */
  static _isAuthenticationError(error) {
    if (!error) return false;

    // Check for authentication error status codes
    if (error.status === 401 || error.statusCode === 401) {
      return true;
    }

    // Check for specific error types
    if (error.type === 'authentication_error') {
      return true;
    }

    // Check for authentication related error messages
    if (error.message) {
      const message = error.message.toLowerCase();
      if (message.includes('authentication') || message.includes('unauthorized')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an error is a client error
   * @param {Error} error - The error to check
   * @returns {boolean} - True if the error is a client error
   * @private
   */
  static _isClientError(error) {
    if (!error) return false;

    // Check for client error status codes (4xx) excluding rate limit errors (429)
    if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
      return true;
    }

    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
      return true;
    }

    return false;
  }
}

module.exports = RetryUtils;
