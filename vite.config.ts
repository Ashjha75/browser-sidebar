import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig(({ mode }) => ({
  base: mode === 'github' ? '/browser-sidebar/' : './',
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        // Only copy extension files if manifest exists (development build)
        if (existsSync('public/manifest.json')) {
          mkdirSync('dist', { recursive: true });
          try {
            copyFileSync('public/manifest.json', 'dist/manifest.json');
            copyFileSync('public/background.js', 'dist/background.js');
            copyFileSync('public/logo.png', 'dist/logo.png');
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