# 🚀 Complete Google Drive + Appwrite Setup for React + Vite Chrome Extension

## 📋 Overview

This guide provides complete setup instructions for integrating **Google Drive** with **Appwrite** in a React + Vite Chrome Extension project. The implementation allows users to attach Google Drive documents (Docs, Sheets, Slides, PDFs) with read-only access.

---

## 🎯 What You'll Build

- **Google OAuth 2.0 Authentication** in Chrome Extension
- **Appwrite Backend** for user authentication and data storage
- **Google Drive File Picker** modal component
- **File Attachment System** with persistent storage
- **Read-only Access** to Google Drive files

---

## 📦 Prerequisites

- Node.js 18+ installed
- Google Cloud account
- Appwrite instance (local or cloud)
- Basic knowledge of React, Vite, and Chrome Extensions

---

# Part 1: Project Setup

## 1.1 Create React + Vite Chrome Extension

```bash
# Create new Vite project
npm create vite@latest my-chrome-extension -- --template react-ts

# Navigate to project
cd my-chrome-extension

# Install dependencies
npm install
```

## 1.2 Install Required Dependencies

```bash
# Install Appwrite SDK
npm install appwrite

# Install Google Drive libraries
npm install gapi-script

# Install UI libraries (optional but recommended)
npm install @headlessui/react @heroicons/react
```

## 1.3 Configure Vite for Chrome Extension

Create/Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

## 1.4 Create manifest.json

Create `public/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Idea Tracker Chrome Extension",
  "version": "1.0.0",
  "description": "Track your ideas with Google Drive integration",
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "action": {
    "default_popup": "index.html",
    "default_title": "Idea Tracker"
  },
  "permissions": [
    "storage",
    "identity"
  ],
  "host_permissions": [
    "https://www.googleapis.com/*",
    "https://accounts.google.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly"
    ]
  },
  "key": "YOUR_CHROME_EXTENSION_KEY",
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

---

# Part 2: Appwrite Backend Setup

## 2.1 Install Appwrite (Self-Hosted)

### Option A: Docker Installation (Recommended)

```bash
# Install Appwrite using Docker
docker run -it --rm \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
    --entrypoint="install" \
    appwrite/appwrite:1.6.0

# After installation, Appwrite will be available at:
# http://localhost (Web Console)
# http://localhost/v1 (API Endpoint)
```

### Option B: Appwrite Cloud

Sign up at [cloud.appwrite.io](https://cloud.appwrite.io) and create a new project.

## 2.2 Create Appwrite Project

1. Open Appwrite Console at `http://localhost` or cloud URL
2. Click **Create Project**
3. Enter project details:
   - **Name**: `Idea Tracker Extension`
   - **Project ID**: Will be auto-generated (copy this!)
4. Click **Create**

## 2.3 Configure Web Platform

1. In your project, go to **Settings** → **Platforms**
2. Click **Add Platform** → **Web**
3. Platform details:
   - **Name**: `Chrome Extension`
   - **Hostname**: `chrome-extension://[YOUR_EXTENSION_ID]`
   - For development, also add: `localhost`, `127.0.0.1`
4. Click **Add**

**Note**: Get your extension ID from `chrome://extensions` after loading the unpacked extension.

## 2.4 Setup Authentication

1. Go to **Auth** section in sidebar
2. Click **Settings** tab
3. Enable **Email/Password** authentication
4. Configure:
   - **Session Length**: 365 days
   - **Password History**: 5 (recommended)
   - **Password Dictionary**: Enable
   - **Email Verification**: Optional for extension

## 2.5 Create Database

1. Go to **Databases** in sidebar
2. Click **Create Database**
3. Database details:
   - **Database ID**: `ideas-db`
   - **Name**: `Ideas Database`
4. Click **Create**

## 2.6 Create Collection

1. Inside `ideas-db`, click **Create Collection**
2. Collection details:
   - **Collection ID**: `ideas`
   - **Name**: `Ideas`
