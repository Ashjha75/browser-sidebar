# 🚀 Appwrite Setup Guide for Idea Tracker Extension

This guide will help you set up Appwrite backend for your Chrome Extension.

---

## 📋 Prerequisites

- Chrome browser with Developer mode enabled
- Node.js 18+ installed
- Docker installed (for self-hosted Appwrite) OR Appwrite Cloud account

---

## Step 1: Install Appwrite

### Option A: Appwrite Cloud (Recommended for beginners)

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up for a free account
3. Create a new project
4. Copy your **Project ID** and **API Endpoint**

### Option B: Self-Hosted (Docker)

```bash
# Install Appwrite using Docker
docker run -it --rm \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --volume "$(pwd)"/appwrite:/usr/src/code/appwrite:rw \
    --entrypoint="install" \
    appwrite/appwrite:1.6.0

# After installation:
# - Web Console: http://localhost
# - API Endpoint: http://localhost/v1
```

---

## Step 2: Configure Appwrite Project

### 2.1 Create Project

1. Open Appwrite Console
2. Click **Create Project**
3. Name: `Idea Tracker Extension`
4. **Copy the Project ID** - you'll need this!

### 2.2 Add Platform

1. Go to **Settings** → **Platforms**
2. Click **Add Platform** → **Web**
3. Enter details:
   - **Name**: Chrome Extension
   - **Hostname**: `chrome-extension://YOUR_EXTENSION_ID`
   
   > **Note**: Get your extension ID from `chrome://extensions` after loading it

4. Also add for development:
   - **Hostname**: `localhost`

---

## Step 3: Setup Authentication

1. Go to **Auth** section in sidebar
2. Click **Settings** tab
3. Enable **Email/Password** authentication
4. Configure:
   - **Session Length**: 365 days
   - **Password History**: 5
   - **Password Dictionary**: Enable

---

## Step 4: Create Database

1. Go to **Databases** in sidebar
2. Click **Create Database**
3. Enter details:
   - **Database ID**: `ideas-db`
   - **Name**: `Ideas Database`
4. Click **Create**

---

## Step 5: Create Collection

1. Inside `ideas-db`, click **Create Collection**
2. Enter details:
   - **Collection ID**: `ideas`
   - **Name**: `Ideas`
3. Click **Create**

---

## Step 6: Add Collection Attributes

Click **Add Attribute** for each field:

| Attribute Key | Type   | Size  | Required | Array | Default     |
|--------------|--------|-------|----------|-------|-------------|
| title        | String | 255   | Yes      | No    | -           |
| description  | String | 5000  | Yes      | No    | -           |
| status       | Enum   | -     | Yes      | No    | Planning    |
| tags         | String | 100   | No       | Yes   | []          |
| userId       | String | 255   | Yes      | No    | -           |

### For Status Enum:
- Click **Add Attribute** → **Enum**
- Add these values:
  - `Planning`
  - `In_Progress`
  - `Completed`
- Set default: `Planning`
- Click **Create**

---

## Step 7: Configure Collection Permissions

1. Go to **Settings** tab in the collection
2. Under **Permissions**, add:
   
   **Create Documents:**
   - Role: `Any`
   - Or select `Users` (any authenticated user)
   
   **Read Documents:**
   - Role: `Users`
   
   **Update Documents:**
   - Role: `Users`
   
   **Delete Documents:**
   - Role: `Users`

### Alternative: Document-Level Security (Recommended)

1. Enable **Document Security**
2. Set permissions programmatically per document (already handled in code)

---

## Step 8: Update Environment Variables

Update your `.env` file in the project root:

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=http://localhost/v1
# OR for Appwrite Cloud:
# VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=ideas-db
VITE_APPWRITE_COLLECTION_ID=ideas

# Extension Configuration
VITE_EXTENSION_NAME=Idea Tracker
VITE_EXTENSION_VERSION=1.0.0
```

**Replace `your_project_id_here` with your actual Project ID from Appwrite Console!**

---

## Step 9: Install Dependencies & Build

```bash
# Install dependencies (includes Appwrite SDK)
npm install

# Build the extension
npm run build
```

---

## Step 10: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist` folder from your project
5. **Copy the Extension ID** (e.g., `abcdefghijklmnopqrstuvwxyzabcdef`)

---

## Step 11: Update Appwrite Platform with Extension ID

