import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  define: {
    // Proporcionar un polyfill para 'global'
    global: 'globalThis',
  },
  
  server: {
    proxy: {
      '/api': 'http://localhost:8080', // Apunta al backend real
    },
    port: 5174
  }
})
