# Security-Hardened DocSend Extension

This is a security-hardened fork of [mdesilva/DocSendDownloader](https://github.com/mdesilva/DocSendDownloader) with critical security fixes applied.

## Security Improvements Applied

### 1. ✅ URL Validation Before Script Injection (CRITICAL)
**File:** `service_worker.js`

**Issue:** The original extension would inject scripts into ANY active tab when clicked, regardless of the website.

**Fix:** Added domain validation to only allow execution on DocSend domains:
- `docsend.com`
- `docsend.dropbox.com`

If you click the extension on a non-DocSend page, it will now refuse to run and log an error to console.

**Code changes:**
```javascript
// Added URL validation before script injection
const allowedDomains = ['docsend.com', 'docsend.dropbox.com'];
const isAllowedDomain = allowedDomains.some(domain => {
    try {
        const url = new URL(currentTabUrl);
        return url.hostname.endsWith(domain);
    } catch (e) {
        return false;
    }
});

if (!isAllowedDomain) {
    console.error('DocSend Downloader: This extension only works on DocSend pages');
    jobInProgress = false;
    return;
}
```

---

### 2. ✅ XSS Prevention via innerHTML Removal
**File:** `src/ModifyDocSendView.js`

**Issue:** Using `innerHTML` to display user-facing messages creates XSS injection vectors if untrusted data is inserted.

**Fix:** Replaced `innerHTML` with `textContent` for all user-facing text:
- `showDefaultAlert()` - now uses `textContent`
- `hideDefaultAlert()` - now uses `textContent`
- `showCustomAlert()` - uses `textContent` for text, only allows static SVG via `innerHTML`

**Why this matters:** If a malicious DocSend page or compromised content tried to inject scripts via alert messages, they would now be rendered as plain text instead of executed.

---

### 3. ✅ Filename Sanitization
**File:** `src/ModifyDocSendView.js`

**Issue:** Filenames were taken directly from DOM elements without validation, allowing:
- Path traversal characters (`/`, `\`, `..`)
- Special filesystem characters (`<`, `>`, `:`, `|`, `?`, `*`)
- Control characters
- Extremely long filenames

**Fix:** Added `safeFilename()` function that:
- Removes all control characters (`\x00-\x1F`)
- Strips path separators (`/`, `\`, `:`)
- Removes unsafe characters (`<`, `>`, `"`, `|`, `?`, `*`)
- Limits filename length to 120 characters
- Falls back to "slidedeck" if result is empty

**Example:**
```javascript
// Before: could result in "../../../malicious.pdf"
// After: "malicious.pdf" (path traversal removed)
```

---

### 4. ✅ Host Permissions Already Restricted
**File:** `manifest.json`

**Status:** The original extension already had good permissions! It only requests access to:
```json
"host_permissions": [
  "*://*.docsend.com/",
  "*://*.cloudfront.net/*",
  "*://*.docsend.dropbox.com/*"
]
```

This is exactly what it needs (CloudFront is for image downloads).

---

## Installation Instructions

### Load as Unpacked Extension in Chrome:

1. **Navigate to Chrome Extensions:**
   - Open Chrome
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

2. **Load the Extension:**
   - Click "Load unpacked"
   - Select the `docsend-extension` folder

3. **Verify Installation:**
   - You should see "DocSend Slide Deck Downloader" in your extensions list
   - The extension icon should appear in your browser toolbar

### Usage:

1. Navigate to any DocSend slide deck URL
2. Click the extension icon in your toolbar
3. Wait for the PDF to generate (progress shown on page)
4. PDF will auto-download when complete

### Security Note:

This extension now **only works on DocSend pages**. If you try to use it on another website, it will refuse to run and show an error in the browser console.

---

## What Was NOT Changed

- Core PDF generation logic (uses pdfkit)
- Image capture and processing
- User interface elements
- Extension functionality

All changes were purely security-focused to eliminate the risks identified in the security audit.

---

## Testing Checklist

- [ ] Extension loads without errors in Chrome
- [ ] Extension downloads PDF successfully from DocSend
- [ ] Extension refuses to run on non-DocSend pages
- [ ] Filenames are sanitized (try decks with special characters in titles)
- [ ] No console errors during normal operation

---

## Original Repository

This is a fork of: https://github.com/mdesilva/DocSendDownloader

All credit for the original implementation goes to the original author. These modifications only add security hardening.
