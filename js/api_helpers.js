/**
 * API Helper Functions for Additive Artisan
 * Provides timeout and retry logic for API calls
 */

(function(window) {
  "use strict";

  /**
   * Fetch with timeout
   * Aborts the request if it takes longer than the specified timeout
   *
   * @param {string} url - URL to fetch
   * @param {number} timeout - Timeout in milliseconds (default: 10000ms = 10s)
   * @returns {Promise<Response>} Fetch response
   * @throws {Error} If request times out or fetch fails
   */
  async function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  /**
   * Fetch with retry logic
   * Retries failed requests with exponential backoff
   *
   * @param {string} url - URL to fetch
   * @param {object} options - Fetch options (optional)
   * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
   * @returns {Promise<Response>} Fetch response
   * @throws {Error} If all retry attempts fail
   */
  async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetchWithTimeout(url, 10000);

        // If response is ok, return it
        if (response.ok) {
          return response;
        }

        // If this is the last retry, throw error
        if (i === maxRetries - 1) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

      } catch (error) {
        // If this is the last retry, throw the error
        if (i === maxRetries - 1) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  /**
   * Fetch JSON with timeout and retry
   * Convenience method that combines fetchWithRetry and JSON parsing
   *
   * @param {string} url - URL to fetch
   * @param {object} options - Fetch options (optional)
   * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
   * @returns {Promise<object>} Parsed JSON response
   * @throws {Error} If request fails or JSON parsing fails
   */
  async function fetchJSON(url, options = {}, maxRetries = 3) {
    const response = await fetchWithRetry(url, options, maxRetries);
    return await response.json();
  }

  // Export public API
  window.AdditiveArtisanAPI = {
    fetchWithTimeout,
    fetchWithRetry,
    fetchJSON
  };

})(window);
