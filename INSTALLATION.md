# Installation Guide

## Quick Start (5 minutes)

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Enable **Developer mode** using the toggle in the top-right corner

### Step 2: Load the Extension
1. Click the **"Load unpacked"** button
2. Navigate to and select this folder: `/Users/ying/Documents/AI PM/docsend-slides-scraper/docsend-extension`
3. Click **"Select"**

### Step 3: Verify Installation
You should now see:
- ✅ "DocSend Slide Deck Downloader" in your extensions list
- ✅ The extension icon in your Chrome toolbar (you may need to click the puzzle piece icon to pin it)

---

## How to Use

### Downloading a DocSend Deck:

1. **Navigate to DocSend:** Open any DocSend slide deck URL in Chrome
   - Example: `https://docsend.com/view/xxxxx`

2. **Click the Extension Icon:** Click the DocSend Downloader icon in your toolbar

3. **Wait for Generation:**
   - You'll see a progress message on the page: "Generating PDF..."
   - The extension will automatically navigate through all slides

4. **Download Completes:**
   - PDF will auto-download when complete
   - Filename will be based on the deck title (or "slidedeck.pdf" if no title found)

---

## Troubleshooting

### Extension Won't Click/Nothing Happens:
- **Make sure you're on a DocSend page** - this extension only works on `docsend.com` domains
- Check the browser console (F12) for error messages

### "This extension only works on DocSend pages" Error:
- This is a **security feature** - the extension will not run on non-DocSend websites
- Navigate to an actual DocSend URL first

### PDF Download Fails:
- Ensure the DocSend page has fully loaded before clicking the extension
- Try refreshing the page and clicking again
- Check if the deck requires authentication/permission

### Extension Not Showing in Toolbar:
- Click the puzzle piece icon (Extensions) in Chrome toolbar
- Find "DocSend Slide Deck Downloader" and pin it

---

## Uninstalling

1. Go to `chrome://extensions/`
2. Find "DocSend Slide Deck Downloader"
3. Click **"Remove"**

---

## Security Features

This version includes security hardening:
- ✅ Only runs on DocSend domains (won't access other websites)
- ✅ XSS protection via textContent instead of innerHTML
- ✅ Filename sanitization (removes malicious characters)
- ✅ Restricted host permissions

See [SECURITY_FIXES.md](SECURITY_FIXES.md) for full details.

---

## Support

This is a security-hardened fork of: https://github.com/mdesilva/DocSendDownloader

For issues specific to the security fixes, please refer to the SECURITY_FIXES.md document.
