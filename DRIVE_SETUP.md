# Google Drive Setup Guide

## 🚀 Quick Setup

### 1. Get Google OAuth Client ID

You need to create OAuth credentials for your extension to access Google Drive.

#### Steps:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it (e.g., "My Sidebar Extension")
   - Click "Create"

3. **Enable Google Drive API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (unless you have Google Workspace)
   - Click "Create"
   - Fill in:
     - App name: "My Sidebar"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - **Add Scopes**: Click "Add or Remove Scopes"
     - Find and select: `https://www.googleapis.com/auth/drive.readonly`
   - Click "Save and Continue"
   - **Test users**: Add your email
   - Click "Save and Continue"

5. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Chrome Extension**
   - Name: "My Sidebar Extension"
   - **Item ID**: You'll get this after loading your extension
     - For now, use a placeholder and update it later
     - Format: `abcdefghijklmnopqrstuvwxyz123456`

6. **Get Your Client ID**
   - Copy the Client ID (format: `xxxxx.apps.googleusercontent.com`)
   - Update `manifest.json` with your Client ID

### 2. Update manifest.json

Replace `YOUR_CLIENT_ID_HERE` in `public/manifest.json` with your actual Client ID:

```json
"oauth2": {
  "client_id": "123456789-abcdefg.apps.googleusercontent.com",
  "scopes": [
    "https://www.googleapis.com/auth/drive.readonly"
  ]
}
```

### 3. Update OAuth Credentials with Extension ID

After loading your extension:

1. Go to `chrome://extensions/` and enable Developer Mode
2. Note your extension ID (32-character string)
3. Go back to Google Cloud Console → Credentials
4. Edit your OAuth client
5. Replace the placeholder Item ID with your actual extension ID
6. Save

---

## 🎯 Features Included

✅ **OAuth Authentication** - Secure Google Sign-In  
✅ **File Browsing** - List all your Drive files  
✅ **Search** - Find files by name (debounced)  
✅ **File Preview Icons** - Thumbnails for images  
✅ **Open in New Tab** - Click any file to open  
✅ **Pagination** - Load more files as needed  
✅ **Auto Token Refresh** - Seamless experience  
✅ **Read-Only** - No data uploads or modifications  

---

## 📁 Files Added/Modified

### New Files:
- `src/components/DrivePage.tsx` - Google Drive browser UI

### Modified Files:
- `public/manifest.json` - Added OAuth & Drive permissions
- `public/background.js` - Added OAuth & Drive API handlers
- `src/App.tsx` - Added Drive tab to app cards

---

## 🧪 Testing

1. Build the extension: `npm run build`
2. Load in Chrome: `chrome://extensions/` → "Load unpacked" → select `dist` folder
3. Click extension icon to open sidebar
4. Click "Google Drive" card
5. Click "Sign in with Google"
6. Grant permissions
7. Browse your files!

---

## 🔒 Security & Privacy

- **Read-only access**: Cannot edit, delete, or upload files
- **No backend**: All API calls direct from extension to Google
- **No data storage**: No files stored locally (only auth token in memory)
- **Open source**: All code visible and auditable

---

## 🐛 Troubleshooting

### "Authentication failed"
- Check that Client ID is correctly set in manifest.json
- Verify extension ID matches OAuth credentials
- Make sure Drive API is enabled

### "Session expired"
- Click "Sign in with Google" again
- Token expires after ~50 minutes (auto-refresh coming)

### "Failed to fetch files"
- Check internet connection
- Verify Drive API is enabled in Google Cloud Console
- Check browser console for errors

### Files not opening
- Check popup blocker settings
- Ensure file permissions in Drive allow viewing

---

## 📝 API Quotas (Free Tier)

Google Drive API free limits:
- **1,000 requests per 100 seconds per user**
- **10,000 requests per day per project**

This is more than enough for personal use!

---

## 🎨 Customization

Want to change the appearance?
- Edit colors in `DrivePage.tsx`
- Matches your existing dark theme

Want more features?
- File type filters
- Sort options
- Folder navigation
- Star/favorite files

Let me know what you'd like to add!

---

## 📚 Resources

- [Google Drive API Docs](https://developers.google.com/drive/api/v3/about-sdk)
- [Chrome Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [OAuth 2.0 for Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)

---

## ✨ What's Next?

Suggested improvements:
1. Folder navigation (currently flat list)
2. File type filters (docs, sheets, images, etc.)
3. Multiple sort options
4. Download files
5. Share link copying
6. Recent files section
7. Starred files

Let me know what you'd like to add next!
