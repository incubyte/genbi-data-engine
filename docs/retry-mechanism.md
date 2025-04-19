# Retry Mechanism for API Calls

This document describes the retry mechanism implemented for API calls in the GenBI application, particularly for calls to the Anthropic API.

## Overview

The retry mechanism provides a robust way to handle temporary failures when making API calls. It uses exponential backoff to increase the delay between retry attempts, reducing the load on the API server while still attempting to recover from transient errors.

## Configuration

The retry mechanism is configurable through environment variables or directly in the code. The following parameters can be configured:

| Parameter | Description | Default Value | Environment Variable |
|-----------|-------------|---------------|---------------------|
| `maxAttempts` | Maximum number of retry attempts | 3 | `ANTHROPIC_RETRY_MAX_ATTEMPTS` |
| `initialDelay` | Initial delay between retries (in milliseconds) | 1000 | `ANTHROPIC_RETRY_INITIAL_DELAY` |
| `maxDelay` | Maximum delay between retries (in milliseconds) | 10000 | `ANTHROPIC_RETRY_MAX_DELAY` |
| `backoffMultiplier` | Multiplier for exponential backoff | 2 | `ANTHROPIC_RETRY_BACKOFF_MULTIPLIER` |

## Error Categorization

The retry mechanism categorizes errors into two main types:

### Retryable Errors

These errors are considered temporary and will trigger retry attempts:

- Network errors (ECONNRESET, ETIMEDOUT, ECONNREFUSED, ENOTFOUND)
- Rate limit errors (HTTP 429)
- Server errors (HTTP 5xx)
- Anthropic-specific error types: 'server_error', 'rate_limit_error', 'service_unavailable'

### Non-Retryable Errors

These errors are considered permanent and will not trigger retry attempts:

- Authentication errors (HTTP 401)
- Client errors (HTTP 4xx, except 429)
- Invalid parameter errors
- Other errors not explicitly categorized as retryable

## Implementation

The retry mechanism is implemented in the `RetryUtils` class, which provides the following methods:

- `retry(fn, options)`: Retries a function with exponential backoff
- `isRetryableError(error)`: Determines if an error is retryable
- `categorizeError(error)`: Categorizes an error and provides additional information

## Usage

The retry mechanism is used in the following components:

1. `RealAnthropicClient`: For retrying API calls to Anthropic's Claude API
2. `SchemaExtractor`: For retrying schema extraction API calls

### Example

```javascript
const RetryUtils = require('../utils/retryUtils');

// Function to be retried
const makeApiCall = async () => {
  // API call that might fail
  return await api.call();
};

// Retry options
const retryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  onRetry: (error, attempt, delay) => {
    console.log(`Retry attempt ${attempt} after ${delay}ms`);
  }
};

// Execute with retry
try {
  const result = await RetryUtils.retry(makeApiCall, retryOptions);
  console.log('Success:', result);
} catch (error) {
  console.error('All retry attempts failed:', error);
}
```

## Logging

The retry mechanism logs information about retry attempts and failures:

- Each retry attempt is logged with error details and retry count
- Final failures are logged with comprehensive error information
- Error categorization information is included in logs

## User Experience

When retries are happening, the application:

1. Continues to attempt to fulfill the user's request without requiring user intervention
2. Logs detailed information about the retries for debugging
3. Eventually returns an appropriate error message if all retries fail

## Testing

The retry mechanism includes comprehensive unit tests that verify:

- Correct identification of retryable and non-retryable errors
- Proper implementation of exponential backoff
- Correct handling of maximum retry attempts
- Proper error categorization

## Future Improvements

Potential future improvements to the retry mechanism include:

- Circuit breaker pattern to prevent overwhelming failing services
- More sophisticated backoff strategies (e.g., jitter)
- Per-endpoint retry configurations
- Retry statistics and monitoring
