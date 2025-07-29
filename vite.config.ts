// // vite.config.ts
// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';
// import svgr from 'vite-plugin-svgr';
// import {api} from './src/api/api'; // Adjust the import path as necessary
// export default defineConfig({
//   plugins: [
//     react(),
//     svgr({
//       svgrOptions: {
//         icon: true,
//         exportType: 'named',
//         namedExport: 'ReactComponent',
//       },
//     }),
//   ],
//   server: {
//     proxy: {
//       '/api': {
//         target: env.VITE_API_URL,
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });


// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` (e.g., development, production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
