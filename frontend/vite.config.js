import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Your existing proxy setup (if you have one)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Add this build configuration to fix the error
  build: {
    target: 'esnext' // This tells Vite to use a modern JS environment that supports import.meta.env
  }
})