3. Click **Create**

## 2.7 Add Collection Attributes

Click **Add Attribute** for each field:

| Attribute Key | Type   | Size  | Required | Array | Default |
|--------------|--------|-------|----------|-------|---------|
| title        | String | 255   | Yes      | No    | -       |
| description  | String | 5000  | Yes      | No    | -       |
| status       | Enum   | -     | Yes      | No    | Planning |
| tags         | String | 100   | No       | Yes   | []      |
| driveFileIds | String | 2000  | No       | Yes   | []      |
| userId       | String | 255   | Yes      | No    | -       |

**For Status Enum**:
- Values: `Planning`, `In_Progress`, `Completed`
- Default: `Planning`

**For driveFileIds**:
- This stores Google Drive file IDs
- Array: Yes
- Required: No

## 2.8 Configure Collection Permissions

1. Go to **Settings** tab in the collection
2. Under **Permissions**:
   - **Create**: `Users` (any authenticated user)
   - **Read**: `Users` (any authenticated user) OR document-level security
   - **Update**: `Users` (any authenticated user) OR document-level security
   - **Delete**: `Users` (any authenticated user) OR document-level security

**For Document-Level Security** (Recommended):
- Enable "Document Security"
- Permissions will be set programmatically per document

## 2.9 Create Storage Bucket (Optional - for images)

1. Go to **Storage** in sidebar
2. Click **Create Bucket**
3. Bucket details:
   - **Bucket ID**: `idea-images`
   - **Name**: `Idea Images`
   - **Max File Size**: 10MB
   - **Allowed Extensions**: `jpg,png,gif,webp`
   - **Compression**: `gzip`
   - **Encryption**: Enable
   - **Antivirus**: Enable (if available)
4. Click **Create**

---

# Part 3: Google Cloud Console Setup

## 3.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name: `Idea Tracker Extension`
4. Click **Create**
5. Wait for project creation

## 3.2 Enable Google Drive API

1. In navigation menu, go to **APIs & Services** → **Library**
2. Search for `Google Drive API`
3. Click on **Google Drive API**
4. Click **Enable**
5. Also enable **Google Picker API** (search and enable)

## 3.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in required fields:
   - **App name**: `Idea Tracker Extension`
   - **User support email**: Your email
   - **App logo**: Upload 120x120 PNG (optional)
   - **Application home page**: Your extension URL or website
   - **Developer contact**: Your email
5. Click **Save and Continue**

### Add Scopes:
1. Click **Add or Remove Scopes**
2. Manually add these scopes:
   ```
   https://www.googleapis.com/auth/drive.readonly
   https://www.googleapis.com/auth/drive.metadata.readonly
   ```
3. Click **Update** → **Save and Continue**

### Add Test Users:
1. Click **Add Users**
2. Add your Gmail addresses for testing
3. Click **Save and Continue**
4. Review and click **Back to Dashboard**

## 3.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Chrome extension**
4. **Name**: `Idea Tracker Extension`
5. **Application ID**: Your Chrome extension ID
   - Get from `chrome://extensions` (Developer mode enabled)
   - Format: `abcdefghijklmnopqrstuvwxyzabcdef`
6. Click **Create**
7. **Copy the Client ID** - you'll need this!

## 3.5 Create API Key (Required)

1. Click **+ Create Credentials** → **API Key**
2. Copy the API Key
3. Click **Edit API Key** (gear icon)
4. **Restrict Key**:
   - **Application restrictions**: None (for Chrome extensions)
   - **API restrictions**: Select "Restrict key"
   - Check: **Google Drive API** and **Google Picker API**
5. Click **Save**

---

# Part 4: Environment Configuration

## 4.1 Create Environment File

Create `.env` in project root:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=http://localhost/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=ideas-db
VITE_APPWRITE_COLLECTION_ID=ideas
VITE_APPWRITE_BUCKET_ID=idea-images

# Google Drive Configuration
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your_api_key_here

