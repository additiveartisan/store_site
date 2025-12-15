/**
 * Order Tracker Module for Additive Artisan
 * Handles order status fetching and display with emoji animations
 */

(function (window) {
  "use strict";

  // =========================================================================
  // Configuration
  // =========================================================================

  // Get API endpoint from config file
  // Configure your endpoint in js/config.js
  const API_ENDPOINT = window.AdditiveArtisanConfig?.orderTracker?.apiEndpoint || "";

  /**
   * Status configuration with emoji placeholders and messages
   * Maps Airtable status values to display information
   */
  const STATUS_CONFIG = {
    "Order Received": {
      emoji: "👋",
      message: "We got your order!",
      step: "received",
      description: "Your order has been received and logged into our system.",
    },
    "In Queue": {
      emoji: "📋",
      message: "Spot reserved in print queue",
      step: "queue",
      description: "Your order is in the production queue.",
    },
    "Printing": {
      emoji: "🖨️",
      message: "Your print is being created",
      step: "printing",
      description: "Your item is currently being 3D printed.",
    },
    "Post-Processing": {
      emoji: "🔧",
      message: "Cleaning and finishing",
      step: "processing",
      description: "Removing supports and cleaning up your print.",
    },
    "Quality Control": {
      emoji: "🔍",
      message: "Final inspection",
      step: "quality",
      description: "Ensuring your print meets our quality standards.",
    },
    "Packaging": {
      emoji: "📦",
      message: "Carefully boxing your order",
      step: "packaging",
      description: "Safely packaging your order for shipment.",
    },
    "Shipped": {
      emoji: "✈️",
      message: "On its way to you!",
      step: "shipped",
      description: "Your order has been handed to the carrier.",
    },
    "Delivered": {
      emoji: "🎉",
      message: "Enjoy your print!",
      step: "delivered",
      description: "Your order has been delivered. Thanks for your order!",
    },
  };

  // Default status if unknown
  const DEFAULT_STATUS = {
    emoji: "🐱",
    message: "Processing your order",
    step: "received",
    description: "Your order is being processed.",
  };

  // =========================================================================
  // Animation Rendering
  // =========================================================================

  /**
   * Render animation based on mode (emoji or Lottie)
   * Supports both emoji placeholders and Lottie animations
   * Mode is controlled in js/config.js
   *
   * @param {string} step - Status step name (e.g., "received", "printing")
   * @param {object} statusConfig - Status configuration object
   */
  function renderAnimation(step, statusConfig) {
    const statusEmoji = document.getElementById("status-emoji");
    if (!statusEmoji) return;

    const config = window.AdditiveArtisanConfig?.orderTracker;
    const mode = config?.animationMode || "emoji";

    if (mode === "lottie" && config?.lottieUrls?.[step]) {
      // Lottie mode - render Lottie player
      const lottieUrl = config.lottieUrls[step];

      // Validate URL to prevent XSS
      if (!window.AdditiveArtisanUtils?.isValidURL(lottieUrl)) {
        statusEmoji.textContent = statusConfig.emoji;
        return;
      }

      // Create element programmatically (safe from XSS)
      const player = document.createElement('lottie-player');
      player.setAttribute('src', lottieUrl);
      player.setAttribute('background', 'transparent');
      player.setAttribute('speed', '1');
      player.setAttribute('style', 'width: 150px; height: 150px;');
      player.setAttribute('loop', '');
      player.setAttribute('autoplay', '');

      statusEmoji.innerHTML = '';
      statusEmoji.appendChild(player);
    } else {
      // Emoji mode (default) - render emoji character
      statusEmoji.textContent = statusConfig.emoji;
    }
  }

  // =========================================================================
  // Private Functions
  // =========================================================================

  /**
   * Get status configuration for a given status string
   * @param {string} status - Status from Airtable
   * @returns {object} Status configuration object
   */
  function getStatusConfig(status) {
    return STATUS_CONFIG[status] || DEFAULT_STATUS;
  }

  /**
   * Get all status steps in order
   * @returns {array} Array of status step names
   */
  function getStatusSteps() {
    return [
      "received",
      "queue",
      "printing",
      "processing",
      "quality",
      "packaging",
      "shipped",
      "delivered",
    ];
  }

  /**
   * Get index of current status in the timeline
   * @param {string} step - Current status step
   * @returns {number} Index in timeline (0-7)
   */
  function getStatusIndex(step) {
    const steps = getStatusSteps();
    return steps.indexOf(step);
  }

  // =========================================================================
  // Public API Functions
  // =========================================================================

  /**
   * Fetch order status from Cloudflare Workers API
   * @param {string} orderId - Order ID to look up
   * @param {string} email - Customer email address (optional)
   * @returns {Promise<object>} Order data or error
   */
  async function fetchOrderStatus(orderId, email = "") {
    try {
      // Construct API URL with query parameters
      // Email is optional - only include if provided
      let url = `${API_ENDPOINT}?orderId=${encodeURIComponent(orderId)}`;
      if (email) {
        url += `&email=${encodeURIComponent(email)}`;
      }

      // Use fetchWithRetry for better reliability (timeout + retry logic)
      const response = window.AdditiveArtisanAPI
        ? await window.AdditiveArtisanAPI.fetchWithRetry(url)
        : await fetch(url);

      // Parse JSON response
      const data = await response.json();

      // Check if request was successful
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch order status");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Display order status in the UI
   * @param {object} orderData - Order data from API
   */
  function displayOrderStatus(orderData) {
    const order = orderData.order;
    const statusConfig = getStatusConfig(order.status);

    // Render animation (emoji or Lottie based on config)
    renderAnimation(statusConfig.step, statusConfig);

    // Update status title
    const statusTitle = document.querySelector(".status-title");
    if (statusTitle) {
      statusTitle.textContent = order.status;
    }

    // Update status message
    const statusMessage = document.querySelector(".status-message");
    if (statusMessage) {
      statusMessage.textContent = statusConfig.message;
    }

    // Update order details if elements exist
    updateOrderDetails(order);

    // Update timeline
    updateTimeline(statusConfig.step);

    // Show order status container
    const orderStatus = document.getElementById("order-status");
    if (orderStatus) {
      orderStatus.classList.remove("hidden");
    }
  }

  /**
   * Update order details section
   * @param {object} order - Order data
   */
  function updateOrderDetails(order) {
    // Update product name
    const productElement = document.getElementById("order-product");
    if (productElement && order.product) {
      productElement.textContent = order.product;
    }

    // Update order date
    const dateElement = document.getElementById("order-date");
    if (dateElement && order.createdDate) {
      const formattedDate = window.AdditiveArtisanUtils
        ? window.AdditiveArtisanUtils.formatDate(order.createdDate)
        : order.createdDate;
      dateElement.textContent = formattedDate;
    }

    // Update tracking number (if shipped)
    const trackingContainer = document.getElementById("tracking-container");
    const trackingNumber = document.getElementById("tracking-number");
    if (trackingContainer && trackingNumber) {
      if (order.trackingNumber) {
        trackingNumber.textContent = order.trackingNumber;
        trackingContainer.classList.remove("hidden");
      } else {
        trackingContainer.classList.add("hidden");
      }
    }

    // Show order details container
    const orderDetails = document.getElementById("order-details");
    if (orderDetails) {
      orderDetails.classList.remove("hidden");
    }
  }

  /**
   * Update timeline to show current status
   * @param {string} currentStep - Current status step name
   */
  function updateTimeline(currentStep) {
    const steps = document.querySelectorAll(".timeline-step");
    const currentIndex = getStatusIndex(currentStep);

    steps.forEach((stepElement, index) => {
      // Remove all status classes
      stepElement.classList.remove("completed", "active");

      // Add appropriate class based on position
      if (index < currentIndex) {
        stepElement.classList.add("completed");
      } else if (index === currentIndex) {
        stepElement.classList.add("active");
      }
    });
  }

  /**
   * Display error message in the UI
   * @param {string} message - Error message to display
   */
  function displayError(message) {
    const statusMessage = document.querySelector(".status-message");
    if (statusMessage) {
      // Always escape HTML to prevent XSS, even if utils module isn't loaded
      const escapedMessage = window.AdditiveArtisanUtils
        ? window.AdditiveArtisanUtils.escapeHTML(message)
        : message.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          })[m]);

      statusMessage.innerHTML = `
        <span class="error-message">❌ ${escapedMessage}</span>
      `;
    }

    // Show order status container even for errors
    const orderStatus = document.getElementById("order-status");
    if (orderStatus) {
      orderStatus.classList.remove("hidden");
    }

    // Hide timeline on error
    const timeline = document.querySelector(".status-timeline");
    if (timeline) {
      timeline.style.display = "none";
    }
  }

  /**
   * Show loading state
   */
  function showLoading() {
    const statusMessage = document.querySelector(".status-message");
    if (statusMessage) {
      statusMessage.textContent = "Looking up your order...";
    }

    // Reset mascot emoji to default
    const statusEmoji = document.getElementById("status-emoji");
    if (statusEmoji) {
      statusEmoji.textContent = "🐱";
    }

    // Show order status container
    const orderStatus = document.getElementById("order-status");
    if (orderStatus) {
      orderStatus.classList.remove("hidden");
    }

    // Reset timeline
    const steps = document.querySelectorAll(".timeline-step");
    steps.forEach((step) => {
      step.classList.remove("completed", "active");
    });

    // Show timeline
    const timeline = document.querySelector(".status-timeline");
    if (timeline) {
      timeline.style.display = "flex";
    }
  }

  /**
   * Reset the tracker UI to initial state
   */
  function resetTracker() {
    // Hide order status
    const orderStatus = document.getElementById("order-status");
    if (orderStatus) {
      orderStatus.classList.add("hidden");
    }

    // Hide order details
    const orderDetails = document.getElementById("order-details");
    if (orderDetails) {
      orderDetails.classList.add("hidden");
    }

    // Reset form
    const form = document.getElementById("order-search-form");
    if (form) {
      form.reset();
    }
  }

  /**
   * Get status configuration (for external use)
   * @param {string} status - Status name
   * @returns {object} Status configuration
   */
  function getStatus(status) {
    return getStatusConfig(status);
  }

  /**
   * Get all available statuses
   * @returns {object} All status configurations
   */
  function getAllStatuses() {
    return STATUS_CONFIG;
  }

  // =========================================================================
  // Export Public API
  // =========================================================================

  window.AdditiveArtisanTracker = {
    // Main functions
    fetchOrderStatus,
    displayOrderStatus,
    displayError,
    showLoading,
    resetTracker,

    // Timeline functions
    updateTimeline,

    // Status utilities
    getStatus,
    getAllStatuses,
    getStatusSteps,

    // Configuration
    STATUS_CONFIG,
  };
})(window);
