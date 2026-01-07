import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env');
let clientId = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/VITE_GOOGLE_CLIENT_ID=(.+)/);
  if (match && match[1] && match[1].trim() !== 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com') {
    clientId = match[1].trim();
    console.log('✅ Using Google Client ID from .env file');
  } else {
    console.warn('⚠️  Warning: VITE_GOOGLE_CLIENT_ID not set in .env file');
    console.warn('   Using placeholder. Update .env with your actual Client ID.');
  }
} else {
  console.warn('⚠️  Warning: .env file not found');
  console.warn('   Copy .env.example to .env and add your Google Client ID');
}

// Read the manifest template
const manifestPath = path.join(__dirname, 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Update the client_id
if (manifest.oauth2 && manifest.oauth2.client_id) {
  manifest.oauth2.client_id = clientId;
}

// Write back to manifest.json
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('✅ manifest.json updated with environment variables');
