import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    mimeTypes: {
      'js': 'application/javascript',
    }
  },
  // Add these new configurations
  build: {
    rollupOptions: {
      output: {
        // Ensure service worker is copied to the dist folder
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'firebase-messaging-sw.js') {
            return 'firebase-messaging-sw.js'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  // Ensure public directory is correctly set
  publicDir: 'public'
})