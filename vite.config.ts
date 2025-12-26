import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Copy manifest and background script to dist
        mkdirSync('dist', { recursive: true });
        copyFileSync('public/manifest.json', 'dist/manifest.json');
        copyFileSync('public/background.js', 'dist/background.js');
        copyFileSync('public/logo.png', 'dist/logo.png');
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
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
  base: './',
  server: {
    port: 3000,
    strictPort: false,
  }
});
