// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://192.168.1.58:5000', // make sure this matches your Flask port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
