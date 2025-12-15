/**
 * Utility Functions for Additive Artisan
 * Shared helpers for data formatting and validation
 */

(function (window) {
  "use strict";

  const utils = {
    /**
     * Format price as USD currency
     * @param {number} amount - Price amount
     * @returns {string} Formatted price (e.g., "$15.00")
     */
    formatPrice(amount) {
      if (typeof amount !== "number" || isNaN(amount)) {
        return "$0.00";
      }
      return `$${amount.toFixed(2)}`;
    },

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHTML(str) {
      if (!str) return "";
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    },

    /**
     * Validate URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid URL
     */
    isValidURL(url) {
      if (!url) return false;
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === "http:" || urlObj.protocol === "https:";
      } catch (e) {
        return false;
      }
    },

    /**
     * Format date to readable string
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date (e.g., "December 9, 2024")
     */
    formatDate(dateString) {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (e) {
        return "";
      }
    },

    /**
     * Debounce function for performance
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID string
     */
    generateId() {
      return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Deep clone object
     * @param {object} obj - Object to clone
     * @returns {object} Cloned object
     */
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Show loading spinner
     * @param {string} containerId - ID of container element
     */
    showLoading(containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="loading-state" style="text-align: center; padding: 3rem;">
            <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
            <p style="color: var(--color-text-muted);">Loading products...</p>
          </div>
        `;
      }
    },

    /**
     * Show error message
     * @param {string} containerId - ID of container element
     * @param {string} message - Error message to display
     */
    showError(containerId, message = "Unable to load products. Please try again later.") {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = `
          <div class="error-state" style="text-align: center; padding: 3rem;">
            <p style="color: var(--color-accent);">${this.escapeHTML(message)}</p>
          </div>
        `;
      }
    },

    /**
     * Check if object is empty
     * @param {object} obj - Object to check
     * @returns {boolean} True if empty
     */
    isEmpty(obj) {
      return Object.keys(obj || {}).length === 0;
    },

    /**
     * Get category display name
     * @param {string} category - Category slug
     * @returns {string} Display name
     */
    getCategoryName(category) {
      const names = {
        mtg: "MTG",
        props: "Props & Signs",
        accessories: "Accessories",
        all: "All Products",
      };
      return names[category] || category;
    },
  };

  // Export to window
  window.AdditiveArtisanUtils = utils;
})(window);
