import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    // Make environment variables available to the browser
    'import.meta.env.VITE_PROJECT_TOKEN': JSON.stringify(process.env.VITE_PROJECT_TOKEN || ''),
    'import.meta.env.VITE_DEPLOYMENT_NAME': JSON.stringify(process.env.VITE_DEPLOYMENT_NAME || ''),
    'import.meta.env.VITE_MCP_CLIENT_URL': JSON.stringify(process.env.VITE_MCP_CLIENT_URL || ''),
  },
});
