# 🔐 Environment Setup Guide

This project uses environment variables to keep sensitive data (like Google OAuth Client ID) secure and out of version control.

---

## 🚀 Quick Setup

### Option 1: Interactive Setup (Recommended)

```bash
npm run setup
```

This will guide you through the setup process interactively.

### Option 2: Manual Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```
   
   On Windows:
   ```cmd
   copy .env.example .env
   ```

2. **Edit `.env` file** and add your Google OAuth Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

---

## 📝 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for Drive API | `123456-abc.apps.googleusercontent.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_EXTENSION_NAME` | Extension display name | `My Sidebar` |
| `VITE_EXTENSION_VERSION` | Extension version | From `package.json` |

---

## 🔒 Security & Git

### What's Protected?

The following files are **automatically ignored** by git (see `.gitignore`):

✅ `.env` - Your actual environment variables (NEVER commit this)  
✅ `.env.local` - Local overrides  
✅ `.env.*.local` - Environment-specific local files  
✅ `*.key` - Private keys  
✅ `*.pem` - Certificates  
✅ `secrets/` - Any secrets folder  
✅ `credentials.json` - Google credentials  

### What's Safe to Commit?

✅ `.env.example` - Template with placeholder values  
✅ `scripts/inject-env.js` - Environment injection script  
✅ `scripts/setup.js` - Setup helper script  

---

## 🛠️ How It Works

### Build Process

When you run `npm run build` or `npm run dev`, the following happens:

1. **`inject-env.js` script runs first**
   - Reads your `.env` file
   - Extracts `VITE_GOOGLE_CLIENT_ID`
   - Updates `public/manifest.json` with the Client ID

2. **Vite builds the extension**
   - Compiles TypeScript and React
   - Bundles everything to `dist/` folder

3. **Extension files are copied**
   - `manifest.json` (with injected Client ID)
   - `background.js`
   - Other assets

### Development Workflow

```bash
# First time setup
npm run setup

# During development
npm run dev

# Before deploying/testing
npm run build
```

---

## 🔍 Troubleshooting

### "VITE_GOOGLE_CLIENT_ID not set"

**Problem:** You see this warning when building.

**Solution:** 
1. Make sure `.env` file exists
2. Check that `VITE_GOOGLE_CLIENT_ID` is set correctly
3. Run `npm run setup` to recreate it

### "manifest.json has placeholder Client ID"

**Problem:** Extension shows "YOUR_CLIENT_ID_HERE" in manifest.

**Solution:**
1. Create `.env` file with your actual Client ID
2. Run `npm run build` again
3. The Client ID will be injected automatically

### "Client ID format looks incorrect"

**Problem:** Your Client ID doesn't end with `.apps.googleusercontent.com`

**Solution:**
1. Double-check you copied the correct Client ID from Google Cloud Console
2. Format should be: `xxxxx-xxxxx.apps.googleusercontent.com`
3. See [DRIVE_SETUP.md](./DRIVE_SETUP.md) for how to get the correct ID

---

## 📂 File Structure

```
extension/
├── .env                    # Your secrets (git ignored) ❌ DO NOT COMMIT
├── .env.example            # Template (safe to commit) ✅
├── .gitignore              # Protects sensitive files
├── scripts/
│   ├── inject-env.js       # Injects env vars into manifest
│   └── setup.js            # Interactive setup wizard
├── public/
│   ├── manifest.json       # Updated by inject-env.js
│   └── background.js       # Extension service worker
└── src/
    └── ...                 # Your React components
```

---

## 🎯 Best Practices

### ✅ DO:
- Keep `.env` file local and never commit it
- Use `.env.example` as a template for others
- Add new secrets to both `.env` and `.env.example` (with placeholders)
- Run `npm run build` after changing `.env`

### ❌ DON'T:
- Commit `.env` file to git
- Share your `.env` file publicly
- Hardcode secrets in source code
- Skip the environment setup

---

## 🔄 Updating Environment Variables

If you need to update your Client ID or add new variables:

1. **Edit `.env` file:**
   ```env
   VITE_GOOGLE_CLIENT_ID=new-client-id.apps.googleusercontent.com
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Reload extension** in Chrome

---

## 🚢 Deployment Checklist

Before sharing or deploying your extension:

- [ ] `.env` file is NOT committed to git
- [ ] `.env.example` has all required variables (with placeholders)
- [ ] `.gitignore` includes `.env`
- [ ] `README.md` mentions environment setup
- [ ] OAuth Client ID is from production credentials
- [ ] All team members have their own `.env` files

---

## 🆘 Getting Help

### Environment Issues
- Check that `.env` file exists
- Verify variable names match exactly (case-sensitive)
- Make sure there are no spaces around `=` sign
- Check for quotes if values contain spaces

### OAuth Issues
- See [DRIVE_SETUP.md](./DRIVE_SETUP.md) for OAuth setup
- Verify Client ID format
- Check extension ID matches OAuth credentials

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Google OAuth for Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)
- [Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)

---

## 🎉 You're All Set!

Once your `.env` is configured:
1. Run `npm run build`
2. Load extension in Chrome
3. Click Google Drive tab
4. Sign in and enjoy!

Questions? Check [DRIVE_SETUP.md](./DRIVE_SETUP.md) or open an issue.