# Extension Configuration
VITE_EXTENSION_ID=your_chrome_extension_id
```

## 4.2 Create Environment Types

Create `src/types/env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string;
  readonly VITE_APPWRITE_PROJECT_ID: string;
  readonly VITE_APPWRITE_DATABASE_ID: string;
  readonly VITE_APPWRITE_COLLECTION_ID: string;
  readonly VITE_APPWRITE_BUCKET_ID: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_EXTENSION_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## 4.3 Create Config File

Create `src/config/index.ts`:

```typescript
export const config = {
  appwrite: {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    collectionId: import.meta.env.VITE_APPWRITE_COLLECTION_ID,
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID,
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ],
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
    ],
  },
  extension: {
    id: import.meta.env.VITE_EXTENSION_ID,
  },
};
```

---

# Part 5: Service Implementation

## 5.1 Appwrite Service

Create `src/services/appwrite.service.ts`:

```typescript
import { Client, Account, Databases, Storage, ID } from 'appwrite';
import { config } from '../config';

class AppwriteService {
  private client: Client;
  public account: Account;
  public databases: Databases;
  public storage: Storage;

  constructor() {
    this.client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
  }

  // Authentication Methods
  async createAccount(email: string, password: string, name: string) {
    try {
      const response = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to login');
    }
  }

  async logout() {
    try {
      await this.account.deleteSession('current');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout');
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error: any) {
      return null;
    }
  }

  // Database Methods
  async createDocument(data: any, permissions?: string[]) {
    try {
      return await this.databases.createDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        ID.unique(),
        data,
        permissions
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create document');
    }
  }

  async getDocument(documentId: string) {
    try {
      return await this.databases.getDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        documentId
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get document');
    }
  }

  async listDocuments(queries?: string[]) {
    try {
      return await this.databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        queries
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to list documents');
    }
  }

  async updateDocument(documentId: string, data: any) {
    try {
      return await this.databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        documentId,
        data
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update document');
    }
  }

  async deleteDocument(documentId: string) {
    try {
      return await this.databases.deleteDocument(
        config.appwrite.databaseId,
        config.appwrite.collectionId,
        documentId
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete document');
    }
  }
}

export const appwriteService = new AppwriteService();
```

## 5.2 Google Drive Service

Create `src/services/google-drive.service.ts`:

