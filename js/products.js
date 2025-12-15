/**
 * Product Rendering Engine for Additive Artisan
 * Handles dynamic product card generation and filtering
 */

(function (window) {
  "use strict";

  const utils = window.AdditiveArtisanUtils;
  let allProducts = [];
  let currentFilter = "all";

  /**
   * Load products from data source
   * @returns {Promise<Array>} Array of products
   */
  async function loadProducts() {
    try {
      // For now, load from JSON file
      // Later: add Airtable integration with fallback
      const response = await fetch("data/products.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      allProducts = data.products.filter((p) => p.active);
      return data;
    } catch (error) {
      // Return default empty structure
      return {
        products: [],
        featured: [],
        metadata: { version: "1.0.0", lastUpdated: new Date().toISOString() },
      };
    }
  }

  /**
   * Create product card HTML
   * @param {object} product - Product object
   * @returns {string} HTML string
   */
  function createProductCardHTML(product) {
    const imageHTML = product.imageUrl
      ? `<img src="${product.imageUrl}" alt="${utils.escapeHTML(product.title)}" loading="lazy" />`
      : `<div class="model-viewer-placeholder"><span>3D Preview</span></div>`;

    return `
      <article class="product-card" data-category="${product.category}" data-id="${product.id}">
        <div class="product-image">
          ${imageHTML}
        </div>
        <div class="product-info">
          <h3 class="product-title">${utils.escapeHTML(product.title)}</h3>
          <p class="product-description">${utils.escapeHTML(product.description)}</p>
          <div class="product-footer">
            <span class="product-price">${utils.formatPrice(product.price)}</span>
            <a href="${product.etsyUrl}"
               class="btn btn--secondary"
               target="_blank"
               rel="noopener noreferrer">
              Order on Etsy
            </a>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Create featured card HTML
   * @param {object} item - Featured item object
   * @returns {string} HTML string
   */
  function createFeaturedCardHTML(item) {
    const imageHTML = item.imageUrl
      ? `<img src="${item.imageUrl}" alt="${utils.escapeHTML(item.title)}" loading="lazy" />`
      : `<span>${utils.escapeHTML(item.title)}</span>`;

    return `
      <article class="featured-card" data-id="${item.id}">
        <div class="featured-image placeholder-image">
          ${imageHTML}
        </div>
        <h3>${utils.escapeHTML(item.title)}</h3>
        <p>${utils.escapeHTML(item.description)}</p>
      </article>
    `;
  }

  /**
   * Render products to grid
   * @param {Array} products - Array of product objects
   * @param {string} filter - Category filter
   */
  function renderProducts(products, filter = "all") {
    const container = document.getElementById("product-grid");
    if (!container) {
      return;
    }

    // Filter products
    const filteredProducts =
      filter === "all"
        ? products
        : products.filter((p) => p.category === filter);

    // Clear container
    container.innerHTML = "";

    // Create document fragment for performance
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement("div");

    // Add products to fragment
    filteredProducts.forEach((product) => {
      tempDiv.innerHTML = createProductCardHTML(product);
      fragment.appendChild(tempDiv.firstElementChild);
    });

    // Add fragment to container
    container.appendChild(fragment);

    // Store current filter
    currentFilter = filter;

    // Update filter buttons
    updateFilterButtons(filter);
  }

  /**
   * Render featured items
   * @param {Array} featuredItems - Array of featured item objects
   */
  function renderFeatured(featuredItems) {
    const container = document.getElementById("featured-grid");
    if (!container) {
      return;
    }

    // Clear container
    container.innerHTML = "";

    // Create document fragment
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement("div");

    // Add featured items to fragment
    featuredItems.forEach((item) => {
      tempDiv.innerHTML = createFeaturedCardHTML(item);
      fragment.appendChild(tempDiv.firstElementChild);
    });

    // Add fragment to container
    container.appendChild(fragment);
  }

  /**
   * Update filter button active states
   * @param {string} filter - Active filter
   */
  function updateFilterButtons(filter) {
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      if (btn.dataset.filter === filter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  /**
   * Handle filter button click
   * @param {Event} e - Click event
   */
  function handleFilterClick(e) {
    const button = e.target.closest(".filter-btn");
    if (!button || !button.dataset.filter) return;

    const filter = button.dataset.filter;
    renderProducts(allProducts, filter);

    // Add fade-in animation to cards
    const cards = document.querySelectorAll(".product-card");
    cards.forEach((card, index) => {
      card.style.animation = `fadeIn 0.3s ease ${index * 0.05}s both`;
    });
  }

  /**
   * Category display names mapping
   */
  const categoryNames = {
    mtg: "MTG",
    props: "Props & Signs",
    accessories: "Accessories",
    dice: "Dice & Tokens",
    storage: "Storage",
    custom: "Custom Orders",
  };

  /**
   * Generate filter buttons from product categories
   */
  function generateFilters() {
    const filterContainer = document.querySelector(".product-filters");
    if (!filterContainer) return;

    // Get unique categories from products
    const categories = [...new Set(allProducts.map((p) => p.category))].sort();

    // Clear existing filters
    filterContainer.innerHTML = "";

    // Create "All" button
    const allButton = document.createElement("button");
    allButton.className = "filter-btn active";
    allButton.dataset.filter = "all";
    allButton.textContent = "All";
    filterContainer.appendChild(allButton);

    // Create category buttons
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.dataset.filter = category;
      button.textContent = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
      filterContainer.appendChild(button);
    });
  }

  /**
   * Initialize product filtering
   */
  function initFilters() {
    const filterContainer = document.querySelector(".product-filters");
    if (filterContainer) {
      // Generate dynamic filters
      generateFilters();

      // Add click listener
      filterContainer.addEventListener("click", handleFilterClick);
    }
  }

  /**
   * Initialize product system
   */
  async function initProducts() {
    try {
      // Show loading state
      utils.showLoading("product-grid");
      utils.showLoading("featured-grid");

      // Load data
      const data = await loadProducts();

      // Check if we have products
      if (!data.products || data.products.length === 0) {
        utils.showError("product-grid", "No products available at this time.");
        utils.showError("featured-grid", "");
        return false;
      }

      // Render products and featured items
      renderProducts(data.products, "all");
      renderFeatured(data.featured);

      // Initialize filters
      initFilters();

      return true;
    } catch (error) {
      utils.showError("product-grid");
      utils.showError("featured-grid");
      return false;
    }
  }

  /**
   * Get products by category
   * @param {string} category - Category to filter
   * @returns {Array} Filtered products
   */
  function getProductsByCategory(category) {
    if (category === "all") return allProducts;
    return allProducts.filter((p) => p.category === category);
  }

  /**
   * Get featured products
   * @returns {Array} Products marked as featured
   */
  function getFeaturedProducts() {
    return allProducts
      .filter((p) => p.featured)
      .sort((a, b) => (a.featuredOrder || 999) - (b.featuredOrder || 999));
  }

  /**
   * Add or update category display name
   * @param {string} category - Category key
   * @param {string} displayName - Display name for the category
   */
  function setCategoryName(category, displayName) {
    categoryNames[category] = displayName;
  }

  /**
   * Get all category names
   * @returns {object} Category names mapping
   */
  function getCategoryNames() {
    return { ...categoryNames };
  }

  // Export functions to window
  window.AdditiveArtisanProducts = {
    initProducts,
    loadProducts,
    renderProducts,
    renderFeatured,
    getProductsByCategory,
    getFeaturedProducts,
    getAllProducts: () => allProducts,
    getCurrentFilter: () => currentFilter,
    setCategoryName,
    getCategoryNames,
  };
})(window);