1. Go back to Appwrite Console
2. Navigate to **Settings** → **Platforms**
3. Edit the Web platform or add a new one:
   - **Hostname**: `chrome-extension://YOUR_EXTENSION_ID`
   - Replace `YOUR_EXTENSION_ID` with the ID you copied from Chrome

---

## Step 12: Test the Extension

1. Click the extension icon in Chrome
2. You should see the login/signup screen
3. Create a new account with:
   - Name: Your name
   - Email: your@email.com
   - Password: at least 8 characters
4. After login, create your first idea!

---

## 🎯 Features Available

✅ **User Authentication** (Sign up / Sign in / Logout)
✅ **Create Ideas** with title, description, status, and tags
✅ **View All Ideas** with stats dashboard
✅ **Edit Ideas** - click edit icon on any idea
✅ **Delete Ideas** - click delete icon (with confirmation)
✅ **Filter by Status** - Planning, In Progress, Completed
✅ **Search Ideas** - by title, description, or tags
✅ **Scripts Page** - Access your existing scripts collection

---

## 🔧 Troubleshooting

### Error: "Invalid API endpoint"
- Check that `VITE_APPWRITE_ENDPOINT` is correct in `.env`
- For local: `http://localhost/v1`
- For cloud: `https://cloud.appwrite.io/v1`

### Error: "Project not found"
- Verify `VITE_APPWRITE_PROJECT_ID` matches your Appwrite project
- Make sure you copied the correct Project ID from Appwrite Console

### Error: "Unauthorized" or "Permission denied"
- Check that your extension ID is added as a platform in Appwrite
- Verify collection permissions are set correctly

### Error: "Database not found"
- Make sure you created the database with ID `ideas-db`
- Check that collection ID is `ideas`

### Extension not showing up
- Make sure you ran `npm run build` before loading
- Check for errors in Chrome DevTools console
- Reload the extension from `chrome://extensions`

---

## 📚 Project Structure

```
extension/
├── src/
│   ├── components/
│   │   ├── Auth.tsx           # Login/Signup UI
│   │   ├── IdeasList.tsx      # Ideas dashboard
│   │   ├── IdeaForm.tsx       # Create/Edit idea form
│   │   └── ScriptsPage.tsx    # Scripts collection
│   ├── services/
│   │   └── appwrite.service.ts # Appwrite API wrapper
│   ├── types/
│   │   ├── index.ts           # TypeScript types
│   │   └── env.d.ts           # Environment types
│   ├── config/
│   │   └── index.ts           # Configuration
│   ├── scripts/
│   │   └── library.ts         # Scripts library
│   ├── App.tsx                # Main app component
│   └── main.tsx              # Entry point
├── public/
│   └── manifest.json         # Chrome extension manifest
├── .env                      # Environment variables
└── package.json             # Dependencies
```

---

## 🎨 Customization

### Change Status Options

Edit [src/services/appwrite.service.ts](src/services/appwrite.service.ts) and [src/types/index.ts](src/types/index.ts):

```typescript
export type IdeaStatus = 'Planning' | 'In_Progress' | 'Completed' | 'YourCustomStatus';
```

### Add More Fields

1. Add attribute in Appwrite Console
2. Update types in [src/types/index.ts](src/types/index.ts)
3. Update form in [src/components/IdeaForm.tsx](src/components/IdeaForm.tsx)
4. Update service methods in [src/services/appwrite.service.ts](src/services/appwrite.service.ts)

---

## 🚀 Next Steps

- Set up Appwrite Realtime for live updates
- Add file attachments using Appwrite Storage
- Implement collaborative features
- Add export/import functionality
- Create browser notifications

---

## 📖 Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Web SDK](https://appwrite.io/docs/sdks#web)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)

---

## ✅ Checklist

- [ ] Appwrite installed (Cloud or Docker)
- [ ] Project created in Appwrite
- [ ] Database `ideas-db` created
- [ ] Collection `ideas` created with all attributes
- [ ] Collection permissions configured
- [ ] Email/Password authentication enabled
- [ ] `.env` file updated with correct values
- [ ] Dependencies installed (`npm install`)
- [ ] Extension built (`npm run build`)
- [ ] Extension loaded in Chrome
- [ ] Extension ID added to Appwrite platforms
- [ ] Successfully created test account
- [ ] Successfully created first idea

---

**Happy coding! 🎉**
