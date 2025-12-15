# 📚 Additive Artisan Website Documentation

Data-driven 3D printing store with Airtable CMS integration and real-time order tracking.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Managing Products](#managing-products)
- [Order Tracking](#order-tracking)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [File Structure](#file-structure)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

## Overview

A modern, responsive e-commerce site with centralized product management through Airtable. Changes sync automatically to your site within 5 minutes.

**Key Features:**
- Airtable CMS integration with automatic sync
- Real-time order tracking with visual timeline
- Dynamic category filtering
- Light/dark theme with localStorage persistence
- Cloudinary CDN for all site assets
- Responsive design (desktop, tablet, mobile)
- Fallback to local JSON when Airtable unavailable

**Architecture:**
```
Airtable → Cloudflare Workers → Website → Browser
           (secures API key)
```

## Quick Start

### First-Time Setup

**Start the local server:**
```bash
cd /path/to/store_site
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

**Verify everything works:**
- [ ] Homepage displays featured products
- [ ] "Shop" page loads with category filters
- [ ] Theme toggle switches between light/dark mode

### Setup Checklist

Complete these guides in order:

1. **Airtable Integration**
   - [ ] Follow [Airtable Setup Guide](docs/airtable_setup.md)
   - [ ] Create Airtable base with products table
   - [ ] Deploy Cloudflare Worker (see docs/cloudflare_workers_setup.md)
   - [ ] Update `js/config.js` with worker URL

2. **Order Tracking**
   - [ ] Follow [Order Tracker Setup](docs/order_tracker_setup.md)
   - [ ] Deploy Cloudflare Worker for orders (see docs/cloudflare_workers_setup.md)
   - [ ] Configure endpoint in `js/config.js`
   - [ ] Test with sample order ID

## Managing Products

### Via Airtable (Recommended)

All product changes sync automatically within 5 minutes.

**Add Product:**
- [ ] Click "+ Add record" in Airtable
- [ ] Fill required fields: Product ID, Title, Description, Price, Category
- [ ] Add Etsy URL
- [ ] Check "Active" checkbox
- [ ] Wait 5 minutes, refresh site

**Edit Product:**
- [ ] Click any field in Airtable to edit inline
- [ ] Changes sync automatically

**Feature Product (max 3):**
- [ ] Check "Featured" checkbox
- [ ] Set "Featured Order" (1=left, 2=middle, 3=right)

**Hide Product:**
- [ ] Uncheck "Active" checkbox

**Complete guide:** [Airtable Setup](docs/airtable_setup.md)

### Via Local JSON (Fallback)

Edit `data/products.json` when Airtable is unavailable:

```json
{
  "id": "prod_012",
  "title": "Product Name",
  "description": "Description here",
  "price": 20.00,
  "category": "mtg",
  "etsyUrl": "https://etsy.com/listing/...",
  "active": true,
  "featured": false,
  "featuredOrder": null
}
```

**Validate before saving:**
```bash
python3 -m json.tool data/products.json
```

### Product Fields Reference

| Field | Required | Type | Example |
|-------|----------|------|---------|
| `id` | Yes | string | `"prod_012"` |
| `title` | Yes | string | `"Modular Counter Wheel"` |
| `description` | Yes | string | `"Magnetic-top counter..."` |
| `price` | Yes | number | `15.00` |
| `category` | Yes | string | `"mtg"`, `"props"`, `"accessories"` |
| `etsyUrl` | Yes | string | Full Etsy product URL |
| `active` | Yes | boolean | `true` to display on site |
| `featured` | No | boolean | `true` for homepage hero |
| `featuredOrder` | No | number | `1`, `2`, or `3` |
| `imageUrl` | No | string | External image URL or `null` |

## Order Tracking

Real-time order status with 8-stage visual timeline.

**Setup:**
- [ ] Follow [Order Tracker Setup Guide](docs/order_tracker_setup.md)
- [ ] Deploy Cloudflare Worker for orders (see docs/cloudflare_workers_setup.md)
- [ ] Update `apiEndpoint` in `js/config.js`
- [ ] Test with sample order ID
- [ ] (Optional) Set up Make.com automation for email notifications

**Features:**
- 8-stage timeline visualization
- Emoji animations (upgradeable to Lottie)
- Direct links via order ID (no email needed)
- Auto-submit with URL parameters
- Make.com automation sends you pre-formatted Etsy messages to copy/paste

**Customer Experience:**
1. You send tracking link via Etsy message: `additiveartisan.com/#track?order=AA-2024-0047`
2. Customer clicks link → sees real-time order status
3. Artie mascot guides them through each stage

**Complete guide:** [Order Tracker Setup](docs/order_tracker_setup.md)

## Local Development

### Starting the Server

**IMPORTANT:** Must use a local server. Opening `index.html` directly will fail.

**Python (Recommended):**
```bash
cd /path/to/store_site
python3 -m http.server 8080
```
Open `http://localhost:8080`

**VS Code Live Server:**
- [ ] Install "Live Server" extension
- [ ] Right-click `index.html`
- [ ] Select "Open with Live Server"

### Debugging

**Browser DevTools** (F12 or Cmd+Option+I):
- **Console:** JavaScript errors and logs
- **Network:** File loading and API calls
- **Elements:** Inspect generated HTML

**Common Checks:**
```bash
# Validate JSON syntax
python3 -m json.tool data/products.json

# Check file size
ls -lh data/products.json
```

**Complete workflows:** [Development Guide](docs/development.md)

## Deployment

### Cloudflare Pages

**Why Cloudflare Pages:**
- 100% free (unlimited bandwidth)
- Automatic deployment from GitHub
- Works with Airtable + Order Tracker (no changes needed)
- Custom domain support with automatic HTTPS
- Lightning-fast global CDN
- Instant deployment (seconds)

**Setup:**
- [ ] Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Pages → Create a project
- [ ] Connect to GitHub repository: `additiveartisan/store_site`
- [ ] Build settings: None (static site)
- [ ] Deploy

**Deploy Updates:**
```bash
git add .
git commit -m "..."
git push origin main
```

Cloudflare automatically rebuilds and deploys within seconds.

## File Structure

```
store_site/
├── index.html              # Main page
├── styles.css              # All styling
├── script.js               # Site functionality
├── manifest.json           # PWA manifest
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine rules
├── sw.js                   # Service worker
│
├── data/
│   └── products.json       # Fallback product data
│
├── js/
│   ├── config.js           # Site configuration (edit this!)
│   ├── utils.js            # Helper functions
│   ├── api_helpers.js      # API timeout & retry logic
│   ├── products.js         # Product rendering
│   └── order_tracker.js    # Order tracking module
│
├── docs/                   # Detailed documentation
│   ├── airtable_setup.md   # Airtable guide
│   ├── order_tracker_setup.md  # Complete order tracker guide
│   ├── technical_features.md  # Technical features showcase
│   ├── cloudflare_workers_setup.md  # Cloudflare Workers setup guide
│   ├── development.md      # Dev best practices
│   └── api.md              # JavaScript API reference
│
└── readme.md               # This file
```

### Critical Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `js/config.js` | API endpoints and settings | Always edit here first |
| Airtable Base | Product database | Primary product management |
| `data/products.json` | Fallback data | Only as backup |
| `styles.css` | Styling | Design tweaks |
| `js/products.js` | Rendering logic | Only for features/bugs |
| `index.html` | Page structure | Only for layout changes |

### Cloudinary Assets

All images hosted on CDN for performance:

| Asset | Usage |
|-------|-------|
| Favicon | Browser tab icon |
| Logo | Hero + About sections |
| Artie (mascot) | About section |
| D20 dice | Contact section |
| Signatures (light/dark) | Future use |

## Configuration

All settings centralized in `js/config.js`:

**Order Tracker:**
```javascript
orderTracker: {
  apiEndpoint: "https://additiveartisan-orders.YOUR_SUBDOMAIN.workers.dev",
  animationMode: "emoji",  // or "lottie"
}
```

**Product Proxy:**
```javascript
productProxy: {
  apiEndpoint: "https://additiveartisan-products.YOUR_SUBDOMAIN.workers.dev"
}
```

**To enable Lottie animations:**
- [ ] Uncomment Lottie script in `index.html`
- [ ] Add animation URLs to `config.js`
- [ ] Change `animationMode` to `"lottie"`

## Troubleshooting

### Products Not Loading

**Quick Diagnostics:**
- [ ] Open browser console (F12) - check for errors
- [ ] Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- [ ] Test Cloudflare Worker endpoint in console:
  ```javascript
  fetch('your_worker_url').then(r => r.json()).then(console.log)
  ```
- [ ] Try fallback: Set `USE_AIRTABLE = false` in `js/products.js`

### Airtable Sync Issues

**Products not updating:**
- Wait 5 minutes (cache expiry)
- Hard refresh browser
- Verify Cloudflare Worker environment variables (secrets)

**Products missing:**
- Check "Active" is enabled in Airtable
- Verify all required fields filled
- Check Cloudflare Worker logs (wrangler tail)

**Complete troubleshooting:** [Airtable Setup Guide](docs/airtable_setup.md#troubleshooting)

### Theme Not Persisting

```javascript
// Check in browser console:
localStorage.getItem('theme')  // Should return 'light' or 'dark'

// Clear if corrupted:
localStorage.clear()
```

Note: localStorage doesn't work in private/incognito mode

### JSON Syntax Errors

**Common mistakes:**

Missing comma:
```json
{
  "id": "prod_001",
  "title": "Product"  // ❌ Missing comma
  "price": 15.00
}
```

Trailing comma:
```json
{
  "products": [
    { "id": "prod_001" },  // ❌ Extra comma
  ]
}
```

**Always validate:**
```bash
python3 -m json.tool data/products.json
```

## Quick Reference

### Commands

```bash
# Start server
python3 -m http.server 8080

# Validate JSON
python3 -m json.tool data/products.json

# Deploy
git add . && git commit -m "message" && git push

# Check file size
ls -lh data/products.json
```

### Category Slugs

- `mtg` - MTG products
- `props` - Props & Signs
- `accessories` - Accessories
- `dice` - Dice & Tokens
- `storage` - Storage solutions
- `custom` - Custom orders
- `all` - All products (filter only)

## Additional Resources

### Documentation

**Setup Guides:**
- [Airtable Setup](docs/airtable_setup.md) - Complete Airtable integration
- [Cloudflare Workers Setup](docs/cloudflare_workers_setup.md) - Deploy API proxies
- [Order Tracker Setup](docs/order_tracker_setup.md) - Complete order tracking guide

**Development:**
- [Development Guide](docs/development.md) - Best practices and workflows
- [API Reference](docs/api.md) - JavaScript API documentation
- [Technical Features](docs/technical_features.md) - What makes this site technically excellent

### External Tools

- [Airtable](https://airtable.com) - CMS platform
- [Cloudflare Workers](https://workers.cloudflare.com) - Serverless API platform
- [Cloudflare Pages](https://pages.cloudflare.com) - Static site hosting
- [GitHub](https://github.com) - Version control
- [JSONLint](https://jsonlint.com/) - JSON validator

## Technical Details

**Performance Features:**
- Lazy image loading
- Debounced events
- Cached DOM queries
- 5-minute API caching via Cloudflare Workers
- Service worker for offline support

**Accessibility:**
- ARIA labels
- Keyboard navigation
- Semantic HTML
- Focus indicators
- Descriptive alt text

**Responsive Breakpoints:**
- Desktop: 1920px
- Tablet: 768px
- Mobile: 375px

**Important:** Always backup `data/products.json` before major edits!