```typescript
import { config } from '../config';

declare const gapi: any;

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

class GoogleDriveService {
  private gapiLoaded = false;
  private accessToken: string | null = null;
  private readonly TOKEN_KEY = 'google_drive_token';
  private readonly TOKEN_EXPIRY_KEY = 'google_drive_token_expiry';

  constructor() {
    this.loadTokenFromStorage();
  }

  // Load token from Chrome storage
  private loadTokenFromStorage(): void {
    chrome.storage.local.get([this.TOKEN_KEY, this.TOKEN_EXPIRY_KEY], (result) => {
      if (result[this.TOKEN_KEY] && result[this.TOKEN_EXPIRY_KEY]) {
        const expiryTime = parseInt(result[this.TOKEN_EXPIRY_KEY], 10);
        if (Date.now() < expiryTime) {
          this.accessToken = result[this.TOKEN_KEY];
        } else {
          this.clearTokenFromStorage();
        }
      }
    });
  }

  // Save token to Chrome storage
  private saveTokenToStorage(token: string): void {
    const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    chrome.storage.local.set({
      [this.TOKEN_KEY]: token,
      [this.TOKEN_EXPIRY_KEY]: expiryTime.toString(),
    });
  }

  // Clear token from Chrome storage
  private clearTokenFromStorage(): void {
    chrome.storage.local.remove([this.TOKEN_KEY, this.TOKEN_EXPIRY_KEY]);
    this.accessToken = null;
  }

  // Load Google API library
  async loadGapi(): Promise<void> {
    if (this.gapiLoaded) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: config.google.apiKey,
              discoveryDocs: config.google.discoveryDocs,
            });
            this.gapiLoaded = true;
            if (this.accessToken) {
              gapi.client.setToken({ access_token: this.accessToken });
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.body.appendChild(script);
    });
  }

  // Sign in using Chrome Identity API
  async signIn(): Promise<void> {
    await this.loadGapi();

    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        { interactive: true },
        async (token) => {
          if (chrome.runtime.lastError || !token) {
            reject(chrome.runtime.lastError || new Error('Failed to get token'));
            return;
          }

          this.accessToken = token;
          this.saveTokenToStorage(token);
          gapi.client.setToken({ access_token: token });
          resolve();
        }
      );
    });
  }

  // Sign out
  async signOut(): Promise<void> {
    if (!this.accessToken) return;

    return new Promise((resolve, reject) => {
      chrome.identity.removeCachedAuthToken(
        { token: this.accessToken! },
        () => {
          this.clearTokenFromStorage();
          gapi.client.setToken(null);
          resolve();
        }
      );
    });
  }

  // Check if user is signed in
  async checkSignInStatus(): Promise<boolean> {
    await this.loadGapi();
    return !!this.accessToken;
  }

  // List files from Google Drive
  async listFiles(
    pageSize: number = 20,
    pageToken?: string,
    query?: string
  ): Promise<{ files: GoogleDriveFile[]; nextPageToken?: string }> {
    await this.ensureSignedIn();

    const defaultQuery =
      "mimeType='application/vnd.google-apps.document' or " +
      "mimeType='application/vnd.google-apps.spreadsheet' or " +
      "mimeType='application/vnd.google-apps.presentation' or " +
      "mimeType='application/pdf' and trashed=false";

    const finalQuery = query || defaultQuery;

    try {
      const response = await gapi.client.drive.files.list({
        pageSize,
        pageToken,
        fields:
          'nextPageToken, files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, size, createdTime, modifiedTime)',
        q: finalQuery,
        orderBy: 'modifiedTime desc',
      });

      return {
        files: response.result.files || [],
        nextPageToken: response.result.nextPageToken,
      };
    } catch (error: any) {
      if (error.status === 401) {
        this.clearTokenFromStorage();
        throw new Error('Session expired. Please sign in again.');
      }
      throw new Error('Failed to fetch files from Google Drive');
    }
  }

  // Search files
  async searchFiles(
    searchTerm: string,
    pageSize: number = 20
  ): Promise<GoogleDriveFile[]> {
    await this.ensureSignedIn();

    const query = `name contains '${searchTerm}' and trashed=false`;

    try {
      const response = await gapi.client.drive.files.list({
        pageSize,
        fields:
          'files(id, name, mimeType, webViewLink, iconLink, thumbnailLink, size, createdTime, modifiedTime)',
        q: query,
        orderBy: 'modifiedTime desc',
      });

      return response.result.files || [];
    } catch (error: any) {
      if (error.status === 401) {
        this.clearTokenFromStorage();
        throw new Error('Session expired. Please sign in again.');
      }
      throw new Error('Failed to search files');
    }
  }

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<GoogleDriveFile> {
    await this.ensureSignedIn();

    try {
      const response = await gapi.client.drive.files.get({
        fileId,
        fields:
          'id, name, mimeType, webViewLink, iconLink, thumbnailLink, size, createdTime, modifiedTime',
      });

      return response.result;
    } catch (error: any) {
      throw new Error('Failed to get file metadata');
    }
  }

  // Get multiple files metadata
  async getFilesMetadata(fileIds: string[]): Promise<GoogleDriveFile[]> {
    await this.ensureSignedIn();

    try {
      const promises = fileIds.map((id) => this.getFileMetadata(id));
      return await Promise.all(promises);
    } catch (error: any) {
      return [];
    }
  }

  // Get file icon based on MIME type
  getFileIcon(mimeType: string): string {
    const iconMap: { [key: string]: string } = {
      'application/vnd.google-apps.document': '📄',
      'application/vnd.google-apps.spreadsheet': '📊',
      'application/vnd.google-apps.presentation': '📽️',
      'application/pdf': '📕',
      'application/vnd.google-apps.folder': '📁',
    };
    return iconMap[mimeType] || '📎';
  }

  // Get file type name
  getFileTypeName(mimeType: string): string {
    const typeMap: { [key: string]: string } = {
      'application/vnd.google-apps.document': 'Google Doc',
      'application/vnd.google-apps.spreadsheet': 'Google Sheet',
      'application/vnd.google-apps.presentation': 'Google Slides',
      'application/pdf': 'PDF Document',
    };
    return typeMap[mimeType] || 'Document';
  }

  // Format file size
  formatFileSize(bytes: string | undefined): string {
    if (!bytes) return 'Unknown size';

    const size = parseInt(bytes);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024)
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  // Ensure user is signed in
  private async ensureSignedIn(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not signed in to Google Drive. Please sign in first.');
    }
  }
}

export const googleDriveService = new GoogleDriveService();
```

