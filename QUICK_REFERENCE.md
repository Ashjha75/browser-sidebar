# 🎯 Quick Reference

**Essential commands and file locations for your extension.**

---

## 🚀 Common Commands

```bash
# First-time setup
npm install
npm run setup              # Interactive environment setup
npm run build             # Build extension

# Development
npm run dev               # Development mode
npm run build             # Production build
npm run preview           # Preview built extension

# Verify environment
cat .env                  # View your environment variables (never commit this!)
cat .env.example          # View template
git status                # Check what will be committed
```

---

## 📁 Important Files

### Environment Files
| File | Purpose | Git? |
|------|---------|------|
| `.env` | Your actual secrets | ❌ NEVER |
| `.env.example` | Template with placeholders | ✅ YES |

### Configuration Files
| File | Purpose |
|------|---------|
| `manifest.json` | Extension config (in `public/`) |
| `package.json` | npm scripts and dependencies |
| `.gitignore` | Protects sensitive files |

### Build Scripts
| File | Purpose |
|------|---------|
| `scripts/inject-env.js` | Injects `.env` into manifest |
| `scripts/setup.js` | Interactive setup wizard |

### Documentation
| File | Purpose |
|------|---------|
| `README.md` | Main documentation |
| `ENV_SETUP.md` | Environment setup guide |
| `DRIVE_SETUP.md` | Google Drive OAuth guide |
| `SETUP_CHECKLIST.md` | Verification checklist |

---

## 🔐 Environment Variables

```env
# Required
VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com

# Optional
VITE_EXTENSION_NAME=My Sidebar
VITE_EXTENSION_VERSION=1.0.0
```

---

## 🎨 App Cards

Your extension includes these tabs:

| Card | Type | Opens |
|------|------|-------|
| Blank Page | Web | In sidebar (iframe) |
| StackEdit | Web | In sidebar (iframe) |
| Prompts Database | Web | New tab (external) |
| My Scripts | Scripts | In sidebar (custom UI) |
| Google Drive | Drive | In sidebar (OAuth + API) |

---

## 🔍 Quick Checks

### Is my .env safe?
```bash
git status                # .env should NOT appear
git check-ignore .env     # Should output: .env
```

### Is my Client ID injected?
```bash
npm run build
cat dist/manifest.json | grep client_id
# Should show your actual Client ID, not placeholder
```

### What's my Extension ID?
1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Look under extension name (32-character string)

---

## 🚨 Emergency: I Committed Secrets!

If you accidentally committed `.env`:

```bash
# Remove from git but keep local file
git rm --cached .env
git commit -m "Remove .env from git"

# If already pushed, consider:
# 1. Rotate your OAuth credentials immediately
# 2. Use git-filter-repo or BFG to clean history
```

---

## 📦 Build Output

After `npm run build`:
```
dist/
├── index.html           # Extension popup
├── manifest.json        # With injected Client ID
├── background.js        # Service worker
├── assets/              # Compiled JS/CSS
│   ├── index-[hash].js
│   └── index-[hash].css
└── logo.png            # Extension icon
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Client ID not set" | Create `.env` file with `VITE_GOOGLE_CLIENT_ID` |
| "Auth failed" | Verify Client ID format and OAuth setup |
| "Files not loading" | Check Drive API is enabled in Google Cloud |
| "Extension won't load" | Build from `dist` folder, check console errors |

---

## 🌐 Useful URLs

| What | URL |
|------|-----|
| Load extension | `chrome://extensions/` |
| Google Cloud Console | `https://console.cloud.google.com/` |
| OAuth Credentials | `https://console.cloud.google.com/apis/credentials` |
| Drive API Dashboard | `https://console.cloud.google.com/apis/api/drive.googleapis.com` |

---

## 📋 Pre-Commit Checklist

Before running `git commit`:
- [ ] Run `git status` and verify `.env` is NOT listed
- [ ] No secrets in staged files
- [ ] `.env.example` has placeholders only
- [ ] Build succeeds without warnings

---

## 🎯 Next Steps

1. **First time?** → Run `npm run setup`
2. **Got Client ID?** → Add to `.env`
3. **Ready to build?** → Run `npm run build`
4. **Need OAuth setup?** → See `DRIVE_SETUP.md`
5. **Sharing code?** → See `SETUP_CHECKLIST.md`

---

**Need more details?** Check the full docs:
- [ENV_SETUP.md](./ENV_SETUP.md) - Environment setup
- [DRIVE_SETUP.md](./DRIVE_SETUP.md) - Google Drive OAuth
- [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) - Complete checklist
- [README.md](./README.md) - Full documentation
