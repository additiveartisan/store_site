/**
 * Additive Artisan - Main JavaScript
 * Cutsie 3D Printing with a Personal Touch
 */

(function () {
  "use strict";

  // =========================================================================
  // DOM Elements - Cached for performance
  // =========================================================================
  let navToggle, navLinks, navLinkItems, sections, filterButtons, productCards;
  let orderSearchForm, contactForm, themeToggle;

  /**
   * Cache DOM elements
   */
  function cacheDOMElements() {
    navToggle = document.querySelector(".nav-toggle");
    navLinks = document.querySelector(".nav-links");
    navLinkItems = document.querySelectorAll(".nav-link");
    sections = document.querySelectorAll(".section");
    filterButtons = document.querySelectorAll(".filter-btn");
    productCards = document.querySelectorAll(".product-card");
    orderSearchForm = document.getElementById("order-search-form");
    contactForm = document.getElementById("contact-form");
    themeToggle = document.getElementById("theme-toggle");
  }

  // =========================================================================
  // Theme Management
  // =========================================================================

  /**
   * Get the current theme from localStorage or system preference
   * @returns {string} 'light' or 'dark'
   */
  function getPreferredTheme() {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  /**
   * Set the theme on the document
   * @param {string} theme - 'light' or 'dark'
   */
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Update aria-label for accessibility
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
      );
    }
  }

  /**
   * Toggle between light and dark themes
   * @param {Event} e - Click event (optional)
   */
  function toggleTheme(e) {
    // Add transitioning class for visual effect
    document.body.classList.add("theme-transitioning");

    // Add pulse animation to the toggle button
    if (themeToggle) {
      themeToggle.classList.add("pulsing");
      setTimeout(() => {
        themeToggle.classList.remove("pulsing");
      }, 600);
    }

    // Set CSS variables for radial gradient position if event is provided
    if (e && e.clientX !== undefined && e.clientY !== undefined) {
      document.body.style.setProperty("--theme-transition-x", `${e.clientX}px`);
      document.body.style.setProperty("--theme-transition-y", `${e.clientY}px`);
    }

    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Remove transitioning class after animation completes
    setTimeout(() => {
      document.body.classList.remove("theme-transitioning");
    }, 600);
  }

  /**
   * Initialize theme based on user preference
   */
  function initTheme() {
    const theme = getPreferredTheme();
    setTheme(theme);

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          setTheme(e.matches ? "dark" : "light");
        }
      });
  }

  // =========================================================================
  // Navigation
  // =========================================================================

  /**
   * Toggle mobile navigation menu
   */
  function toggleMobileNav() {
    if (!navToggle || !navLinks) return;

    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !isExpanded);
    navLinks.classList.toggle("active");
  }

  /**
   * Close mobile navigation menu
   */
  function closeMobileNav() {
    if (!navToggle || !navLinks) return;

    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("active");
  }

  /**
   * Navigate to a section
   * @param {string} sectionId - The ID of the section to navigate to
   */
  function navigateToSection(sectionId) {
    if (!sectionId) return;

    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    // Hide all sections and show target
    sections.forEach((section) => {
      section.classList.toggle("active", section === targetSection);
    });

    // Update active nav link
    navLinkItems.forEach((link) => {
      link.classList.toggle("active", link.dataset.section === sectionId);
    });

    // Update URL hash without scrolling
    if (history.pushState) {
      history.pushState(null, "", `#${sectionId}`);
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Close mobile nav if open
    closeMobileNav();
  }

  /**
   * Handle navigation link click
   * @param {Event} e - Click event
   */
  function handleNavClick(e) {
    e.preventDefault();
    // Find the element with data-section attribute
    const target = e.target.closest("[data-section]");
    const sectionId = target ? target.dataset.section : e.currentTarget?.dataset.section;
    if (sectionId) {
      navigateToSection(sectionId);
    }
  }

  /**
   * Handle hash change (browser back/forward)
   */
  function handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      navigateToSection(hash);
    } else {
      navigateToSection("home");
    }
  }

  // =========================================================================
  // Product Filtering
  // =========================================================================
  // NOTE: Product filtering is now handled by js/products.js

  // =========================================================================
  // Form Validation
  // =========================================================================

  /**
   * Show inline error message for form field
   * @param {string} message - Error message to display
   * @param {HTMLElement} inputElement - Input element to attach error to
   */
  function showFormError(message, inputElement) {
    if (!inputElement) return;

    // Find or create error element
    const formGroup = inputElement.closest('.form-group');
    if (!formGroup) return;

    let errorElement = formGroup.querySelector('.field-error');

    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'field-error';
      errorElement.setAttribute('role', 'alert');
      const errorId = `${inputElement.id}-error`;
      errorElement.id = errorId;
      formGroup.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    inputElement.setAttribute('aria-invalid', 'true');
    inputElement.setAttribute('aria-describedby', errorElement.id);
    inputElement.focus();
  }

  /**
   * Clear error message for form field
   * @param {HTMLElement} inputElement - Input element to clear error from
   */
  function clearFormError(inputElement) {
    if (!inputElement) return;

    const formGroup = inputElement.closest('.form-group');
    if (!formGroup) return;

    const errorElement = formGroup.querySelector('.field-error');
    if (errorElement) {
      errorElement.classList.add('hidden');
      errorElement.textContent = '';
    }

    inputElement.removeAttribute('aria-invalid');
    inputElement.removeAttribute('aria-describedby');
  }

  /**
   * Clear all form errors
   * @param {HTMLFormElement} form - Form to clear errors from
   */
  function clearAllFormErrors(form) {
    if (!form) return;
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => clearFormError(input));
  }

  /**
   * Show success message for form submission
   * @param {string} message - Success message to display
   * @param {HTMLFormElement} form - Form to attach success message to
   */
  function showFormSuccess(message, form) {
    if (!form) return;

    let successElement = form.querySelector('.form-success');

    if (!successElement) {
      successElement = document.createElement('div');
      successElement.className = 'form-success';
      successElement.setAttribute('role', 'status');
      successElement.setAttribute('aria-live', 'polite');
      form.appendChild(successElement);
    }

    successElement.textContent = message;
    successElement.classList.remove('hidden');

    setTimeout(() => {
      successElement.classList.add('hidden');
    }, 5000);
  }

  // =========================================================================
  // Order Tracking
  // =========================================================================

  /**
   * Check URL for order parameter on page load
   * Auto-submits form if both order and email parameters are present
   */
  function checkOrderParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderParam = urlParams.get("order");
    const emailParam = urlParams.get("email");

    if (orderParam && window.location.hash === "#track") {
      const orderIdInput = document.getElementById("order-id");
      const emailInput = document.getElementById("order-email");

      if (orderIdInput) {
        orderIdInput.value = orderParam;
      }

      // Set email if provided
      if (emailParam && emailInput) {
        emailInput.value = emailParam;
      }

      // Auto-submit if order ID is provided (email is optional)
      setTimeout(() => {
        const form = document.getElementById("order-search-form");
        if (form) {
          form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
      }, 100);
    }
  }

  /**
   * Handle order search form submission
   * Fetches order status from Cloudflare Workers API and displays results
   * @param {Event} e - Submit event
   */
  async function handleOrderSearch(e) {
    e.preventDefault();

    const orderIdInput = document.getElementById("order-id");
    const emailInput = document.getElementById("order-email");

    if (!orderIdInput) return;

    // Clear previous errors
    clearAllFormErrors(e.target);

    const orderId = orderIdInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : "";

    // Validate order ID presence
    if (!orderId) {
      showFormError("Please enter an order number.", orderIdInput);
      return;
    }

    // Validate order ID format (AA-2024-0047)
    const orderIdPattern = /^[A-Z]{2}-\d{4}-\d{4}$/;
    if (!orderIdPattern.test(orderId)) {
      showFormError("Invalid order ID format. Expected: AA-2024-0047", orderIdInput);
      return;
    }

    // Check if email field is visible (not hidden)
    const emailFieldVisible = emailInput && !emailInput.closest('.form-group').classList.contains('hidden');

    // If email field is visible and required, validate it
    if (emailFieldVisible && !email) {
      showFormError("Please enter your email address.", emailInput);
      return;
    }

    // Improved email validation (only if email is provided)
    if (email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showFormError("Please enter a valid email address.", emailInput);
        return;
      }
    }

    // Check if tracker module is loaded
    if (!window.AdditiveArtisanTracker) {
      showFormError("Order tracking is currently unavailable. Please try again later.", orderIdInput);
      return;
    }

    try {
      // Show loading state
      window.AdditiveArtisanTracker.showLoading();

      // Fetch order status from API
      const orderData = await window.AdditiveArtisanTracker.fetchOrderStatus(orderId, email);

      // Display order status with emoji and timeline
      window.AdditiveArtisanTracker.displayOrderStatus(orderData);

    } catch (error) {
      window.AdditiveArtisanTracker.displayError(
        error.message || "Unable to find order. Please check your order number and email address."
      );
    }
  }

  // =========================================================================
  // Contact Form
  // =========================================================================

  /**
   * Handle contact form submission
   * @param {Event} e - Submit event
   */
  function handleContactSubmit(e) {
    e.preventDefault();

    if (!contactForm) return;

    // Clear previous errors
    clearAllFormErrors(contactForm);

    const formData = new FormData(contactForm);
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const subject = formData.get("subject");
    const message = formData.get("message")?.trim();

    // Validate individual fields
    const nameInput = contactForm.querySelector("#contact-name");
    const emailInput = contactForm.querySelector("#contact-email");
    const messageInput = contactForm.querySelector("#contact-message");

    if (!name && nameInput) {
      showFormError("Please enter your name.", nameInput);
      return;
    }

    if (!email && emailInput) {
      showFormError("Please enter your email address.", emailInput);
      return;
    }

    // Improved email validation
    if (email && emailInput) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        showFormError("Please enter a valid email address.", emailInput);
        return;
      }
    }

    if (!message && messageInput) {
      showFormError("Please enter a message.", messageInput);
      return;
    }

    // Placeholder for form submission
    // This would be replaced with actual form handling (e.g., Formspree, email API)
    showFormSuccess(`Thank you for your message, ${name}! We'll get back to you soon.`, contactForm);
    contactForm.reset();
  }

  // =========================================================================
  // Utility Functions
  // =========================================================================

  /**
   * Update copyright year dynamically
   */
  function updateCopyrightYear() {
    const yearElement = document.getElementById("copyright-year");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  // =========================================================================
  // Image Sizing - Now handled by CSS clamp()
  // =========================================================================
  // Removed JavaScript image sizing code - all responsive sizing now done with CSS
  // Note: Debounce utility is available via window.AdditiveArtisanUtils.debounce()

  // =========================================================================
  // Initialization
  // =========================================================================

  /**
   * Show global error message to user
   * @param {string} message - Error message to display
   */
  function showGlobalError(message) {
    // Create or update error banner
    let errorBanner = document.getElementById('global-error-banner');
    if (!errorBanner) {
      errorBanner = document.createElement('div');
      errorBanner.id = 'global-error-banner';
      errorBanner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: var(--color-accent);
        color: white;
        padding: 1rem;
        text-align: center;
        z-index: 10000;
        font-weight: 500;
      `;
      document.body.insertBefore(errorBanner, document.body.firstChild);
    }
    errorBanner.textContent = message;
  }

  /**
   * Setup theme toggle listener
   */
  function setupThemeListeners() {
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
  }

  /**
   * Setup all navigation-related event listeners
   */
  function setupNavigationListeners() {
    // Mobile nav toggle
    if (navToggle) {
      navToggle.addEventListener("click", toggleMobileNav);
    }

    // Navigation links - use event delegation on parent
    if (navLinks) {
      navLinks.addEventListener("click", (e) => {
        const navLink = e.target.closest(".nav-link");
        if (navLink) {
          handleNavClick(e);
        }
      });
    }

    // Use event delegation for all section navigation (buttons, CTAs, etc.)
    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-section]");
      if (target && !target.classList.contains("nav-link")) {
        handleNavClick(e);
      }
    });

    // Close mobile nav when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".main-nav") &&
        navLinks.classList.contains("active")
      ) {
        closeMobileNav();
      }
    });

    // Handle escape key to close mobile nav
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        closeMobileNav();
        navToggle.focus();
      }
    });
  }

  /**
   * Setup form event listeners (order search and contact forms)
   */
  function setupFormListeners() {
    // Order search form
    if (orderSearchForm) {
      orderSearchForm.addEventListener("submit", handleOrderSearch);

      // Clear errors on input
      const orderFormInputs = orderSearchForm.querySelectorAll('input');
      orderFormInputs.forEach(input => {
        input.addEventListener('input', () => clearFormError(input));
      });
    }

    // Contact form
    if (contactForm) {
      contactForm.addEventListener("submit", handleContactSubmit);

      // Clear errors on input
      const contactFormInputs = contactForm.querySelectorAll('input, textarea');
      contactFormInputs.forEach(input => {
        input.addEventListener('input', () => clearFormError(input));
      });
    }
  }

  /**
   * Setup routing and initial page state
   */
  function setupRouting() {
    // Handle initial hash/route
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Check for order parameter in URL
    checkOrderParam();
  }

  /**
   * Initialize products module
   */
  async function initProductsModule() {
    if (window.AdditiveArtisanProducts) {
      try {
        await window.AdditiveArtisanProducts.initProducts();
        productCards = document.querySelectorAll(".product-card");
      } catch (error) {
        // Continue initialization even if products fail to load
      }
    }
  }

  /**
   * Register service worker for PWA support and offline functionality
   */
  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
          }
        });
      });
    } catch (error) {
      // Service worker registration failed silently
    }
  }

  /**
   * Initialize all event listeners and functionality
   */
  async function init() {
    try {
      // Cache DOM elements
      cacheDOMElements();

      // Initialize theme first (before any visual rendering)
      initTheme();

      // Initialize products (load and render)
      await initProductsModule();

      // Update copyright year
      updateCopyrightYear();

      // Setup all event listeners
      setupThemeListeners();
      setupNavigationListeners();
      setupFormListeners();
      setupRouting();

      // Register service worker for PWA support (non-blocking)
      registerServiceWorker();

    } catch (error) {
      showGlobalError('Unable to load the website properly. Please refresh the page.');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
