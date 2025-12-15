# ☁️ Cloudflare Workers Setup Guide

Complete guide for deploying Cloudflare Workers as secure API proxies for Airtable integration.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Architecture](#-architecture)
- [Security Patterns](#-security-patterns)
- [Products Worker Setup](#-products-worker-setup)
- [Orders Worker Setup](#-orders-worker-setup)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)

---

## 📖 Overview

Cloudflare Workers provide a serverless platform to run JavaScript at the edge, acting as secure proxies between your static site and Airtable APIs.

**Benefits:**
- **100,000 requests/day** on free tier (very generous)
- Global edge network for low latency
- Built-in caching + custom cache control
- Secure secrets management
- Easy deployment with Wrangler CLI

**What you'll deploy:**
1. **Products Worker** - Fetches product catalog from Airtable (5-min cache)
2. **Orders Worker** - Real-time order status lookup (1-min cache)

---

## 🎯 Prerequisites

- [ ] [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages) (free tier works)
- [ ] Node.js installed (v16 or later)
- [ ] Airtable API key (Personal Access Token)
- [ ] Airtable Base ID (the `appXXXXXXXXXXXXXX` part from your base URL)
- [ ] Basic familiarity with command line

---

## 🏗️ Architecture

```
Static Site → Cloudflare Workers → Airtable API
             (hides API keys,
              caching, CORS)
```

**Two Workers:**

| Worker | Endpoint | Cache | Purpose |
|--------|----------|-------|---------|
| **Products** | `/products` or root | 5 minutes | Fetches all active products |
| **Orders** | `/orders` | 1 minute | Looks up order by ID |

---

## 🔒 Security Patterns

These security features should be implemented in both workers:

### 1. Airtable Formula Injection Protection

**Problem:** User inputs in Airtable formulas can be exploited

**Solution:** Escape all user inputs before using in formulas

```javascript
function escapeAirtableValue(value) {
  if (!value) return '';
  return value
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/'/g, "\\'")    // Escape single quotes
    .replace(/"/g, '\\"')    // Escape double quotes
    .replace(/[\n\r]/g, ' ') // Replace newlines with spaces
    .replace(/[{}]/g, '');   // Remove curly braces (formula injection)
}
```

### 2. CORS Headers

Allow browser access from your frontend:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

### 3. Environment Variables (Secrets)

Store sensitive data as Worker secrets (not in code):

```bash
wrangler secret put AIRTABLE_API_KEY
wrangler secret put AIRTABLE_BASE_ID
```

### 4. Input Validation

Validate all user inputs before processing:

```javascript
// Order ID format validation (AA-YYYY-####)
const orderIdPattern = /^[A-Z]{2}-\d{4}-\d{4}$/;
if (!orderIdPattern.test(orderId)) {
  return new Response(JSON.stringify({
    success: false,
    error: 'Invalid order ID format'
  }), { status: 400 });
}
```

### 5. Cache Control

Implement appropriate caching strategies:

```javascript
// Products: 5 minutes (less frequent updates)
'Cache-Control': 'public, max-age=300'

// Orders: 1 minute (real-time updates)
'Cache-Control': 'public, max-age=60'
```

---

## 📦 Products Worker Setup

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

### Step 3: Create Worker Project

```bash
mkdir additiveartisan-products
cd additiveartisan-products
wrangler init
```

### Step 4: Worker Code

Create `src/index.js`:

```javascript
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Get credentials from environment
      const API_KEY = env.AIRTABLE_API_KEY;
      const BASE_ID = env.AIRTABLE_BASE_ID;

      if (!API_KEY || !BASE_ID) {
        return new Response(JSON.stringify({ error: 'Server configuration error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Fetch from Airtable
      const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/Products`;
      const response = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();

      // Note: This worker doesn't use filterByFormula, so no input escaping needed.
      // If you add filtering by query params in the future, use escapeAirtableValue()
      // (see Orders Worker below for implementation)

      // Transform Airtable format to your site format
      const products = data.records
        .filter(record => record.fields.Active)
        .map(record => ({
          id: record.fields['Product ID'],
          title: record.fields.Title,
          description: record.fields.Description,
          price: record.fields.Price,
          category: record.fields.Category,
          etsyUrl: record.fields['Etsy URL'],
          imageUrl: record.fields['Image URL'] || null,
          featured: record.fields.Featured || false,
          featuredOrder: record.fields['Featured Order'] || null,
        }));

      // Get featured products
      const featured = products
        .filter(p => p.featured && p.featuredOrder)
        .sort((a, b) => a.featuredOrder - b.featuredOrder)
        .slice(0, 3);

      const result = {
        products,
        featured,
        lastUpdated: new Date().toISOString(),
      };

      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 minutes
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
```

### Step 5: Configure wrangler.toml

```toml
name = "additiveartisan-products"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
name = "additiveartisan-products"
```

### Step 6: Add Secrets

```bash
wrangler secret put AIRTABLE_API_KEY
# Paste your Airtable Personal Access Token

wrangler secret put AIRTABLE_BASE_ID
# Paste your Base ID (appXXXXXXXXXXXXXX)
```

### Step 7: Deploy

```bash
wrangler deploy
```

Copy the worker URL (e.g., `https://additiveartisan-products.YOUR_SUBDOMAIN.workers.dev`)

---

## 📮 Orders Worker Setup

### Step 1: Create Worker Project

```bash
mkdir additiveartisan-orders
cd additiveartisan-orders
wrangler init
```

### Step 2: Worker Code

Create `src/index.js`:

```javascript
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Parse query parameters
      const url = new URL(request.url);
      const orderId = url.searchParams.get('orderId');
      const email = url.searchParams.get('email');

      // Validate required parameters
      if (!orderId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Order ID is required'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Validate order ID format (AA-YYYY-####)
      const orderIdPattern = /^[A-Z]{2}-\d{4}-\d{4}$/;
      if (!orderIdPattern.test(orderId)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid order ID format. Expected format: AA-YYYY-####',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Get credentials from environment
      const API_KEY = env.AIRTABLE_API_KEY;
      const BASE_ID = env.AIRTABLE_BASE_ID;

      if (!API_KEY || !BASE_ID) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Server configuration error'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Escape Airtable formula values to prevent injection
      function escapeAirtableValue(value) {
        if (!value) return '';
        return value
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"')
          .replace(/[\n\r]/g, ' ')
          .replace(/[{}]/g, '');
      }

      const safeOrderId = escapeAirtableValue(orderId);
      const safeEmail = email ? escapeAirtableValue(email) : '';

      // Build Airtable formula
      let formula;
      if (safeEmail) {
        formula = `AND({Order ID} = '${safeOrderId}', {Email} = '${safeEmail}')`;
      } else {
        formula = `{Order ID} = '${safeOrderId}'`;
      }

      // Fetch from Airtable
      const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/Orders?filterByFormula=${encodeURIComponent(formula)}`;

      const response = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      if (!response.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to fetch order data'
        }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();

      // Check if order found
      if (!data.records || data.records.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Order not found or email doesn\'t match',
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Return first matching record
      const record = data.records[0];
      const result = {
        success: true,
        order: {
          orderId: record.fields['Order ID'],
          status: record.fields.Status,
          product: record.fields.Product,
          trackingNumber: record.fields['Tracking Number'],
          createdDate: record.fields['Created Date'],
          updatedDate: record.fields['Updated Date'],
        },
      };

      return new Response(JSON.stringify(result), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60', // 1 minute
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
```

### Step 3: Configure wrangler.toml

```toml
name = "additiveartisan-orders"
main = "src/index.js"
compatibility_date = "2024-01-01"

[env.production]
name = "additiveartisan-orders"
```

### Step 4: Add Secrets

```bash
wrangler secret put AIRTABLE_API_KEY
wrangler secret put AIRTABLE_BASE_ID
```

### Step 5: Deploy

```bash
wrangler deploy
```

Copy the worker URL (e.g., `https://additiveartisan-orders.YOUR_SUBDOMAIN.workers.dev`)

---

## ⚙️ Configuration

### Update Site Configuration

**File:** `js/config.js`

```javascript
orderTracker: {
  apiEndpoint: "https://additiveartisan-orders.YOUR_SUBDOMAIN.workers.dev",
  // ... rest of config
}
```

**File:** `js/products.js` (if applicable)

Update the products API endpoint with your products worker URL.

### Update CSP Policy

**File:** `index.html`

```html
<meta http-equiv="Content-Security-Policy" content="
    ...
    connect-src 'self' https://*.workers.dev;
    ...
">
```

---

## 🧪 Testing

### Test Products Worker

**Browser console:**
```javascript
fetch('https://additiveartisan-products.YOUR_SUBDOMAIN.workers.dev')
  .then(r => r.json())
  .then(console.log)
```

**Expected response:**
```json
{
  "products": [...],
  "featured": [...],
  "lastUpdated": "2024-..."
}
```

### Test Orders Worker

**Browser console:**
```javascript
fetch('https://additiveartisan-orders.YOUR_SUBDOMAIN.workers.dev?orderId=AA-2024-0047')
  .then(r => r.json())
  .then(console.log)
```

**Expected response:**
```json
{
  "success": true,
  "order": {
    "orderId": "AA-2024-0047",
    "status": "Printing",
    ...
  }
}
```

### Testing Checklist

- [ ] Products worker returns valid JSON
- [ ] Products filtered correctly (only active items)
- [ ] Featured products sorted by featuredOrder
- [ ] Orders worker validates order ID format
- [ ] Orders worker escapes inputs (test with special chars)
- [ ] CORS headers present in responses
- [ ] Cache headers working (check response headers)
- [ ] Error handling returns proper status codes
- [ ] Secrets configured correctly (no hardcoded keys)

---

## 🐛 Troubleshooting

### "Server configuration error"

**Cause:** Missing or incorrect secrets

**Solution:**
```bash
# List secrets
wrangler secret list

# Add missing secrets
wrangler secret put AIRTABLE_API_KEY
wrangler secret put AIRTABLE_BASE_ID
```

### "Failed to fetch products"

**Cause:** Airtable API error

**Solutions:**
- Check API key has correct permissions (`data.records:read`)
- Verify Base ID is correct
- Check Airtable table name is exactly "Products" or "Orders"
- View worker logs: `wrangler tail`

### CORS Errors

**Cause:** Missing or incorrect CORS headers

**Solution:** Ensure headers include:
```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, OPTIONS'
```

### Cache Not Working

**Cause:** Missing Cache-Control headers

**Solution:** Check response includes:
```javascript
'Cache-Control': 'public, max-age=300'
```

### View Worker Logs

```bash
# Real-time logs
wrangler tail

# For specific worker
wrangler tail additiveartisan-products
```

---

## 🚀 Deployment

### Deploy to Production

```bash
# Deploy products worker
cd additiveartisan-products
wrangler deploy

# Deploy orders worker
cd ../additiveartisan-orders
wrangler deploy
```

### Update Site Configuration

- [ ] Update `js/config.js` with worker URLs
- [ ] Update CSP policy in `index.html`
- [ ] Test endpoints in browser console
- [ ] Commit changes: `git add . && git commit -m "..."`
- [ ] Push to repository: `git push`

### Verify in Production

- [ ] Visit live site
- [ ] Check products load correctly
- [ ] Test order tracking with sample order ID
- [ ] Check browser console for errors
- [ ] Verify caching headers (Network tab)

---

## 📚 Related Documentation

- [Airtable Setup](airtable_setup.md) - Database integration
- [Order Tracker Setup](order_tracker_setup.md) - Complete order tracking guide
- [Main README](../readme.md) - Site overview
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/) - Official documentation

---

## 💡 Tips

**Development workflow:**
```bash
# Local development
wrangler dev

# View logs in real-time
wrangler tail

# Update secrets
wrangler secret put SECRET_NAME

# List all workers
wrangler whoami
```

**Cost optimization:**
- Free tier: 100,000 requests/day
- With 5-min cache on products: supports thousands of daily visitors
- With 1-min cache on orders: fast updates without hitting limits

**Security best practices:**
- Never commit secrets to git
- Use environment-specific workers if needed
- Implement rate limiting for production
- Monitor worker logs regularly

---

**Questions?** See [Troubleshooting](#-troubleshooting) or check [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).
