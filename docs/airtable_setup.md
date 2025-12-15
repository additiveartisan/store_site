# 🗄️ Airtable Integration Guide

Complete guide for setting up Airtable as your product database with Cloudflare Workers proxy integration.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Phase 1: Create Airtable Base](#-phase-1-create-airtable-base)
- [Phase 2: Set Up Cloudflare Worker](#-phase-2-set-up-cloudflare-worker)
- [Phase 3: Update Your Site](#-phase-3-update-your-site)
- [Phase 4: Deploy & Test](#-phase-4-deploy--test)
- [Managing Products](#-managing-products)
- [Troubleshooting](#-troubleshooting)

---

## 📖 Overview

Transform your site from using local JSON files to a cloud-based Airtable database with automatic syncing.

**Benefits:**
- Update products from Airtable's web interface (no code needed)
- Team members can manage products without technical knowledge
- Automatic sync - changes appear on site within 5 minutes
- Fallback to local JSON if Airtable unavailable

**Architecture:**
```
Your Site → Cloudflare Worker → Airtable Database
           (hides API key)
```

**Time required:** ~30 minutes

---

## 🎯 Prerequisites

- [ ] [Airtable account](https://airtable.com) (free tier works)
- [ ] [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages) (free tier works)
- [ ] Your existing `data/products.json` file
- [ ] Basic familiarity with your site structure

---

## 🔧 Phase 1: Create Airtable Base

### Create Airtable Base & Table

- [ ] Go to [Airtable](https://airtable.com) and sign in
- [ ] Click "Create a base" → "Start from scratch"
- [ ] Name it: **Additive Artisan Products**
- [ ] Rename default table to: **Products**
- [ ] Delete all default fields

### Configure Product Fields

Add these fields in order (exact names matter):

- [ ] **Product ID** - Single line text (set as primary field)
- [ ] **Title** - Single line text
- [ ] **Description** - Long text
- [ ] **Price** - Currency (Format: USD $)
- [ ] **Category** - Single select (Options: mtg, props, accessories, dice, storage, custom)
- [ ] **Image URL** - URL
- [ ] **Featured** - Checkbox
- [ ] **Featured Order** - Number (Integer, no negatives)
- [ ] **Etsy URL** - URL
- [ ] **Active** - Checkbox (default: checked)
- [ ] **Date Added** - Date (include time: yes)
- [ ] **Tags** - Multiple select

### Import Existing Products

**Option 1: Manual Entry**
- [ ] Open your `data/products.json` file
- [ ] Copy product data one-by-one into Airtable

**Option 2: CSV Import (Faster)**
- [ ] Convert JSON to CSV using [JSON to CSV converter](https://www.convertcsv.com/json-to-csv.htm)
- [ ] In Airtable: "Add records" → "Import CSV"
- [ ] Map fields to match table structure

### Get Airtable Credentials

**Create Personal Access Token:**
- [ ] Click profile icon → "Developer hub"
- [ ] Click "Create personal access token"
- [ ] Name it: **Additive Artisan API**
- [ ] Add scopes: `data.records:read` and `schema.bases:read`
- [ ] Add access to base: **Additive Artisan Products**
- [ ] Click "Create token"
- [ ] **Copy and save token** (you'll need it for Cloudflare Workers)

**Get Base ID:**
- [ ] Go back to your Airtable base
- [ ] Look at URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
- [ ] Copy the `appXXXXXXXXXXXXXX` part
- [ ] **Save it** - you'll need it for Cloudflare Workers

---

## 🌐 Phase 2: Set Up Cloudflare Worker

Cloudflare Workers acts as a secure proxy between your site and Airtable, hiding your API key from public view and providing caching for improved performance.

**Complete setup instructions:** See [Cloudflare Workers Setup Guide](cloudflare_workers_setup.md)

**What the Worker does:**
- Securely proxies requests to Airtable API
- Hides your Airtable API key from public view
- Implements 5-minute caching for better performance
- Provides CORS headers for browser access
- Protects against formula injection attacks

**Quick Overview:**
- [ ] Follow the [Cloudflare Workers Setup Guide](cloudflare_workers_setup.md) to deploy your products worker
- [ ] Configure worker with your Airtable API key and Base ID
- [ ] Test the worker endpoint to verify it returns your products
- [ ] Copy the worker URL (format: `https://additiveartisan-products.YOUR_SUBDOMAIN.workers.dev`)

---

## 💻 Phase 3: Update Your Site

### Update Configuration

- [ ] Open `js/products.js`
- [ ] Find `loadProducts()` function (lines 17-37)
- [ ] Find line with the API endpoint URL
- [ ] Replace with your actual Cloudflare Worker URL (e.g., `https://additiveartisan-products.YOUR_SUBDOMAIN.workers.dev`)
- [ ] Verify `USE_AIRTABLE = true` is set
- [ ] Save file

### Test Locally

- [ ] Start local server: `python3 -m http.server 8080`
- [ ] Open browser: `http://localhost:8080`
- [ ] Open DevTools Console (F12)
- [ ] Look for: `"Loaded X products from Airtable"`
- [ ] Verify products display correctly on page

**Test Fallback:**
- [ ] Set `USE_AIRTABLE = false` in code
- [ ] Refresh page
- [ ] Should see: `"Loaded X products from local JSON"`
- [ ] Set back to `true`

---

## 🚀 Phase 4: Deploy & Test

### Deploy to Production

- [ ] Commit changes: `git add js/products.js`
- [ ] Commit: `git commit -m "Add Airtable integration"`
- [ ] Push: `git push`
- [ ] Wait 1-2 minutes for deployment
- [ ] Visit live site

**Keep `data/products.json` as backup** - it serves as fallback if Airtable is unavailable.

### Testing Checklist

**API Tests:**
- [ ] Cloudflare Worker endpoint returns valid JSON
- [ ] All products load from Airtable
- [ ] Product count matches Airtable base
- [ ] No console errors

**Site Functionality:**
- [ ] Category filters work
- [ ] Featured products appear (max 3)
- [ ] Product cards display correct data
- [ ] "Order on Etsy" links work

**Live Update Tests:**
- [ ] Add product in Airtable
- [ ] Wait 5 minutes (cache expiry)
- [ ] Hard refresh browser (Cmd+Shift+R)
- [ ] New product appears
- [ ] Edit product in Airtable
- [ ] Changes appear after 5 min + refresh
- [ ] Set product Active = false
- [ ] Product disappears from site

---

## 📝 Managing Products

### Adding New Products

- [ ] Open Airtable base
- [ ] Click "+ Add record"
- [ ] Fill required fields: Product ID, Title
- [ ] Fill optional fields: Description, Price, Category, etc.
- [ ] Set Active = checked
- [ ] Changes appear within 5 minutes

### Editing Products

- Click any field to edit
- Changes save automatically
- Site updates within 5 minutes (cache time)

### Hiding Products

- Uncheck "Active" checkbox
- Product disappears from site within 5 minutes
- Data preserved in Airtable

### Featuring Products on Homepage

- Check "Featured" checkbox
- Set "Featured Order" to 1, 2, or 3 (1 = first)
- Limit to 3 featured products
- Changes appear within 5 minutes

---

## 🔧 Troubleshooting

### Products Not Loading from Airtable

**Verify Cloudflare Worker URL works:**
```javascript
fetch('https://your_worker_url').then(r => r.json()).then(d => console.log(d))
```

**Check:**
- [ ] API key set in Worker secrets
- [ ] Base ID matches Airtable URL (starts with "app")
- [ ] Table name is exactly "Products"
- [ ] Token has correct scopes and base access
- [ ] No CORS errors in console

### Products Show Old Data

**Cause:** Browser or CDN caching

**Solutions:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache in DevTools
- Wait 5 minutes for Cloudflare Worker cache to expire
- Reduce `max-age` in Worker code for faster updates

### Some Products Missing

**Check:**
- [ ] "Active" checkbox is checked
- [ ] Product has required fields (Product ID + Title)
- [ ] Field names match exactly (case-sensitive)
- [ ] No warnings in Cloudflare Worker logs

### Cloudflare Worker Shows Error

**Check:**
- [ ] `AIRTABLE_API_KEY` secret is set in Worker
- [ ] Token has `data.records:read` scope
- [ ] Token has access to your specific base
- [ ] Base ID and table name are correct
- [ ] View Worker logs with `wrangler tail` for specific error messages

---

## ⚡ Performance & Costs

### Caching Strategy

Default: 5 minutes (`max-age=300`)

**Faster updates (1 minute):**
```javascript
"Cache-Control": "public, max-age=60"
```

**Longer caching (30 minutes):**
```javascript
"Cache-Control": "public, max-age=1800"
```

### Free Tier Limits

**Airtable Free:**
- 1,200 records per base
- 5 requests/second per base
- Unlimited reads

**Cloudflare Workers Free:**
- 100,000 requests/day
- With 5-min cache: supports many thousands of daily visitors
- Very generous free tier for most small businesses

---

## 📚 Related Documentation

- [Main README](../readme.md) - Site overview
- [Cloudflare Workers Setup](cloudflare_workers_setup.md) - Complete worker setup guide
- [Development Guide](development.md) - Deployment workflows
- [API Documentation](api.md) - JavaScript API reference

---
