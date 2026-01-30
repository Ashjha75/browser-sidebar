import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Go up one level from scripts/ to project root
const projectRoot = path.join(__dirname, '..');

// Check if .env exists
const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ Environment file found');
} else {
  console.warn('⚠️  Warning: .env file not found');
  console.warn('   Copy and configure .env with your Appwrite credentials');
}

// No need to modify manifest.json anymore (Google Drive removed)
console.log('✅ Build environment ready');
