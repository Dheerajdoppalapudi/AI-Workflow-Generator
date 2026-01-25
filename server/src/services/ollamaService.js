import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:latest';
const DEFAULT_TIMEOUT = 120000; // 2 minutes

/**
 * Generate a response from Ollama
 * @param {string} prompt - The prompt to send to Ollama
 * @param {Object} options - Optional configuration
 * @param {string} options.model - Model to use (defaults to OLLAMA_MODEL)
 * @param {number} options.timeout - Request timeout in ms (defaults to DEFAULT_TIMEOUT)
 * @param {boolean} options.stream - Whether to stream the response (defaults to false)
 * @returns {Promise<string>} - The generated response text
 */
export const generateResponse = async (prompt, options = {}) => {
  const {
    model = OLLAMA_MODEL,
    timeout = DEFAULT_TIMEOUT,
    stream = false
  } = options;

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model,
        prompt,
        stream
      },
      {
        timeout
      }
    );

    return response.data.response;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      const connectionError = new Error(
        `Unable to connect to Ollama. Please ensure Ollama is running on ${OLLAMA_BASE_URL}`
      );
      connectionError.code = 'OLLAMA_CONNECTION_ERROR';
      throw connectionError;
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      const timeoutError = new Error(
        `Ollama request timed out after ${timeout}ms`
      );
      timeoutError.code = 'OLLAMA_TIMEOUT_ERROR';
      throw timeoutError;
    }

    throw error;
  }
};

/**
 * Extract JSON from an AI response string
 * @param {string} responseText - The raw response text
 * @returns {Object} - Parsed JSON object
 */
export const extractJsonFromResponse = (responseText) => {
  // Try to find JSON in the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  // If no JSON found, try parsing the whole response
  return JSON.parse(responseText);
};

/**
 * Check if Ollama service is available
 * @returns {Promise<boolean>} - True if Ollama is running
 */
export const checkConnection = async () => {
  try {
    await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get the current Ollama configuration
 * @returns {Object} - Current configuration
 */
export const getConfig = () => ({
  baseUrl: OLLAMA_BASE_URL,
  model: OLLAMA_MODEL,
  defaultTimeout: DEFAULT_TIMEOUT
});

export default {
  generateResponse,
  extractJsonFromResponse,
  checkConnection,
  getConfig
};
