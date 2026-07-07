import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split rarely-changing vendor code into cacheable chunks so the
        // browser can parallel-download them and reuse them across deploys.
        // recharts stays with the (lazy) admin route it's imported from.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('framer-motion')) return 'motion-vendor';
          if (id.includes('recharts') || id.includes('/d3-') || id.includes('victory'))
            return 'charts-vendor';
          if (id.includes('socket.io') || id.includes('engine.io')) return 'socket-vendor';
          if (id.includes('react-icons')) return 'icons-vendor';
          // React core + router + their runtime deps must share one chunk,
          // otherwise they cross-import and Rollup emits a circular chunk.
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/') ||
            id.includes('/react-is/') ||
            id.includes('react-router') ||
            id.includes('@remix-run')
          )
            return 'react-vendor';
          if (
            id.includes('@tanstack') ||
            id.includes('redux') ||
            id.includes('axios') ||
            id.includes('immer') ||
            id.includes('reselect')
          )
            return 'data-vendor';
          // Long tail (clsx, zod, react-hook-form, etc.): let Rollup decide —
          // avoids the cycles a manual catch-all chunk introduces.
          return undefined;
        },
      },
    },
  },
});
