# 🎨 Environment Setup Architecture

Visual guide to understand how the environment system works.

---

## 📊 File Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    DEVELOPER MACHINE                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1️⃣ First Time Setup                                    │
│  ┌──────────────┐                                        │
│  │ npm run setup│                                        │
│  └──────┬───────┘                                        │
│         │                                                 │
│         v                                                 │
│  ┌──────────────────┐                                    │
│  │ scripts/setup.js │                                    │
│  │ ┌──────────────┐ │                                    │
│  │ │ Ask for      │ │                                    │
│  │ │ Client ID    │ │                                    │
│  │ └──────────────┘ │                                    │
│  └──────┬───────────┘                                    │
│         │                                                 │
│         v                                                 │
│  ┌──────────────┐        ❌ GIT IGNORED                  │
│  │   .env       │◄───────────────────────                │
│  │              │                                         │
│  │ VITE_GOOGLE_ │                                         │
│  │ CLIENT_ID=   │                                         │
│  │ real-id.apps │                                         │
│  │ .google...   │                                         │
│  └──────────────┘                                        │
│                                                           │
│  2️⃣ Build Process                                       │
│  ┌──────────────┐                                        │
│  │ npm run build│                                        │
│  └──────┬───────┘                                        │
│         │                                                 │
│         v                                                 │
│  ┌───────────────────────┐                               │
│  │ scripts/inject-env.js │                               │
│  │ ┌───────────────────┐ │                               │
│  │ │ Read .env         │ │                               │
│  │ │ Extract Client ID │ │                               │
│  │ │ Update manifest   │ │                               │
│  │ └───────────────────┘ │                               │
│  └──────┬────────────────┘                               │
│         │                                                 │
│         v                                                 │
│  ┌──────────────────────┐                                │
│  │ public/manifest.json │                                │
│  │ ┌──────────────────┐ │                                │
│  │ │ "oauth2": {      │ │                                │
│  │ │   "client_id":   │ │                                │
│  │ │   "real-id.apps  │ │  ← Injected!                   │
│  │ │   .google..."    │ │                                │
│  │ │ }                │ │                                │
│  │ └──────────────────┘ │                                │
│  └──────┬───────────────┘                                │
│         │                                                 │
│         v                                                 │
│  ┌──────────────┐                                        │
│  │  Vite Build  │                                        │
│  └──────┬───────┘                                        │
│         │                                                 │
│         v                                                 │
│  ┌──────────────┐        ❌ GIT IGNORED                  │
│  │   dist/      │◄───────────────────────                │
│  │ ┌──────────┐ │                                        │
│  │ │manifest  │ │  ← With real Client ID                 │
│  │ │background│ │                                        │
│  │ │assets/   │ │                                        │
│  │ └──────────┘ │                                        │
│  └──────────────┘                                        │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      GIT REPOSITORY                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ✅ Safe to commit:                                      │
│  ┌──────────────────┐                                    │
│  │ .env.example     │  ← Template with placeholders      │
│  │                  │                                     │
│  │ VITE_GOOGLE_     │                                     │
│  │ CLIENT_ID=       │                                     │
│  │ YOUR_CLIENT_ID   │                                     │
│  │ _HERE.apps...    │                                     │
│  └──────────────────┘                                    │
│                                                           │
│  ┌──────────────────┐                                    │
│  │ scripts/         │  ← Build automation                │
│  │  inject-env.js   │                                    │
│  │  setup.js        │                                    │
│  └──────────────────┘                                    │
│                                                           │
│  ┌──────────────────┐                                    │
│  │ Documentation    │  ← Setup guides                    │
│  │  ENV_SETUP.md    │                                    │
│  │  DRIVE_SETUP.md  │                                    │
│  │  README.md       │                                    │
│  └──────────────────┘                                    │
│                                                           │
│  ┌──────────────────┐                                    │
│  │ Source Code      │  ← Your React/TS code              │
│  │  src/            │                                    │
│  │  public/         │                                    │
│  └──────────────────┘                                    │
│                                                           │
│  ❌ Ignored by git:                                      │
│  ┌──────────────────┐                                    │
│  │ .env             │  ← Your secrets (local only)       │
│  │ dist/            │  ← Build output                    │
│  │ node_modules/    │  ← Dependencies                    │
│  └──────────────────┘                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Build Process Flow

