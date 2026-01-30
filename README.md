# 💡 Idea Tracker - Chrome Extension with Appwrite

A powerful Chrome Extension for tracking and managing your creative ideas with authentication and cloud storage powered by Appwrite.

## ✨ Features

- 🔐 **User Authentication** - Secure signup and login with Appwrite
- 💡 **Idea Management** - Create, edit, delete, and organize your ideas
- 📊 **Dashboard** - View stats and filter ideas by status
- 🔍 **Search** - Find ideas by title, description, or tags
- 🏷️ **Tags** - Organize ideas with custom tags
- 📈 **Status Tracking** - Planning, In Progress, Completed
- 🔧 **Scripts** - Built-in collection of useful bookmarklets
- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Chrome browser
- Appwrite instance (Cloud or Self-hosted)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo>
   cd extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Appwrite** (See [APPWRITE_SETUP.md](APPWRITE_SETUP.md) for detailed instructions)
   - Create Appwrite project
   - Create database: `ideas-db`
   - Create collection: `ideas` with required attributes
   - Enable Email/Password authentication

4. **Configure environment**
   ```bash
   # Copy and edit .env file
   cp .env.example .env
   ```
   
   Update `.env` with your Appwrite credentials:
   ```env
   VITE_APPWRITE_ENDPOINT=http://localhost/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=ideas-db
   VITE_APPWRITE_COLLECTION_ID=ideas
   ```

5. **Build the extension**
   ```bash
   npm run build
   ```

6. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

7. **Update Appwrite Platform**
   - Copy your Extension ID from Chrome
   - Add it to Appwrite Console → Settings → Platforms
   - Hostname: `chrome-extension://YOUR_EXTENSION_ID`

## 📖 Documentation

- [Complete Appwrite Setup Guide](APPWRITE_SETUP.md) - Detailed step-by-step setup
- [Quick Setup Summary](QUICK_SETUP.md) - Quick reference guide

## 🏗️ Project Structure

```
extension/
├── src/
│   ├── components/          # React components
│   │   ├── Auth.tsx        # Authentication UI
│   │   ├── IdeasList.tsx   # Ideas dashboard
│   │   ├── IdeaForm.tsx    # Create/Edit form
│   │   └── ScriptsPage.tsx # Scripts collection
│   ├── services/           # API services
│   │   └── appwrite.service.ts
│   ├── types/              # TypeScript types
│   ├── config/             # Configuration
│   ├── scripts/            # Bookmarklets library
│   └── App.tsx            # Main component
├── public/
│   ├── manifest.json      # Extension manifest
│   └── background.js      # Service worker
├── .env                   # Environment variables
└── package.json          # Dependencies
```

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## 📦 Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Appwrite** - Backend (Auth + Database)
- **Lucide React** - Icons
- **Chrome Extension Manifest V3** - Extension platform

## 🎯 Appwrite Collection Schema

### Collection: `ideas`

| Field       | Type          | Required | Description                    |
|-------------|---------------|----------|--------------------------------|
| title       | String (255)  | Yes      | Idea title                     |
| description | String (5000) | Yes      | Detailed description           |
| status      | Enum          | Yes      | Planning/In_Progress/Completed |
| tags        | String Array  | No       | Custom tags                    |
| userId      | String (255)  | Yes      | Owner user ID                  |

## 🔐 Security

- Email/password authentication with Appwrite
- Document-level permissions per user
- Secure session management
- HTTPS/TLS for cloud deployments

## 🐛 Troubleshooting

### Extension not loading
- Check that `npm run build` completed successfully
- Verify all files are in the `dist` folder
- Check Chrome console for errors

### Authentication errors
- Verify Appwrite endpoint and project ID in `.env`
- Ensure extension ID is added to Appwrite platforms
- Check Appwrite console for auth settings

### Database errors
- Confirm database and collection IDs match
- Verify collection attributes are created correctly
- Check collection permissions

See [APPWRITE_SETUP.md](APPWRITE_SETUP.md) for detailed troubleshooting.

## 📝 Usage

1. **Sign Up / Sign In**
   - Open the extension
   - Create account or sign in
   
2. **Create Ideas**
   - Click "New Idea"
   - Fill in title, description, status, and tags
   - Click "Create Idea"

3. **Manage Ideas**
   - View all ideas in the dashboard
   - Filter by status or search
   - Edit or delete ideas

4. **Use Scripts**
   - Switch to Scripts tab
   - Copy or run bookmarklets
   - Execute scripts on current page

## 🚧 Removed Features

This version has completely removed all Google Drive integration:
- ❌ No Google OAuth
- ❌ No Drive file picker
- ❌ No Drive permissions
- ✅ Clean Appwrite-only implementation

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Appwrite](https://appwrite.io) - Backend as a Service
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Lucide](https://lucide.dev) - Icon library

---

**Made with ❤️ and Appwrite**
