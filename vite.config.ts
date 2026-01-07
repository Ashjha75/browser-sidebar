import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

export default defineConfig({
    // base: '/browser-sidebar/', // Uncomment and set this for production deployment if needed
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Only copy extension files if manifest exists (development build)
        if (existsSync('public/manifest.json')) {
          mkdirSync('dist', { recursive: true });
          try {
            // Copy background.js and logo
            copyFileSync('public/background.js', 'dist/background.js');
            copyFileSync('public/logo.png', 'dist/logo.png');
            
            // For manifest, use the temp file with injected values if it exists
            const tempManifest = 'public/manifest.temp.json';
            const sourceManifest = existsSync(tempManifest) ? tempManifest : 'public/manifest.json';
            copyFileSync(sourceManifest, 'dist/manifest.json');
            
            // Clean up temp file
            if (existsSync(tempManifest)) {
              const fs = require('fs');
              fs.unlinkSync(tempManifest);
            }
          } catch (e) {
            // Ignore errors during GitHub Actions build
          }
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Disable code splitting for extension compatibility
    cssCodeSplit: false,
    // Generate sourcemaps for debugging
    sourcemap: false,
    // Ensure minification is safe for CSP
    minify: 'esbuild'
  },
  // CSP-friendly configuration
  server: {
    port: 3000,
    strictPort: false,
  }
});