# ✅ Setup Checklist

Use this checklist to ensure your extension is properly configured and secure.

---

## 📋 Pre-Build Checklist

### Environment Setup
- [ ] `.env.example` file exists (template for others)
- [ ] `.env` file created locally (copy from `.env.example`)
- [ ] `VITE_GOOGLE_CLIENT_ID` set in `.env` with your actual Client ID
- [ ] `.env` is listed in `.gitignore`

### Files & Folders
- [ ] `node_modules/` installed (`npm install`)
- [ ] `dist/` folder will be created on build (git ignored)
- [ ] `scripts/inject-env.js` exists
- [ ] `scripts/setup.js` exists

### Git Safety
- [ ] `.gitignore` includes `.env`
- [ ] `.gitignore` includes `dist/`
- [ ] `.gitignore` includes `node_modules/`
- [ ] `.env.example` is NOT in `.gitignore` (should be committed)
- [ ] Run `git status` to verify no secrets are staged

---

## 🔧 Build Checklist

### Build Process
- [ ] Run `npm run build` successfully
- [ ] No errors in console
- [ ] `dist/` folder created
- [ ] `dist/manifest.json` exists
- [ ] `dist/background.js` exists
- [ ] Open `dist/manifest.json` and verify:
  - [ ] `oauth2.client_id` is your actual Client ID (not placeholder)
  - [ ] Permissions include `identity`
  - [ ] Host permissions include `https://www.googleapis.com/*`

### Environment Injection
- [ ] See "✅ Using Google Client ID from .env file" message
- [ ] No "⚠️ Warning" messages about missing .env
- [ ] `manifest.json` Client ID matches your `.env` file

---

## 🚀 Extension Load Checklist

### Chrome Extension Setup
- [ ] Open `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select the `dist` folder
- [ ] Extension loaded without errors
- [ ] Note the Extension ID (32-character string)

### Extension Functionality
- [ ] Click extension icon
- [ ] Side panel opens
- [ ] See all app cards (Blank Page, StackEdit, Prompts, Scripts, Google Drive)
- [ ] Can drag cards to reorder
- [ ] Cards show correct icons and colors

---

## 🔐 OAuth Checklist

### Google Cloud Console
- [ ] Created project in Google Cloud Console
- [ ] Enabled Google Drive API
- [ ] Configured OAuth consent screen
- [ ] Added test users (your email)
- [ ] Created OAuth client ID (Chrome Extension type)
- [ ] Updated OAuth client with your Extension ID from Chrome
- [ ] Scope includes `https://www.googleapis.com/auth/drive.readonly`

### Testing OAuth
- [ ] Click "Google Drive" card in extension
- [ ] Click "Sign in with Google"
- [ ] See Google sign-in popup
- [ ] Grant permissions
- [ ] Successfully signed in
- [ ] Files load from Drive
- [ ] Search works
- [ ] Can open files in new tab
- [ ] Can sign out

---

## 🧪 Functionality Checklist

### Blank Page
- [ ] Loads blank.page in iframe
- [ ] Can type and edit text
- [ ] Back button returns to home

### StackEdit
- [ ] Loads StackEdit in iframe
- [ ] Markdown editor works
- [ ] Back button returns to home

### Prompts Database
- [ ] Opens in new tab (not iframe)
- [ ] Notion page loads correctly

### Scripts
- [ ] Shows script cards
- [ ] Can copy script code
- [ ] Can run scripts on active tab
- [ ] Scripts execute correctly

### Google Drive
- [ ] Authentication flow works
- [ ] Files list loads
- [ ] Search filters files
- [ ] Pagination (load more) works
- [ ] Files open in new tab with correct URL
- [ ] Thumbnails show for images
- [ ] Icons show for files
- [ ] Logout works

---

## 🔒 Security Checklist

### Before Committing to Git
- [ ] `.env` is NOT in git status
- [ ] `.env.example` IS committed (with placeholders only)
- [ ] `.gitignore` includes all sensitive files
- [ ] No secrets in source code
- [ ] No hardcoded Client IDs in code
- [ ] `manifest.json` in `public/` has placeholder (will be replaced at build)

### Verification Commands
```bash
# Check what's staged
git status

# Verify .env is ignored
git check-ignore .env
# Should output: .env

# Verify .env.example is NOT ignored
git check-ignore .env.example
# Should output nothing (file is tracked)

# Check for accidentally committed secrets
git log --all --full-history -- .env
# Should be empty
```

---

## 📦 Deployment Checklist

### Before Sharing
- [ ] All tests pass
- [ ] Build completes without errors
- [ ] Extension works in clean Chrome profile
- [ ] README.md updated
- [ ] ENV_SETUP.md is complete
- [ ] DRIVE_SETUP.md is complete
- [ ] `.env.example` has all required variables
- [ ] No secrets in git history

### Chrome Web Store (Optional)
- [ ] Created developer account
- [ ] Prepared screenshots
- [ ] Written store description
- [ ] Prepared privacy policy
- [ ] Reviewed Chrome Web Store policies
- [ ] OAuth verified (not in testing mode)
- [ ] Uploaded ZIP of `dist` folder

---

## 🐛 Troubleshooting Checklist

### Build Issues
- [ ] Node.js version is 18+ (`node --version`)
- [ ] npm dependencies installed (`npm install`)
- [ ] No TypeScript errors
- [ ] `.env` file is valid UTF-8
- [ ] No syntax errors in `.env`

### OAuth Issues
- [ ] Client ID format is correct
- [ ] Extension ID matches OAuth credentials
- [ ] Test users added in OAuth consent screen
- [ ] Drive API is enabled
- [ ] Correct scope (drive.readonly)

### Extension Issues
- [ ] Loaded from `dist` folder (not root)
- [ ] Developer mode enabled
- [ ] No service worker errors in console
- [ ] Permissions granted in Chrome

---

## ✨ Success Indicators

You're all set if:
- ✅ `npm run build` completes without warnings
- ✅ Extension loads in Chrome without errors
- ✅ Google Drive authentication works
- ✅ All features function correctly
- ✅ `.env` is git ignored
- ✅ Can share repo without exposing secrets

---

## 📞 Need Help?

- Environment issues → See [ENV_SETUP.md](./ENV_SETUP.md)
- OAuth issues → See [DRIVE_SETUP.md](./DRIVE_SETUP.md)
- General questions → Check README.md

---

**Last Updated:** After environment setup implementation
