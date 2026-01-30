# 🔧 Fix: Invalid Origin Error (403)

## Your Extension ID
```
omjiihikcjnopbaibkajobljomhfdibh
```

## Quick Fix Steps

### 1. Open Appwrite Console
Open your browser and go to: **http://localhost**

### 2. Navigate to Your Project
- Click on your project: **"Chrome Extension"**

### 3. Add Platform
1. Go to **Settings** (left sidebar)
2. Click **Platforms** tab
3. Click **Add Platform** button
4. Select **Web**

### 4. Enter Platform Details
Fill in the form:
- **Name**: `Chrome Extension`
- **Hostname**: `chrome-extension://omjiihikcjnopbaibkajobljomhfdibh`

⚠️ **Important**: Make sure to include `chrome-extension://` before the extension ID!

### 5. Save
Click **Next** or **Add** button

### 6. Also Add Localhost (for development)
Add another platform:
- **Name**: `Localhost Dev`
- **Hostname**: `localhost`

### 7. Refresh Your Extension
1. Go to `chrome://extensions/`
2. Click the **Reload** button on your extension
3. Open the extension again
4. Try logging in

---

## Your Credentials (for reference)
```
Email: ajha5645@hotmail.com
Password: Staging123$
```

---

## What Happened?

Appwrite checks the **Origin** header of all requests for security. Your Chrome extension has the ID `omjiihikcjnopbaibkajobljomhfdibh`, so Appwrite needs to whitelist this origin.

Once you add the platform, your extension will be able to make requests to Appwrite successfully!

---

## Still Having Issues?

### Verify Project ID
Make sure your `.env` has the correct project ID. Currently you have:
```
VITE_APPWRITE_PROJECT_ID = "chrome-extension"
```

The project ID should match what's in your Appwrite Console (without quotes and spaces).

### Check if Appwrite is Running
```bash
docker ps
```

You should see Appwrite containers running.

### Clear Extension Cache
1. Go to `chrome://extensions/`
2. Click **Remove** on your extension
3. Rebuild: `npm run build`
4. Load unpacked again from `dist` folder
