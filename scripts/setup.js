import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n🚀 Welcome to My Sidebar Extension Setup!\n');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists.');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Existing .env file preserved.');
      rl.close();
      return;
    }
  }
  
  console.log('\n📋 To get your Google OAuth Client ID:');
  console.log('1. Visit: https://console.cloud.google.com/apis/credentials');
  console.log('2. Create OAuth client ID (Chrome Extension type)');
  console.log('3. Copy the Client ID (format: xxxxx-xxxxx.apps.googleusercontent.com)\n');
  
  const clientId = await question('Enter your Google OAuth Client ID: ');
  
  if (!clientId || clientId.trim() === '') {
    console.log('❌ Client ID is required. Setup cancelled.');
    rl.close();
    return;
  }
  
  // Validate format
  if (!clientId.includes('.apps.googleusercontent.com')) {
    console.log('⚠️  Warning: Client ID format looks incorrect.');
    console.log('   Expected format: xxxxx-xxxxx.apps.googleusercontent.com');
    const proceed = await question('Continue anyway? (y/N): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  // Read .env.example as template
  let envContent = fs.readFileSync(envExamplePath, 'utf-8');
  
  // Replace placeholder with actual value
  envContent = envContent.replace(
    'VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com',
    `VITE_GOOGLE_CLIENT_ID=${clientId.trim()}`
  );
  
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ .env file created successfully!');
  console.log('✅ Your Client ID is now configured.\n');
  console.log('Next steps:');
  console.log('1. Run: npm run build');
  console.log('2. Load extension in Chrome (chrome://extensions/)');
  console.log('3. Note your extension ID');
  console.log('4. Update your OAuth credentials with the extension ID\n');
  console.log('See DRIVE_SETUP.md for detailed instructions.\n');
  
  rl.close();
}

setup().catch(error => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});
