

# FULL SPECIFICATION

## Chrome Sidebar Extension – Website Runner (Production-Grade)

---

## 1. Platform & Scope (Hard Requirements)

* Target browser: **Google Chrome**
* Extension standard: **Manifest V3**
* UI location: **Chrome Side Panel (right sidebar)**
* Purpose: **Render an external website inside the sidebar**
* Initial website to load:
  `https://blank.page/`
* UI theme: **Dark mode only (default)**
* Framework: **React**
* Styling: **Tailwind CSS**
* Build system: **Static build output only**
* No server-side runtime inside extension

---

## 2. Core Functional Requirements

### 2.1 Sidebar Behavior

* Sidebar opens when:

  * User clicks extension icon
* Sidebar must:

  * Persist per tab
  * Not open a new browser tab
  * Not use popup windows

---

### 2.2 Website Rendering

* Website must be rendered using **iframe**
* iframe must:

  * Occupy **100% width and height**
  * Have **no borders**
  * Respect dark UI shell
* No DOM access inside iframe
* No script injection into iframe
* Cross-origin isolation must be respected

---

### 2.3 UI Shell (React App)

* React app acts as **container only**
* Responsibilities:

  * Dark layout
  * Header / toolbar (optional but supported)
  * iframe hosting
  * Error state display
* UI must NOT:

  * Reimplement website UI
  * Proxy website content
  * Scrape or rewrite DOM

---

## 3. Dark Mode Requirements

* Dark mode is **default and mandatory**
* Tailwind dark theme must:

  * Use neutral dark background
  * Subtle contrast
  * No bright colors by default
* iframe content is **not styled**
* Dark mode applies only to extension UI shell

---

## 4. Architecture (Mandatory Separation)

### 4.1 UI Layer (Side Panel)

* Built with:

  * React
  * Tailwind CSS
* Responsibilities:

  * Render iframe
  * Show loading / error states
  * Trigger background actions via messaging
  * Perform **minor frontend API calls only if allowed**

---

### 4.2 Background Layer (Service Worker)

* Responsibilities:

  * Handle all privileged operations
  * Call protected or authenticated APIs
  * Store tokens or secrets (if any)
  * Handle CORS-restricted requests
* UI must never store secrets

---

### 4.3 Communication

* UI ↔ Background:

  * Message-based only
  * No direct shared state
* iframe ↔ UI:

  * Optional
  * Only via `postMessage`
  * Must be origin-checked

---

## 5. API Usage Rules

### Allowed

* Read-only APIs
* Lightweight SaaS APIs
* Public REST endpoints
* Feature flags
* Telemetry (if needed)

### Not Allowed

* Backend servers inside extension
* API routes (Next.js style)
* Node.js APIs
* Long-running background jobs

---

## 6. Build & Tooling Requirements

* Build output must be:

  * Static HTML, JS, CSS
  * No runtime compilation
* React build tool must:

  * Support ESM
  * Produce minimal bundles
  * Be CSP-friendly
* Tailwind must be:

  * Precompiled
  * No CDN usage

---

## 7. Security Constraints (Non-Negotiable)

* No bypassing iframe restrictions
* No disabling CSP
* No eval / new Function
* No inline scripts
* Respect Chrome extension CSP
* Website embedding only works if:

  * `X-Frame-Options` allows it
  * CSP allows framing

---

## 8. Error & State Handling

### Required States

* Loading iframe
* Website failed to load
* Network unavailable
* Sidebar unavailable (older Chrome)

### Error UI

* Must be dark themed
* Clear, minimal message
* No technical stack traces

---

## 9. Performance Requirements

* Sidebar open time < 200ms
* No unnecessary re-renders
* iframe loaded once per open
* No memory leaks across tab switches

---

## 10. What MUST NOT Be Used

* ❌ Next.js
* ❌ Server-side rendering
* ❌ API routes
* ❌ Express / Fastify
* ❌ Webpack runtime injection
* ❌ External UI frameworks (MUI, AntD)

---

## 11. Future-Ready (Must Be Supported)

* Ability to:

  * Change iframe URL dynamically
  * Add toolbar controls
  * Add messaging with iframe
  * Add additional API integrations
* Architecture must allow:

  * Scaling features without rewrite

---

## 12. Definition of “Done”

The extension is complete when:

* Clicking the extension icon opens a **dark sidebar**
* `https://blank.page/` renders correctly inside it
* UI is React + Tailwind
* APIs can be called safely
* No CSP or iframe violations
* No Next.js or server code exists

---

