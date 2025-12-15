# 📖 JavaScript API Reference

Complete reference for public JavaScript APIs exposed by Additive Artisan.

---

## 📋 Table of Contents

- [AdditiveArtisanProducts API](#-additiveartisanproducts-api)
- [AdditiveArtisanUtils API](#-additiveartisanutils-api)
- [Usage Examples](#-usage-examples)
- [Product Data Structure](#-product-data-structure)

---

## 📦 AdditiveArtisanProducts API

**Available at:** `window.AdditiveArtisanProducts`
**Purpose:** Manage and render product data
**Source:** [js/products.js](../js/products.js)

### `initProducts()`

Initializes product system - loads data and renders products.

```javascript
await window.AdditiveArtisanProducts.initProducts();
// Returns: Promise<boolean> - true if successful
```

**Use:** Call on page load to initialize product display.

### `loadProducts()`

Fetches products from data source (Airtable or local JSON).

```javascript
const data = await window.AdditiveArtisanProducts.loadProducts();
console.log(data.products);  // Array<Product>
console.log(data.featured);  // Array<FeaturedItem>
console.log(data.metadata);  // {version, lastUpdated, source}
```

**Use:** Manually reload products after data changes.

### `renderProducts(products, filter)`

Renders product cards to page.

```javascript
const products = window.AdditiveArtisanProducts.getAllProducts();
window.AdditiveArtisanProducts.renderProducts(products, 'mtg');
```

**Parameters:**
- `products` (Array) - Product objects
- `filter` (String) - Category: `'all'`, `'mtg'`, `'props'`, etc.

**Use:** Re-render products after filtering or data update.

### `renderFeatured(featuredItems)`

Renders featured items to homepage.

```javascript
const featured = window.AdditiveArtisanProducts.getFeaturedProducts();
window.AdditiveArtisanProducts.renderFeatured(featured);
```

**Use:** Update featured section without full page reload.

### `getProductsByCategory(category)`

Gets filtered products by category.

```javascript
const mtgProducts = window.AdditiveArtisanProducts.getProductsByCategory('mtg');
// Returns: Array<Product>
```

**Use:** Get products for custom filtering or display.

### `getFeaturedProducts()`

Gets products marked as featured, sorted by `featuredOrder`.

```javascript
const featured = window.AdditiveArtisanProducts.getFeaturedProducts();
// Returns: Array<Product> sorted by featuredOrder
```

**Use:** Display featured products in custom location.

### `getAllProducts()`

Gets all active products.

```javascript
const allProducts = window.AdditiveArtisanProducts.getAllProducts();
// Returns: Array<Product>
```

**Use:** Access full product list for custom operations.

### `getCurrentFilter()`

Gets currently active category filter.

```javascript
const currentFilter = window.AdditiveArtisanProducts.getCurrentFilter();
// Returns: 'all', 'mtg', 'props', etc.
```

**Use:** Check which category is currently displayed.

### `setCategoryName(category, displayName)`

Sets custom display name for a category.

```javascript
window.AdditiveArtisanProducts.setCategoryName('mtg', 'Magic: The Gathering');
```

**Use:** Customize how category names appear on filter buttons.

### `getCategoryNames()`

Gets all category display name mappings.

```javascript
const names = window.AdditiveArtisanProducts.getCategoryNames();
// Returns: {mtg: 'MTG', props: 'Props + Signs', ...}
```

---

## 🛠️ AdditiveArtisanUtils API

**Available at:** `window.AdditiveArtisanUtils`
**Purpose:** Utility functions for formatting, validation, and UI
**Source:** [js/utils.js](../js/utils.js)

### `formatPrice(price)`

Formats number as USD currency.

```javascript
AdditiveArtisanUtils.formatPrice(15.99);  // "$15.99"
AdditiveArtisanUtils.formatPrice(100);    // "$100.00"
```

### `escapeHTML(text)`

Escapes HTML to prevent XSS attacks.

```javascript
const userInput = '<script>alert("xss")</script>';
const safe = AdditiveArtisanUtils.escapeHTML(userInput);
// Returns: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
```

**⚠️ Important:** Always use on user-generated content before displaying.

### `isValidURL(url)`

Validates URL format.

```javascript
AdditiveArtisanUtils.isValidURL('https://example.com');  // true
AdditiveArtisanUtils.isValidURL('not-a-url');            // false
```

### `formatDate(isoDate)`

Formats ISO date to readable string.

```javascript
AdditiveArtisanUtils.formatDate('2024-12-09T00:00:00Z');
// Returns: "December 9, 2024"
```

### `showLoading(containerId)`

Displays loading spinner in container.

```javascript
AdditiveArtisanUtils.showLoading('product-grid');
```

### `showError(containerId, message)`

Displays error message in container.

```javascript
AdditiveArtisanUtils.showError('product-grid', 'Failed to load products');
```

### `debounce(func, wait)`

Debounces function calls for performance.

```javascript
const debouncedSearch = AdditiveArtisanUtils.debounce(searchProducts, 300);
searchInput.addEventListener('input', debouncedSearch);
```

**Use:** Limit expensive operations triggered by rapid events (typing, scrolling, resizing).

---

## 💡 Usage Examples

### Example 1: Custom Product Display

Display only MTG products:

```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await window.AdditiveArtisanProducts.initProducts();

  const mtgProducts = window.AdditiveArtisanProducts.getProductsByCategory('mtg');
  console.log(`Found ${mtgProducts.length} MTG products`);

  window.AdditiveArtisanProducts.renderProducts(mtgProducts, 'mtg');
});
```

### Example 2: Custom Featured Section

Create custom featured display:

```javascript
async function displayFeaturedProducts() {
  const featured = window.AdditiveArtisanProducts.getFeaturedProducts();

  const container = document.getElementById('custom-featured');
  container.innerHTML = featured.map(product => `
    <div class="custom-card">
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <span>${AdditiveArtisanUtils.formatPrice(product.price)}</span>
    </div>
  `).join('');
}

displayFeaturedProducts();
```

### Example 3: Search Products

Implement product search with debouncing:

```javascript
const searchInput = document.getElementById('search');

const debouncedSearch = AdditiveArtisanUtils.debounce((query) => {
  const allProducts = window.AdditiveArtisanProducts.getAllProducts();

  const results = allProducts.filter(product =>
    product.title.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  );

  window.AdditiveArtisanProducts.renderProducts(results, 'all');
  console.log(`Found ${results.length} products matching "${query}"`);
}, 300);

searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
```

### Example 4: Product Analytics

Track product stats:

```javascript
const products = window.AdditiveArtisanProducts.getAllProducts();

// Count by category
const categoryCounts = {};
products.forEach(product => {
  categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
});
console.log('Products by category:', categoryCounts);

// Average price
const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
console.log(`Average: ${AdditiveArtisanUtils.formatPrice(avgPrice)}`);

// Most expensive
const mostExpensive = products.reduce((max, p) => p.price > max.price ? p : max);
console.log(`Highest: ${mostExpensive.title} - ${AdditiveArtisanUtils.formatPrice(mostExpensive.price)}`);
```

### Example 5: Custom Category Names

Customize category display names:

```javascript
// Set before initializing
window.AdditiveArtisanProducts.setCategoryName('mtg', 'Magic: The Gathering');
window.AdditiveArtisanProducts.setCategoryName('props', 'Gaming Props + Signs');
window.AdditiveArtisanProducts.setCategoryName('dice', 'Dice + Tokens');

await window.AdditiveArtisanProducts.initProducts();

// Get all mappings
const names = window.AdditiveArtisanProducts.getCategoryNames();
console.log('Category names:', names);
```

---

## 🔄 Product Data Structure

Product object structure:

```javascript
{
  id: string,              // Unique ID (e.g., "prod_001")
  title: string,           // Product name
  description: string,     // Short description
  price: number,           // Price in USD
  category: string,        // Category slug ('mtg', 'props', etc.)
  imageUrl: string|null,   // Product image URL
  modelUrl: string|null,   // 3D model URL (future)
  featured: boolean,       // Show in featured section
  featuredOrder: number|null, // Display order (1, 2, 3)
  etsyUrl: string,         // Etsy product link
  active: boolean,         // Show on site
  dateAdded: string,       // ISO date
  tags: Array<string>      // Search tags
}
```

---

## 🔍 Source Files

- [js/products.js](../js/products.js) - Product management
- [js/utils.js](../js/utils.js) - Utility functions
- [script.js](../script.js) - Site initialization

---

## 📚 Related Documentation

- [Main README](../readme.md) - Site overview
- [Airtable Setup](airtable_setup.md) - Database integration
- [Development Guide](development.md) - Best practices

---
