# 📍 Order Tracker Setup Guide

> Real-time order tracking with Artie animations for Additive Artisan

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Why This Solution](#-why-this-solution)
3. [Architecture](#-architecture)
4. [Status Stages](#-status-stages)
5. [Airtable Setup](#-airtable-setup)
6. [Cloudflare Workers API](#-cloudflare-workers-api)
7. [Frontend Configuration](#-frontend-configuration)
8. [Lottie Animation Setup](#-lottie-animation-setup-optional)
9. [Make.com Automation](#-makecom-automation-optional)
10. [Testing](#-testing)
11. [Troubleshooting](#-troubleshooting)
12. [Customer Email Template](#-customer-email-template)
13. [Costs](#-costs)

---

## 🎯 Overview

Real-time order tracking system with emoji/Lottie animations — all on your main site!

### URL Structure

```
additiveartisan.com/#track                    → Search form
additiveartisan.com/#track?order=AA-2024-0047 → Pre-filled order ID (auto-submit)
```

**Customer Tracking Link (Etsy Message):**
```
additiveartisan.com/#track?order=AA-2024-0047
```

**Optional:** Add email parameter if needed:
```
additiveartisan.com/#track?order=AA-2024-0047&email=customer@email.com
```

---

## ✅ Why This Solution

| Benefit                  | Details                              |
| ------------------------ | ------------------------------------ |
| 💰 **$0 Extra Cost**     | All free tiers                       |
| 🏠 **Single Domain**     | Everything on `additiveartisan.com`  |
| ✨ **Single-Page Feel**  | Uses hash routing — no page reloads  |
| 🔒 **Secure**            | Cloudflare Workers proxy API calls (keys hidden) |
| 🎭 **Custom Animations** | Emoji now, Lottie animations later   |

---

## 🧱 Architecture

| Layer            | Tool        | Purpose                     | Cost     |
| ---------------- | ----------- | --------------------------- | :------: |
| 🎨 **Frontend**  | Custom site | Search form + animation display | Included |
| 🔌 **Backend**   | Cloudflare Workers | Secure API proxy      | **FREE** |
| 📊 **Database**  | Airtable    | Order storage               | **FREE** |
| 🎭 **Animation** | Emoji/Lottie | Status animations          | **FREE** |

---

## 🚦 Status Stages

### 8-Stage Order Journey

| # | Status              | Emoji | Message                        |
|---|---------------------|-------|--------------------------------|
| 1 | **Order Received**  | 👋    | We got your order!             |
| 2 | **In Queue**        | 📋    | Spot reserved in print queue   |
| 3 | **Printing**        | 🖨️     | Your print is being created    |
| 4 | **Post-Processing** | 🔧    | Cleaning and finishing         |
| 5 | **Quality Control** | 🔍    | Final inspection               |
| 6 | **Packaging**       | 📦    | Carefully boxing your order    |
| 7 | **Shipped**         | ✈️     | On its way to you!             |
| 8 | **Delivered**       | 🎉    | Enjoy your print!              |

**Future:** Replace emojis with custom Artie Lottie animations (see [Lottie Setup](#-lottie-animation-setup-optional))

---

## 🗄️ Airtable Setup

### Setup Checklist

- [ ] Sign up at [Airtable](https://airtable.com) (free account)
- [ ] Create new base called "Orders"
- [ ] Get Base ID from URL: `airtable.com/appXXXXXXXXXXXXXX/...` (copy the `appXXXXXXXXXXXXXX` part)
- [ ] Create API key in [Account Settings](https://airtable.com/account) - Generate personal access token
- [ ] Save API key securely (needed for Cloudflare Workers)

### Field Configuration Checklist

Create these fields in your Orders table (**field names must match exactly - case-sensitive**):

- [ ] `Order ID` - Text field (Primary) - Example: `AA-2024-0047`
- [ ] `Customer Name` - Text field (Required) - Example: `John Smith`
- [ ] `Status` - Single Select field (Required) - Configure options below
- [ ] `Product` - Text field (Optional) - Example: `MTG Counter Wheel Set`
- [ ] `Tracking Number` - Text field (Optional) - Example: `1Z999AA10123456784`
- [ ] `Email` - Email field (Optional) - Example: `customer@email.com` - Not needed for Etsy
- [ ] `Created Date` - Date field - Auto-set on creation
- [ ] `Updated Date` - Date field - Auto-set on modification

### Status Options Checklist

Configure the `Status` field with these 8 options **in exact order** (**status names must match exactly - case-sensitive**):

- [ ] 1. Order Received
- [ ] 2. In Queue
- [ ] 3. Printing
- [ ] 4. Post-Processing
- [ ] 5. Quality Control
- [ ] 6. Packaging
- [ ] 7. Shipped
- [ ] 8. Delivered

**Updating Orders:** Click Status dropdown and select new stage (~5 seconds per order).

| When                       | Change Status To               |
| -------------------------- | ------------------------------ |
| *(Auto-set on order)*      | `Order Received`               |
| Added to queue             | `In Queue`                     |
| Started printing           | `Printing`                     |
| Print done, cleaning up    | `Post-Processing`              |
| Checking quality           | `Quality Control`              |
| Boxing it up               | `Packaging`                    |
| Handed to carrier          | `Shipped` (+ add tracking #)   |
| Delivered                  | `Delivered`                    |

---

## 🔌 Cloudflare Workers API

**Complete setup instructions:** See [Cloudflare Workers Setup Guide](cloudflare_workers_setup.md)

### What the Worker Does

The Cloudflare Worker acts as a secure proxy between your site and Airtable:

- **Hides API Keys:** Your Airtable credentials are stored securely in Worker secrets
- **Order Lookup:** Queries Airtable Orders table by Order ID (and optional email)
- **Input Validation:** Validates order ID format (AA-YYYY-####) to prevent errors
- **Formula Injection Protection:** Escapes all user inputs before querying Airtable
- **CORS Headers:** Allows browser access from your frontend
- **Fast Caching:** 1-minute cache for improved performance
- **Error Handling:** Returns clear error messages for troubleshooting

### Quick Setup Overview

- [ ] Follow the [Cloudflare Workers Setup Guide](cloudflare_workers_setup.md) to deploy your orders worker
- [ ] Configure worker with your Airtable API key and Base ID as secrets
- [ ] Deploy the worker to Cloudflare
- [ ] Test the worker endpoint with a sample order ID
- [ ] Copy the worker URL (format: `https://additiveartisan-orders.YOUR_SUBDOMAIN.workers.dev`)

**Important Security Features:**
- Order ID validation prevents invalid queries
- Formula injection escaping protects against malicious inputs
- API keys are never exposed to the browser
- CORS configured to allow only necessary origins

---

## 💻 Frontend Configuration

### Configuration Checklist

- [ ] Open `js/config.js` in your code editor
- [ ] Find line 26: `apiEndpoint: "https://YOUR_WORKER.workers.dev/orders",`
- [ ] Replace with your complete Cloudflare Worker endpoint URL
- [ ] Save the file

**Example:**
```javascript
apiEndpoint: "https://additiveartisan-orders.YOUR_SUBDOMAIN.workers.dev",
```

### Files Already Implemented

All frontend code is ready to use:
- **js/order_tracker.js** - Order tracking logic with status mapping
- **script.js** - Form handler + URL parameter detection
- **index.html** - Track section UI with form + status display
- **styles.css** - Styling for track section + timeline

### How It Works

**Hash Routing:**
- `#track` → Shows search form
- `#track?order=AA-2024-0047` → Pre-fills order ID
- `#track?order=AA-2024-0047&email=customer@email.com` → Auto-submits form

**Flow:**
1. User navigates to `#track` or clicks email link
2. Form validates order ID format (AA-YYYY-####)
3. API call to Cloudflare Worker with timeout + retry logic
4. Worker securely fetches from Airtable
5. Frontend displays status with emoji/Lottie animation
6. Timeline highlights completed + active steps

---

## 🎭 Lottie Animation Setup (Optional)

By default, the tracker uses emoji placeholders (👋 📋 🖨️). When you have custom Artie animations ready, follow this checklist:

### Setup Checklist

- [ ] Create account at [LottieFiles](https://lottiefiles.com)
- [ ] Upload your 8 Artie animations (one per status)
- [ ] Get public JSON URLs for each animation
- [ ] Open `index.html` and uncomment Lottie player script in `<head>`:
  ```html
  <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
  ```
- [ ] Open `js/config.js` and update the `lottieUrls` object (lines 54-63) with your animation URLs:
  ```javascript
  lottieUrls: {
    received: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_1.json",
    queue: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_2.json",
    printing: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_3.json",
    processing: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_4.json",
    quality: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_5.json",
    packaging: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_6.json",
    shipped: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_7.json",
    delivered: "https://assets.lottiefiles.com/packages/lf20_YOUR_ANIMATION_8.json"
  }
  ```
- [ ] In `js/config.js` line 51, change `animationMode: "emoji"` to `animationMode: "lottie"`
- [ ] Save all files
- [ ] Test on desktop and mobile devices

### Animation Guidelines

**Performance:** Keep files under 200KB, use optimized After Effects exports, test on mobile
**Design:** 150px × 150px recommended, transparent backgrounds, 2-4 second loop duration
**Switch back to emojis:** Set `animationMode: "emoji"` in `js/config.js`

---

## ⚡ Make.com Automation (Recommended)

Automate order tracking with Make.com - get notified with ready-to-send messages for each order.

### How It Works

1. Customer places order on Etsy
2. Make.com creates Airtable record
3. Make.com emails YOU with pre-formatted message
4. You copy/paste message into Etsy (10 seconds)

**Why this approach:**
- Etsy API doesn't support sending conversation messages
- Semi-automated = fast + personal touch
- Pre-formatted messages = consistent branding
- You maintain control over customer communication

### Scenario 1: Etsy → Airtable

**Purpose:** Auto-create Airtable record when Etsy order comes in

**Setup Checklist:**
- [ ] Sign up at [Make.com](https://make.com) (free account)
- [ ] Create new scenario
- [ ] Add trigger: **Etsy → Watch Orders**
- [ ] Add action: **Airtable → Create Record**
- [ ] Map fields:
  - [ ] Etsy "Order ID" → Airtable "Order ID"
  - [ ] Etsy "Buyer Name" → Airtable "Customer Name" (or create this field)
  - [ ] Etsy "Product Name" → Airtable "Product"
  - [ ] Default "Order Received" → Airtable "Status"
  - [ ] Now → Airtable "Created Date"
- [ ] Test scenario with sample order
- [ ] Turn on scenario

### Scenario 2: Airtable → Email Notification (to You)

**Purpose:** Get notified with pre-formatted Etsy message ready to copy/paste

**Setup Checklist:**
- [ ] Create new scenario in Make.com
- [ ] Add trigger: **Airtable → Watch Records** (watch for new records only)
- [ ] Filter: Only trigger when "Status" = "Order Received"
- [ ] Add action: **Email → Send an Email**
- [ ] Configure email:
  - [ ] **To:** Your email address
  - [ ] **From:** Your email address (or Make.com default)
  - [ ] **Subject:** `📦 New Order {{Order ID}} - Copy Message for Etsy`
  - [ ] **Body:** See template below
- [ ] Test scenario with test Airtable record
- [ ] Turn on scenario

### Email Template for Make.com

Copy this into the Email body field (use HTML format):

```html
<h2>New Order Notification</h2>

<p><strong>Customer:</strong> {{Customer Name}}<br>
<strong>Order ID:</strong> {{Order ID}}<br>
<strong>Product:</strong> {{Product}}<br>
<strong>Date:</strong> {{Created Date}}</p>

<hr>

<h3>📋 COPY THIS MESSAGE FOR ETSY:</h3>

<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #333;">
<p>Hi {{Customer Name}}! 🐱</p>

<p>Thanks so much for your order! I'm excited to make this for you.</p>

<p>📍 Track your order in real-time:<br>
<strong>additiveartisan.com/#track?order={{Order ID}}</strong></p>

<p>You'll see Artie (my mascot!) guide you through each step as your print comes to life - from queue to your doorstep!</p>

<p>Questions? Just message me here on Etsy anytime.</p>

<p>✨ crafted with care, one layer at a time<br>
— Rob, Additive Artisan</p>
</div>

<hr>

<p><small>To send this message:</small></p>
<ol>
<li>Go to Etsy order conversation</li>
<li>Copy the message above (gray box)</li>
<li>Paste into Etsy message</li>
<li>Click Send</li>
</ol>
```

**Text-only version** (if HTML doesn't work):

```
New Order Notification

Customer: {{Customer Name}}
Order ID: {{Order ID}}
Product: {{Product}}
Date: {{Created Date}}

========================================
COPY THIS MESSAGE FOR ETSY:
========================================

Hi {{Customer Name}}! 🐱

Thanks so much for your order! I'm excited to make this for you.

📍 Track your order in real-time:
additiveartisan.com/#track?order={{Order ID}}

You'll see Artie (my mascot!) guide you through each step as your print comes to life - from queue to your doorstep!

Questions? Just message me here on Etsy anytime.

✨ crafted with care, one layer at a time
— Rob, Additive Artisan

========================================

To send:
1. Go to Etsy order conversation
2. Copy message above
3. Paste into Etsy
4. Send
```

### Daily Workflow

**When order comes in (~10 seconds per order):**

1. Get email notification on phone/computer
2. Open Etsy conversation with customer
3. Copy pre-formatted message from email
4. Paste into Etsy message box
5. Click Send

**That's it!** Message is personalized with customer name and order ID.

### Make.com Free Tier

| Limit            | Amount    | Enough For          |
| ---------------- | --------- | ------------------- |
| Operations/month | 1,000     | ~200+ orders/month  |
| Scenarios        | Unlimited | ✅                  |
| Cost             | **$0**    | ✅                  |

**Note:** 2 operations per order (Etsy→Airtable + Airtable→Email) = 500 orders/month on free tier

---

## ✨ Testing

### Complete Testing Checklist

**Step 1: Create Test Order**
- [ ] Open your Airtable Orders base
- [ ] Click "+ Add record"
- [ ] Fill in test data:
  - [ ] Order ID: `TEST-001`
  - [ ] Email: `your@email.com`
  - [ ] Status: `Printing`
  - [ ] Product: `Test Product`
  - [ ] Created Date: Today
- [ ] Save the record

**Step 2: Test Search Form**
- [ ] Visit `additiveartisan.com/#track`
- [ ] Enter test order ID: `TEST-001`
- [ ] Enter test email: `your@email.com`
- [ ] Click "Track Order"
- [ ] Verify loading message appears
- [ ] Verify status displays with 🖨️ emoji
- [ ] Verify timeline highlights completed steps (Order Received, In Queue, Printing)
- [ ] Verify order details show (product name, dates)

**Step 3: Test Direct Link (Auto-Submit)**
- [ ] Visit: `additiveartisan.com/#track?order=TEST-001&email=your@email.com`
- [ ] Verify form auto-fills with order ID and email
- [ ] Verify status automatically appears without clicking button
- [ ] Verify correct emoji displays

**Step 4: Test Error Handling**
- [ ] Visit `additiveartisan.com/#track`
- [ ] Enter invalid order ID: `FAKE-999`
- [ ] Enter any email
- [ ] Click "Track Order"
- [ ] Verify error message displays: "Order not found or email doesn't match"
- [ ] Verify timeline is hidden

**Step 5: Test All Statuses**
- [ ] In Airtable, change Status to "Order Received" → Refresh tracking page → Verify 👋 emoji
- [ ] Change Status to "In Queue" → Refresh → Verify 📋 emoji
- [ ] Change Status to "Printing" → Refresh → Verify 🖨️ emoji
- [ ] Change Status to "Post-Processing" → Refresh → Verify 🔧 emoji
- [ ] Change Status to "Quality Control" → Refresh → Verify 🔍 emoji
- [ ] Change Status to "Packaging" → Refresh → Verify 📦 emoji
- [ ] Change Status to "Shipped" → Refresh → Verify ✈️ emoji
- [ ] Change Status to "Delivered" → Refresh → Verify 🎉 emoji

**Step 6: Test Mobile View (Optional)**
- [ ] Open tracking page on mobile device
- [ ] Verify form is responsive
- [ ] Verify timeline displays correctly
- [ ] Verify animations are smooth

---

## 🔧 Troubleshooting

### Orders Not Found

**Problem:** "Order not found or email doesn't match"

**Solutions:**
1. Check order ID matches exactly (case-sensitive)
2. Check email matches exactly (case-sensitive)
3. Verify order exists in Airtable
4. Check Cloudflare Worker `BASE_ID` is correct
5. Verify Airtable field names match exactly:
   - `Order ID` (not `OrderID`)
   - `Email` (not `Customer Email`)
   - `Status` (not `Order Status`)

### Cloudflare Worker Errors

**Problem:** "Server configuration error"

**Solutions:**
1. Check `AIRTABLE_API_KEY` secret is set in Worker
2. Verify API key has correct permissions
3. View Worker logs with `wrangler tail` for detailed errors
4. Check `AIRTABLE_BASE_ID` is correct

### Timeline Not Highlighting

**Problem:** Timeline doesn't show active step

**Solutions:**
1. Check Airtable Status field matches exactly:
   - ✅ "Order Received" (correct)
   - ❌ "order received" (wrong case)
2. Verify status is one of the 8 defined options
3. Check browser console for JavaScript errors

### Auto-Submit Not Working

**Problem:** Direct links don't auto-submit form

**Solutions:**
1. Verify URL format: `#track?order=ID&email=EMAIL`
2. Check both order + email parameters present
3. Verify form ID is `order-search-form`
4. Check browser console for errors

### Emoji Not Changing

**Problem:** Emoji stays as default

**Solutions:**
1. Verify `STATUS_CONFIG` in `js/order_tracker.js` has correct mapping
2. Check JavaScript is loading (browser console)
3. Hard refresh browser (Cmd+Shift+R)

### Lottie Not Showing

**Problem:** Animations not showing

**Solutions:**
1. Check Lottie player script is uncommented in `index.html`
2. Verify animation URLs are publicly accessible
3. Ensure `animationMode` is set to `"lottie"` in `js/config.js`
4. Clear browser cache + hard refresh

---

## 💬 Customer Message Template (Etsy)

Send this message via Etsy when order is placed:

```
Hi [name]! 🐱

Thanks so much for your order! I'm excited to make this for you.

📍 Track your order in real-time:
additiveartisan.com/#track?order=[order_id]

You'll see Artie (my mascot!) guide you through each step as your print comes to life - from queue to your doorstep!

Questions? Just message me here on Etsy anytime.

✨ crafted with care, one layer at a time
— Rob, Additive Artisan
```

**Dynamic Link Format for Make.com:**
```
additiveartisan.com/#track?order={{Order ID}}
```

**Note:** Email field is optional. Order ID alone is sufficient for tracking.

---

## 💰 Costs

### Annual Costs

| Service                    | Tool                       | Cost               |
| -------------------------- | -------------------------- | ------------------ |
| 🌐 **Website + Tracking**  | Existing hosting           | **$0** (included)  |
| 🔌 **API Proxy**           | Cloudflare Workers         | **FREE**           |
| 📊 **Order Database**      | Airtable                   | **FREE**           |
| ⚡ **Automation**          | Make.com                   | **FREE**           |
| 🎭 **Animations**          | Emoji (LottieFiles free)   | **FREE**           |

**Order Tracker Total: $0/year**

### Free Tier Limits

**Cloudflare Workers Free:**
- 100,000 requests/day
- Enough for: Many thousands of order lookups/day
- Very generous free tier for small businesses

**Airtable Free:**
- 1,000 records/base
- Enough for: 1,000 orders
- Unlimited bases

**Make.com Free:**
- 1,000 operations/month
- Enough for: ~200 orders/month
- Unlimited scenarios

### One-Time Costs (Optional)

| Service                    | Cost               |
| -------------------------- | ------------------ |
| ✨ **Custom Artie Animations** | $400–800 (Fiverr) |

**Note:** Start with free emojis, commission custom Artie animations later.

---

## 📚 Quick Reference

### Airtable Field Names (Must Match Exactly)

- `Order ID` → Order identifier
- `Customer Name` → Customer's name (for personalized messages)
- `Status` → Current status (Single select)
- `Product` → Product name
- `Tracking Number` → Shipping tracking
- `Email` → Customer email (optional)
- `Created Date` → Order date
- `Updated Date` → Last update

### Status Values (Must Match Exactly)

1. Order Received
2. In Queue
3. Printing
4. Post-Processing
5. Quality Control
6. Packaging
7. Shipped
8. Delivered

### URL Formats

- Search form: `#track`
- Pre-fill order: `#track?order=AA-2024-0047`
- Auto-submit: `#track?order=AA-2024-0047&email=customer@email.com`

---

*📍 track with care, one status at a time. 🐱*