```
START
  │
  ├─> npm run build
  │
  ├─> scripts/inject-env.js
  │     │
  │     ├─> Check if .env exists
  │     │     │
  │     │     ├─> YES: Read VITE_GOOGLE_CLIENT_ID
  │     │     │         │
  │     │     │         ├─> Found valid ID?
  │     │     │         │     │
  │     │     │         │     ├─> YES: Use it ✅
  │     │     │         │     │
  │     │     │         │     └─> NO: Use placeholder ⚠️
  │     │     │
  │     │     └─> NO: Use placeholder ⚠️
  │     │
  │     └─> Update public/manifest.json
  │           │
  │           └─> oauth2.client_id = [value]
  │
  ├─> vite build
  │     │
  │     ├─> Compile TypeScript
  │     ├─> Bundle React components
  │     ├─> Process CSS
  │     └─> Copy assets
  │
  ├─> Copy extension files
  │     │
  │     ├─> manifest.json (with injected ID)
  │     ├─> background.js
  │     └─> logo.png
  │
  └─> dist/ folder ready!
        │
        └─> Load in Chrome ✅
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────┐
│         Layer 1: .gitignore            │
│  Prevents .env from being staged       │
└───────────────┬────────────────────────┘
                │
                v
┌────────────────────────────────────────┐
│    Layer 2: Environment Injection      │
│  Real values only exist locally        │
│  Source files have placeholders        │
└───────────────┬────────────────────────┘
                │
                v
┌────────────────────────────────────────┐
│     Layer 3: Build-time Injection      │
│  Secrets injected during build         │
│  Not hardcoded in source               │
└───────────────┬────────────────────────┘
                │
                v
┌────────────────────────────────────────┐
│      Layer 4: dist/ Exclusion          │
│  Build output not committed            │
│  Each build generates fresh files      │
└───────────────┬────────────────────────┘
                │
                v
┌────────────────────────────────────────┐
│         Layer 5: Documentation         │
│  Clear warnings and setup guides       │
│  Team knows what NOT to commit         │
└────────────────────────────────────────┘
```

---

## 📁 File Responsibility Matrix

| File | Contains Secrets? | In Git? | Purpose |
|------|------------------|---------|---------|
| `.env` | ✅ YES | ❌ NO | Your actual secrets |
| `.env.example` | ❌ NO | ✅ YES | Template for others |
| `.gitignore` | ❌ NO | ✅ YES | Protect secrets |
| `public/manifest.json` | 🔄 Varies | ✅ YES | Has placeholder (updated at build) |
| `dist/manifest.json` | ✅ YES | ❌ NO | Has real ID after build |
| `scripts/inject-env.js` | ❌ NO | ✅ YES | Automation script |
| `scripts/setup.js` | ❌ NO | ✅ YES | Setup wizard |

---

## 🎯 Developer Workflow

```
┌─────────────────────────────────────────────┐
│             NEW DEVELOPER                    │
└──────────────┬──────────────────────────────┘
               │
               v
        ┌──────────────┐
        │ Clone repo   │
        └──────┬───────┘
               │
               v
        ┌──────────────┐
        │ npm install  │
        └──────┬───────┘
               │
               v
        ┌──────────────────┐
        │ Read ENV_SETUP.md│
        └──────┬───────────┘
               │
               v
        ┌──────────────────┐
        │ Get OAuth Client │
        │ ID from Google   │
        └──────┬───────────┘
               │
               v
        ┌──────────────┐
        │ npm run setup│ ← Interactive!
        └──────┬───────┘
               │
               v
        ┌──────────────┐
        │ .env created │
        └──────┬───────┘
               │
               v
        ┌──────────────┐
        │ npm run build│
        └──────┬───────┘
               │
               v
        ┌──────────────────┐
        │ Load in Chrome   │
        └──────┬───────────┘
               │
               v
        ┌──────────────────┐
        │ Test & Develop ✅│
        └──────────────────┘
```

---

## 🔍 What Happens Where?

### Local Machine Only
```
.env
├─> Your secrets
├─> Never leaves your machine
├─> Not in git
└─> Backed up separately (password manager)

dist/
├─> Build output with secrets
├─> Generated fresh each build
├─> Not in git
└─> Loaded into Chrome for testing
```

### In Git Repository
```
.env.example
├─> Template for others
├─> Placeholder values only
├─> Safe to share publicly
└─> Starting point for new developers

Source Code
├─> No hardcoded secrets
├─> Uses placeholders
├─> Safe to share
└─> Clean and documented

Scripts
├─> Automation helpers
├─> Read .env at build time
├─> Inject into manifest
└─> No secrets stored in scripts
```

### Build-Time Magic
```
inject-env.js runs:
1. Reads .env (if exists)
2. Extracts Client ID
3. Updates manifest.json
4. Vite builds everything
5. Copies to dist/
6. Ready to load!

Result: Extension has your secrets,
        but source code doesn't!
```

---

## 🎊 Success Indicators

### You're set up correctly if:

```
✅ .env exists locally
✅ .env contains your Client ID
✅ .env is NOT in git status
✅ .env.example IS in git
✅ npm run build succeeds
✅ dist/manifest.json has real ID
✅ public/manifest.json has placeholder
✅ Extension loads in Chrome
✅ Google Drive auth works
```

### Warning signs:

```
⚠️  .env appears in git status
⚠️  Client ID in source code
⚠️  dist/ folder in git
⚠️  "YOUR_CLIENT_ID_HERE" in dist/manifest.json
⚠️  Build fails
⚠️  Auth fails in extension
```

---

## 📚 Reference

| Need | See Document |
|------|--------------|
| Setup .env | `ENV_SETUP.md` |
| Get Client ID | `DRIVE_SETUP.md` |
| Verify setup | `SETUP_CHECKLIST.md` |
| Quick commands | `QUICK_REFERENCE.md` |
| How it works | This document! |

---

**Visual guide complete! Now you understand exactly how the environment system protects your secrets.** 🎨✨
