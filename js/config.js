/**
 * Additive Artisan Configuration
 * All site configuration in one place
 *
 * This file contains all configurable settings for the Additive Artisan website.
 * Edit this file to customize your site without touching other code files.
 */

(function (window) {
  "use strict";

  window.AdditiveArtisanConfig = {
    // =========================================================================
    // Order Tracker Settings
    // =========================================================================
    orderTracker: {
      /**
       * Cloudflare Workers API Endpoint
       *
       * TODO: Replace with your Cloudflare Worker URL after setup
       *
       * Example: "https://additiveartisan-orders.YOUR_SUBDOMAIN.workers.dev"
       *
       * See docs/cloudflare_workers_setup.md for setup instructions
       */
      apiEndpoint: "https://YOUR_WORKER.workers.dev/orders",

      /**
       * Animation Mode
       *
       * Options:
       * - "emoji" (default) - Use emoji placeholders (👋 📋 🖨️ etc.)
       * - "lottie" - Use Lottie animations (requires lottieUrls configured)
       *
       * To switch to Lottie animations:
       * 1. Uncomment Lottie player script in index.html
       * 2. Update lottieUrls below with your animation URLs
       * 3. Change this value to "lottie"
       */
      animationMode: "emoji",

      /**
       * Lottie Animation URLs
       *
       * Add your custom Artie animation URLs here when ready.
       * Each URL should point to a publicly accessible Lottie JSON file.
       *
       * Steps to get Lottie URLs:
       * 1. Create account at https://lottiefiles.com
       * 2. Upload your 8 Artie animations
       * 3. Get public JSON URLs for each animation
       * 4. Replace the placeholder URLs below
       *
       * Status mapping:
       * - received: Order Received (wave animation)
       * - queue: In Queue (clipboard animation)
       * - printing: Printing (printer animation)
       * - processing: Post-Processing (tools animation)
       * - quality: Quality Control (magnifying glass animation)
       * - packaging: Packaging (box animation)
       * - shipped: Shipped (plane animation)
       * - delivered: Delivered (celebration animation)
       */
      lottieUrls: {
        received: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_1.json",
        queue: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_2.json",
        printing: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_3.json",
        processing: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_4.json",
        quality: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_5.json",
        packaging: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_6.json",
        shipped: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_7.json",
        delivered: "https://assets.lottiefiles.com/packages/YOUR_ANIMATION_URL_8.json",
      },
    },

    // =========================================================================
    // Products Settings
    // =========================================================================
    products: {
      /**
       * Product-related configuration can be added here in the future
       * Currently, product settings are managed in js/products.js
       */
    },

    // =========================================================================
    // Site Settings
    // =========================================================================
    site: {
      /**
       * General site configuration can be added here in the future
       */
    },
  };
})(window);