---

# Part 6: Component Implementation

## 6.1 Google Drive Picker Component

Create `src/components/GoogleDrivePicker.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { googleDriveService, GoogleDriveFile } from '../services/google-drive.service';

interface GoogleDrivePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onFilesSelected: (files: GoogleDriveFile[]) => void;
  multiSelect?: boolean;
  maxFiles?: number;
}

export const GoogleDrivePicker: React.FC<GoogleDrivePickerProps> = ({
  isOpen,
  onClose,
  onFilesSelected,
  multiSelect = true,
  maxFiles = 5,
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      checkSignInStatus();
    }
  }, [isOpen]);

  const checkSignInStatus = async () => {
    const signedIn = await googleDriveService.checkSignInStatus();
    setIsSignedIn(signedIn);
    if (signedIn) {
      await loadFiles();
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await googleDriveService.signIn();
      setIsSignedIn(true);
      await loadFiles();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to sign in');
      setIsSignedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleDriveService.signOut();
      setIsSignedIn(false);
      setFiles([]);
      setSelectedFiles([]);
    } catch (error: any) {
      setErrorMessage('Failed to sign out');
    }
  };

  const loadFiles = async (loadMore = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const pageToken = loadMore ? nextPageToken : undefined;
      const result = await googleDriveService.listFiles(20, pageToken);
      setFiles(loadMore ? [...files, ...result.files] : result.files);
      setNextPageToken(result.nextPageToken);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadFiles();
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const results = await googleDriveService.searchFiles(searchTerm);
      setFiles(results);
      setNextPageToken(undefined);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to search files');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFileSelection = (file: GoogleDriveFile) => {
    if (selectedFiles.find((f) => f.id === file.id)) {
      setSelectedFiles(selectedFiles.filter((f) => f.id !== file.id));
    } else {
      if (multiSelect) {
        if (selectedFiles.length < maxFiles) {
          setSelectedFiles([...selectedFiles, file]);
        } else {
          setErrorMessage(`You can only select up to ${maxFiles} files`);
        }
      } else {
        setSelectedFiles([file]);
      }
    }
  };

  const handleAttach = () => {
    onFilesSelected(selectedFiles);
    handleClose();
  };

  const handleClose = () => {
    setFiles([]);
    setSelectedFiles([]);
    setSearchTerm('');
    setNextPageToken(undefined);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Select from Google Drive
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isSignedIn ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">
                Sign in to Google Drive
              </h3>
              <p className="text-gray-600 mb-6 text-center">
                Connect your Google Drive to attach documents
              </p>
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search files..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Search
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {errorMessage}
                </div>
              )}

              {/* Files Grid */}
              {isLoading && files.length === 0 ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No files found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {files.map((file) => {
                    const isSelected = selectedFiles.find(
                      (f) => f.id === file.id
                    );
                    return (
                      <div
                        key={file.id}
                        onClick={() => toggleFileSelection(file)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">
                            {googleDriveService.getFileIcon(file.mimeType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {file.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {googleDriveService.getFileTypeName(file.mimeType)}
                            </p>
                            {file.size && (
                              <p className="text-xs text-gray-400">
                                {googleDriveService.formatFileSize(file.size)}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="text-blue-600">✓</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Load More */}
              {nextPageToken && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => loadFiles(true)}
                    disabled={isLoading}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {isSignedIn && (
          <div className="flex items-center justify-between p-6 border-t">
            <div className="text-sm text-gray-600">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}{' '}
              selected {multiSelect && `(max ${maxFiles})`}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Sign Out
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAttach}
                disabled={selectedFiles.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Attach {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

## 6.2 Example Usage in Idea Form

Create `src/components/IdeaForm.tsx`:

```typescript
import React, { useState } from 'react';
import { GoogleDrivePicker } from './GoogleDrivePicker';
import { GoogleDriveFile } from '../services/google-drive.service';
import { appwriteService } from '../services/appwrite.service';
import { Permission, Role } from 'appwrite';

