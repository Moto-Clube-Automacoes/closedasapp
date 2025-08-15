// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://37.27.202.41:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
