import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      // ⚡ PERFORMANCE BOOST: Faster HMR
      hmr: {
        overlay: false, // Disable error overlay for speed
      },
      // ⚡ Faster file watching
      watch: {
        usePolling: false,
      },
    },
    plugins: [
      react({
        // ⚡ SPEED: Skip React DevTools in production
        babel: {
          compact: mode === 'production',
        },
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    // ⚡ BUILD OPTIMIZATION
    build: {
      // Faster builds with rollup
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
      // Code splitting for faster loading
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ai-vendor': ['@google/genai'],
            'pdf-vendor': ['jspdf', 'html2canvas'],
          },
        },
      },
      // Faster chunk size
      chunkSizeWarningLimit: 1000,
      // Better source maps
      sourcemap: false,
    },
    // ⚡ OPTIMIZATION
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@google/genai'],
      exclude: [], // Icons load on-demand
    },
  };
});
