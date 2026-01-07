
---

## Feature: Google Drive File Browser (Personal Use)

### Goal

Allow the extension to:

* List files from the user’s Google Drive
* Search files by name/type
* Open files (Docs, PDFs, etc.) in a new browser tab
* Work with **read-only access**
* Require **no backend**

---

## Functional Requirements

### 1. Authentication

* Use **OAuth 2.0** via browser extension identity API
* One-time user consent
* Token auto-refresh handled by browser

**Scope**

```
https://www.googleapis.com/auth/drive.readonly
```

---

### 2. File Listing

* Fetch files from Google Drive
* Default sort: `modifiedTime desc`
* Show:

  * fileId
  * name
  * mimeType
  * modifiedTime
  * iconLink / thumbnailLink (optional)

**Supported file types**

* Google Docs
* Google Sheets
* Google Slides
* PDFs
* Images
* Any other Drive file

---

### 3. Search

* Search by:

  * File name
  * MIME type (optional filter)
* Use Drive API query (`q`)
* Debounced input (300–500ms)

Example:

```
name contains 'invoice' and trashed = false
```

---

### 4. Open File

* Open in **new browser tab**
* URL mapping:

  * Google Docs:

    ```
    https://docs.google.com/document/d/{fileId}
    ```
  * Google Sheets:

    ```
    https://docs.google.com/spreadsheets/d/{fileId}
    ```
  * PDFs / other files:

    ```
    https://drive.google.com/file/d/{fileId}/view
    ```

---

### 5. UI Requirements

* Drive panel inside extension popup or full page
* Components:

  * Search input
  * File list (virtualized if large)
  * File icon + name + last modified
* Click → open in new tab
* Loading + empty + error states

---

### 6. Permissions (Manifest V3)

```json
{
  "permissions": ["identity"],
  "host_permissions": [
    "https://www.googleapis.com/*"
  ]
}
```

---

### 7. APIs Used

#### List/Search Files

```
GET https://www.googleapis.com/drive/v3/files
```

Query params:

* `q`
* `pageSize`
* `pageToken`
* `fields=files(id,name,mimeType,modifiedTime,iconLink),nextPageToken`

---

### 8. Pagination

* Handle `nextPageToken`
* Lazy load or infinite scroll
* Cache pages in memory (optional)

---

### 9. Error Handling

* Token expired → re-auth
* 403 / 401 → show re-login CTA
* Network error → retry option

---

### 10. Security & Privacy

* Read-only Drive access
* No file uploads or deletions
* No data stored outside browser
* Tokens stored via browser identity API only

---

### 11. Non-Goals (Explicitly Out of Scope)

* Editing files
* Uploading files
* Sharing files
* Multi-account switching
* Backend/server sync

---

### 12. Cost

* Free under Google Drive API free quota
* No billing required for personal use

---

## Summary (for AI prompt)

> Add a Google Drive browser feature to an existing browser extension that authenticates the user via OAuth, lists and searches Drive files using the Drive API (read-only), and opens selected files in new tabs using Drive/Docs URLs. No backend, no paid services, personal use only.

---

If you want next:

* Minimal **OAuth + Drive API flow diagram**
* **Exact code skeleton** (manifest + background + UI)
* **Best UX layout for popup vs full page**
