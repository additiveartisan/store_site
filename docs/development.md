# 🛠️ Development Guide

Best practices, workflows, and guidelines for developing the Additive Artisan website.

---

## 📋 Table of Contents

- [Local Development](#-local-development)
- [Development Workflow](#-development-workflow)
- [Code Organization](#-code-organization)
- [Performance Guidelines](#-performance-guidelines)
- [Security Guidelines](#-security-guidelines)
- [Debugging](#-debugging)
- [Deployment](#-deployment)
- [Testing Checklist](#-testing-checklist)

---

## 💻 Local Development

### Starting Local Server

**IMPORTANT:** You MUST run a local server. Opening `index.html` directly won't work due to JavaScript fetch restrictions.

**Python (Recommended):**
```bash
cd /path/to/store_site
python3 -m http.server 8080
```
Open: `http://localhost:8080` | Stop: `Ctrl+C`

**VS Code Live Server:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"
- Auto-refresh on save

**Node.js:**
```bash
npx http-server -p 8080
```

### DevTools Shortcuts

- **Open:** `F12` (Windows) or `Cmd+Option+I` (Mac)
- **Console:** JavaScript errors, test API functions
- **Network:** Check file loading, response codes
- **Elements:** Inspect HTML, test CSS live

---

## 🔄 Development Workflow

### Local Development Flow

- [ ] Start server: `python3 -m http.server 8080`
- [ ] Open browser: `http://localhost:8080`
- [ ] Open DevTools (`F12`)
- [ ] Make changes to files
- [ ] Save file
- [ ] Refresh browser (`Cmd+R` or hard refresh: `Cmd+Shift+R`)

**Pro Tip:** Use VS Code Live Server for auto-refresh.

### Safe Editing Practices

**Before major edits:**
```bash
# Backup with date
cp data/products.json data/products.backup-$(date +%Y-%m-%d).json
```

**Validate JSON:**
```bash
python3 -m json.tool data/products.json
```
Or use: [JSONLint](https://jsonlint.com/)

**Always use Git:**
```bash
git add .
git commit -m "Descriptive message"
git push
```

### Git Workflow

**Feature Development:**
```bash
# Create branch
git checkout -b feature/name

# Make changes & test

# Commit
git add .
git commit -m "Add feature: description"

# Push
git push origin feature/name

# Merge (after testing)
git checkout main
git merge feature/name
git push origin main
```

**Quick Fixes:**
```bash
git add file.ext
git commit -m "Fix: description"
git push
```

### Rollback Options

**Revert last commit:**
```bash
git revert HEAD
git push origin main
```

**Reset to specific commit:**
```bash
git log  # Find commit hash
git reset --hard <hash>
git push origin main --force  # ⚠️ Caution
```

**Restore from backup:**
```bash
cp data/products.backup.json data/products.json
git add data/products.json
git commit -m "Restore from backup"
git push
```

---

## 📏 Code Organization

### Modification Guidelines

**✅ Edit Frequently:**
- `data/products.json` - Product data (via Airtable)
- `styles.css` - Colors, spacing, fonts

**⚠️ Edit with Care:**
- `js/products.js` - Product rendering logic
- `js/utils.js` - Helper functions
- `index.html` - Page structure
- `script.js` - Site functionality

**🚫 Rarely Edit:**
- Core architecture/initialization
- Event listener setup
- DOM manipulation patterns

**📷 Images:**
All images hosted on Cloudinary CDN. Update URLs in `index.html` when adding new assets.

---

## ⚡ Performance Guidelines

### Image Optimization

**Requirements:**
- Format: WebP (preferred) or JPG/PNG
- Max size: 500KB per image
- Dimensions: 800x600px
- Compression: 80% quality

**Cloudinary CDN (Current):**
```
https://res.cloudinary.com/dvupmrtsm/image/upload/f_auto,q_auto,w_800,dpr_auto/v1765384928/image.png
```
Benefits: Auto WebP conversion, responsive sizing, global caching

**Tools:**
- [TinyPNG](https://tinypng.com/) - PNG/JPG compression
- [Squoosh](https://squoosh.app/) - Advanced optimization

### JSON Optimization

- Mark old products `"active": false` (don't delete)
- Keep JSON under 100KB
- Limit descriptions to 2-3 sentences

**Check size:**
```bash
ls -lh data/products.json  # Goal: <100KB
```

### Performance Monitoring

**Lighthouse Audit:**
- Open DevTools (`F12`) → Lighthouse tab
- Run Performance audit
- **Goal:** Score above 90

**Key Metrics:**
- FCP: < 1.8s
- LCP: < 2.5s
- TBT: < 300ms
- CLS: < 0.1

---

## 🔒 Security Guidelines

### API Keys

❌ **Never:**
```javascript
const API_KEY = "sk_live_abc123xyz456";  // Exposed!
```

✅ **Always:**
```javascript
const API_KEY = Deno.env.get("API_KEY");  // Environment variable
```

### User Input

Always escape HTML:
```javascript
const safeText = AdditiveArtisanUtils.escapeHTML(userInput);
```

### HTTPS Only

- Use `https://` for all external resources
- Cloudflare Pages provides automatic HTTPS
- Never use `http://` in production

---

## 🐛 Debugging

### Products Not Showing

**Debug in console:**
```javascript
// Check products loaded
window.AdditiveArtisanProducts.getAllProducts()

// Check JSON loads
fetch('data/products.json').then(r => r.json()).then(d => console.log(d))
```

**Check:**
- [ ] Console for JavaScript errors
- [ ] Network tab - is `products.json` loading?
- [ ] JSON syntax: `python3 -m json.tool data/products.json`

### Filters Not Working

**Check:**
- [ ] Console for errors
- [ ] Product cards have `data-category` attribute
- [ ] Filter buttons have `data-filter` attribute

### Changes Not Appearing

**Try in order:**
- [ ] Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- [ ] Clear cache: DevTools → Network → "Disable cache"
- [ ] Check commit: `git log`

### Theme Not Persisting

**Debug localStorage:**
```javascript
localStorage.getItem('theme')           // Check current
localStorage.removeItem('theme')        // Clear
localStorage.setItem('theme', 'dark')   // Set
```

**Note:** localStorage doesn't work in incognito mode.

---

## 🚀 Deployment

### Cloudflare Pages

**Why Cloudflare Pages:**
- 100% free with unlimited bandwidth
- Automatic deployment from GitHub
- Lightning-fast deployment (seconds)
- Custom domain support with automatic HTTPS
- Global CDN with 300+ locations

**Setup:**
- [ ] Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- [ ] Pages → Create a project
- [ ] Connect to GitHub: `additiveartisan/store_site`
- [ ] Build settings: None (static site)
- [ ] Deploy

**Deploy Changes:**
```bash
git add .
git commit -m "..."
git push origin main
```

Cloudflare automatically rebuilds and deploys within seconds.

---

## ✅ Testing Checklist

### Functionality Tests

- [ ] All products display
- [ ] Category filters work (all, mtg, props, etc.)
- [ ] Featured products appear (3 items)
- [ ] Theme toggle works
- [ ] Theme persists after refresh
- [ ] Mobile navigation works
- [ ] Etsy links open in new tab
- [ ] No console errors (warnings OK)

### Visual Tests

- [ ] Desktop layout (1920px)
- [ ] Tablet layout (768px)
- [ ] Mobile layout (375px)
- [ ] Images load correctly
- [ ] No horizontal scrolling
- [ ] Text readable
- [ ] Buttons styled properly
- [ ] Smooth animations

### Performance Tests

- [ ] Page loads < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Images < 500KB each
- [ ] Total page weight < 2MB

### Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 💡 Pro Tips

### VS Code Extensions

- **Live Server** - Auto-refresh on save
- **Prettier** - Auto-format code
- **ESLint** - Catch JavaScript errors
- **Path Intellisense** - Autocomplete file paths

### Keyboard Shortcuts

- `Cmd+Shift+R` - Hard refresh browser
- `Cmd+Option+I` - Open DevTools
- `Cmd+K` - Clear console
- `Cmd+F` - Search in file
- `Cmd+Shift+F` - Search in project

### Git Aliases

Add to `~/.gitconfig`:
```ini
[alias]
    st = status
    co = checkout
    br = branch
    cm = commit -m
    ps = push
    pl = pull
```

---

## 📚 Related Documentation

- [Main README](../readme.md) - Site overview
- [Airtable Setup](airtable_setup.md) - Database integration
- [Order Tracker Setup](order_tracker_setup.md) - Order tracking system
- [Cloudflare Workers Setup](cloudflare_workers_setup.md) - API proxy deployment
- [API Documentation](api.md) - JavaScript API reference

---