export const IdeaForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planning');
  const [tags, setTags] = useState<string[]>([]);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDriveFilesSelected = (files: GoogleDriveFile[]) => {
    setDriveFiles(files);
    setShowDrivePicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await appwriteService.getCurrentUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const ideaData = {
        title,
        description,
        status,
        tags,
        driveFileIds: driveFiles.map((f) => f.id),
        userId: user.$id,
      };

      const permissions = [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ];

      await appwriteService.createDocument(ideaData, permissions);

      // Reset form
      setTitle('');
      setDescription('');
      setStatus('Planning');
      setTags([]);
      setDriveFiles([]);

      alert('Idea created successfully!');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Idea</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter idea title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your idea"
          />
        </div>

        {/* Status Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Planning">Planning</option>
            <option value="In_Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Google Drive Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Drive Files
          </label>
          <button
            type="button"
            onClick={() => setShowDrivePicker(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <span>📎</span>
            Attach from Google Drive
          </button>

          {driveFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {googleDriveService.getFileIcon(file.mimeType)}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {googleDriveService.getFileTypeName(file.mimeType)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDriveFiles(driveFiles.filter((f) => f.id !== file.id))
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {isSubmitting ? 'Creating...' : 'Create Idea'}
        </button>
      </form>

      {/* Drive Picker Modal */}
      <GoogleDrivePicker
        isOpen={showDrivePicker}
        onClose={() => setShowDrivePicker(false)}
        onFilesSelected={handleDriveFilesSelected}
        multiSelect={true}
        maxFiles={5}
      />
    </div>
  );
};
```

---

# Part 7: Build & Test

## 7.1 Build the Extension

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

## 7.2 Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist` folder
5. Copy the **Extension ID** (you'll need this!)

## 7.3 Update manifest.json with Extension ID

Update `public/manifest.json`:

```json
{
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly"
    ]
  },
  "key": "YOUR_EXTENSION_KEY_HERE"
}
```

## 7.4 Update Appwrite Platform Hostname

1. Go to Appwrite Console
2. Navigate to **Settings** → **Platforms**
3. Add/Update Web platform with:
   - **Hostname**: `chrome-extension://YOUR_EXTENSION_ID`

## 7.5 Test the Integration

1. Click the extension icon in Chrome
2. Create an account or login
3. Create a new idea
4. Click **"Attach from Google Drive"**
5. Sign in with Google
6. Select files and attach
7. Submit the idea
8. Verify in Appwrite Console that document was created with `driveFileIds`

---

# Part 8: Production Deployment

## 8.1 Prepare for Production

1. **Update environment variables** in `.env.production`:
   ```env
   VITE_APPWRITE_ENDPOINT=https://your-appwrite-cloud-url/v1
   VITE_APPWRITE_PROJECT_ID=production_project_id
   ```

2. **Complete OAuth Consent Screen Verification**:
   - Submit app for verification in Google Cloud Console
   - Change app status from "Testing" to "In Production"

3. **Add production domains** to Google OAuth credentials

## 8.2 Build for Production

```bash
npm run build
```

## 8.3 Submit to Chrome Web Store

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Click **New Item**
3. Upload your extension zip file
4. Fill in store listing details
5. Submit for review

---

# Part 9: Troubleshooting

## Common Issues

### 1. **"redirect_uri_mismatch" Error**
- Verify OAuth redirect URIs in Google Cloud Console
- Ensure extension ID matches in manifest.json
- Clear browser cache and reload extension

### 2. **Token/Authentication Errors**
- Check if Google Drive API is enabled
- Verify scopes in manifest.json match OAuth consent screen
- Try revoking and re-authorizing from `chrome://identity-internals`

### 3. **Appwrite Connection Failed**
- Verify Appwrite endpoint URL
- Check if Appwrite is running (`docker ps`)
- Ensure platform hostname is correctly set

### 4. **CORS Errors**
- Add extension URL to Appwrite platform settings
- Check browser console for specific CORS messages
- Verify Appwrite is using correct CORS headers

### 5. **Files Not Loading from Drive**
- Check if user has granted proper permissions
- Verify Google Drive API quotas
- Test with smaller file sets first

---

# Part 10: Security Best Practices

1. **Never commit sensitive data**:
   - Add `.env` to `.gitignore`
   - Use environment variables for all secrets

2. **Use document-level permissions** in Appwrite:
   - Each user should only access their own documents
   - Implement proper role-based access control

3. **Validate all inputs**:
   - Sanitize user inputs before storing
   - Validate file types and sizes

4. **Handle tokens securely**:
   - Store tokens in Chrome storage (encrypted)
   - Implement token refresh logic
   - Clear tokens on logout

5. **Keep dependencies updated**:
   ```bash
   npm audit
   npm update
   ```

---

# Part 11: Additional Features

## Feature Ideas to Implement:

1. **Offline Support**:
   - Cache ideas in Chrome storage
   - Sync when online

2. **Real-time Sync**:
   - Use Appwrite Realtime API
   - Subscribe to document changes

3. **File Preview**:
   - Display Google Drive file thumbnails
   - Embed document viewers

4. **Export/Import**:
   - Export ideas to JSON/CSV
   - Import from other sources

5. **Notifications**:
   - Reminder notifications
   - Drive file updates

---

# 📚 Resources

## Documentation
- [Appwrite Docs](https://appwrite.io/docs)
- [Google Drive API](https://developers.google.com/drive/api/guides/about-sdk)
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [React + Vite](https://vitejs.dev/guide/)

## Support
- [Appwrite Discord](https://appwrite.io/discord)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/appwrite)
- [GitHub Issues](https://github.com/appwrite/appwrite/issues)

---

## ✅ Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Node.js 18+ installed
- [ ] Vite project created with React + TypeScript
- [ ] Chrome extension manifest.json configured
- [ ] Appwrite installed and running
- [ ] Appwrite project created
- [ ] Database and collection created with all attributes
- [ ] Collection permissions configured
- [ ] Google Cloud project created
- [ ] Google Drive API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created for Chrome extension
- [ ] API Key created and restricted
- [ ] Environment variables configured
- [ ] Appwrite service implemented
- [ ] Google Drive service implemented
- [ ] Google Drive Picker component created
- [ ] Extension built and loaded in Chrome
- [ ] Extension ID added to manifest and Appwrite platform
- [ ] Authentication tested
- [ ] Google Drive integration tested
- [ ] Document creation tested with driveFileIds

---

## 🎉 Congratulations!

You now have a fully functional React + Vite Chrome Extension with:
- ✅ Appwrite backend for authentication and data storage
- ✅ Google Drive integration with OAuth 2.0
- ✅ File picker with search and multi-select
- ✅ Secure document-level permissions
- ✅ Production-ready architecture

Happy coding! 🚀
