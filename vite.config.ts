import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/browser-sidebar/' : '/',
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Only copy extension files in development mode
        if (mode !== 'production') {
          mkdirSync('dist', { recursive: true });
          copyFileSync('public/manifest.json', 'dist/manifest.json');
          copyFileSync('public/background.js', 'dist/background.js');
          copyFileSync('public/logo.png', 'dist/logo.png');
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
}));