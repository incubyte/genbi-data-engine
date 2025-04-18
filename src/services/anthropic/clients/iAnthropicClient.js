/**
 * Interface for Anthropic API clients
 * This defines the contract that all Anthropic clients must follow
 */
class IAnthropicClient {
  /**
   * Generate a response from the Anthropic API
   * @param {Object} options - Options for the API call
   * @param {string} options.systemPrompt - System prompt for the API
   * @param {Array<Object>} options.messages - Messages for the API
   * @param {number} options.maxTokens - Maximum number of tokens to generate
   * @param {string} options.model - Model to use
   * @returns {Promise<Object>} - API response
   */
  async generateResponse(options) {
    throw new Error('Method not implemented');
  }

  /**
   * Check if the client is in mock mode
   * @returns {boolean} - True if in mock mode
   */
  isMockMode() {
    throw new Error('Method not implemented');
  }

  /**
   * Get the model being used
   * @returns {string} - Model name
   */
  getModel() {
    throw new Error('Method not implemented');
  }
}

module.exports = IAnthropicClient;
