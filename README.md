# Chrome Sidebar Extension – Website Runner

A production-grade Chrome extension that renders external websites in the browser's side panel with a dark-themed interface. Now includes **Google Drive browser** integration!

## Features

- ✅ **Chrome Side Panel** integration (Manifest V3)
- ✅ **Dark Mode** by default
- ✅ **React** + **Tailwind CSS** for modern UI
- ✅ **Multiple App Cards** (Blank Page, StackEdit, Notion, Scripts, Google Drive)
- ✅ **Google Drive Integration** - Browse and open your Drive files
- ✅ **Script Runner** - Execute custom scripts on any page
- ✅ **iframe-based** website rendering
- ✅ **Service Worker** for background operations
- ✅ **OAuth 2.0** authentication for Google Drive
- ✅ **CSP-compliant** static build

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup (Required for Google Drive)

**Option A: Interactive Setup (Recommended)**
```bash
npm run setup
```

**Option B: Manual Setup**
```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your Google OAuth Client ID
# See ENV_SETUP.md for detailed instructions
```

📖 **See [ENV_SETUP.md](./ENV_SETUP.md) for complete environment setup guide**  
📖 **See [DRIVE_SETUP.md](./DRIVE_SETUP.md) for Google Drive OAuth setup**

### 3. Build the Extension
```bash
npm run build
```

### 4. Load in Chrome
- Open Chrome and go to `chrome://extensions/`
- Enable "Developer mode" (top right)
- Click "Load unpacked"
- Select the `dist` folder from this project

## Development

- **Development mode:**
  ```bash
  npm run dev
  ```
  Then load the extension from the `dist` folder.

- **Production build:**
  ```bash
  npm run build
  ```

## Usage

1. Click the extension icon in Chrome's toolbar
2. The side panel will open on the right
3. The website (`https://blank.page/`) will load in the iframe

## Project Structure

```
extension/
├── .env                     # Your secrets (git ignored)
├── .env.example             # Environment template
├── .gitignore               # Protects sensitive files
├── public/
│   ├── manifest.json        # Chrome extension manifest
│   └── background.js        # Service worker with OAuth
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Tailwind styles
│   ├── components/
│   │   ├── ScriptsPage.tsx  # Script runner UI
│   │   └── DrivePage.tsx    # Google Drive browser
│   └── scripts/
│       └── library.ts       # Script collection
├── scripts/
│   ├── inject-env.js        # Environment injection
│   └── setup.js             # Interactive setup
├── index.html               # HTML entry point
├── vite.config.ts           # Build configuration
├── ENV_SETUP.md             # Environment setup guide
├── DRIVE_SETUP.md           # Google Drive setup guide
└── README.md
```

## Architecture

### UI Layer (Side Panel)
- Built with React and Tailwind CSS
- Renders iframe for external websites
- Handles loading and error states
- Dark mode by default

### Background Layer (Service Worker)
- Handles privileged operations
- Opens side panel when icon is clicked
- Message-based communication with UI

### Communication
- UI ↔ Background: Message-based via `chrome.runtime`
- iframe ↔ UI: Optional via `postMessage` (origin-checked)

## Security

- CSP-compliant (no eval, inline scripts)
- Respects iframe restrictions
- Cross-origin isolation respected
- No DOM access to iframe content
- **Environment variables** protect sensitive data
- **Google OAuth** with read-only Drive access
- **.gitignore** prevents committing secrets

## Environment Variables

This project uses environment variables for sensitive data. See [ENV_SETUP.md](./ENV_SETUP.md).

### Protected Files (Never Committed)
- `.env` - Your actual secrets
- `*.key`, `*.pem` - Private keys
- `credentials.json` - OAuth credentials

### Safe to Commit
- `.env.example` - Template with placeholders
- `scripts/inject-env.js` - Build script
- All source code

## Customization

### Change Website URL
Edit `src/App.tsx`:
```typescript
const WEBSITE_URL = 'https://your-website.com/';
```

### Modify Theme
Edit `tailwind.config.js` for custom colors and dark mode settings.

### Add API Integration
Use the service worker in `public/background.js` for API calls requiring CORS or authentication.

## Requirements Met

- ✅ Manifest V3
- ✅ Chrome Side Panel
- ✅ React + Tailwind CSS
- ✅ Dark mode default
- ✅ Static build output
- ✅ No server-side runtime
- ✅ CSP-compliant
- ✅ iframe with no borders
- ✅ Service worker for background tasks

## License

MIT
