# Chrome Sidebar Extension – Website Runner

A production-grade Chrome extension that renders external websites in the browser's side panel with a dark-themed interface.

## Features

- ✅ **Chrome Side Panel** integration (Manifest V3)
- ✅ **Dark Mode** by default
- ✅ **React** + **Tailwind CSS** for modern UI
- ✅ **iframe-based** website rendering
- ✅ **Service Worker** for background operations
- ✅ **CSP-compliant** static build

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build
   ```

3. **Load in Chrome:**
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
├── public/
│   ├── manifest.json        # Chrome extension manifest
│   └── background.js         # Service worker
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind styles
├── index.html               # HTML entry point
├── vite.config.ts           # Build configuration
├── tailwind.config.js       # Tailwind configuration
├── package.json
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
