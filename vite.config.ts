import * as path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig(({ mode }) => {
  const { VITE_BASE_URL } = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      svgr({
        include: '**/*.svg',
      }),
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    base: '/',
    server: {
      open: true,
      host: true,
      proxy: {
        '/services/aladintechcobackend-test': {
          target: VITE_BASE_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
    optimizeDeps: {
      include: ['@svgr/webpack'],
    },
  };
});
