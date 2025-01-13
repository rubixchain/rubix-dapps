import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Get environment
const isDocker = process.env.DOCKER === 'true';

// Base URLs based on environment
const baseUrls = {
  api: isDocker ? 'http://nginx:20005' : 'http://localhost:20005',
  fileServer: isDocker ? 'http://file-server:3000' : 'http://localhost:3000',
  dappServer: isDocker ? 'http://dapp-server:8080' : 'http://localhost:8080'
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // Allow external access
    port: 5172,
    watch: {
      usePolling: true, // Enable polling for Docker volumes
      interval: 1000 // Check for changes every second
    },
    proxy: {
      "/api": {
        target: baseUrls.api,
        changeOrigin: true
      },
      "/file_server": {
        target: baseUrls.fileServer,
        changeOrigin: true
      },
      "/dapp": {
        target: baseUrls.dappServer,
        changeOrigin: true
      }
    }
  }
});
