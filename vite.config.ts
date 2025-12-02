import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
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
        }),
        visualizer({
          filename: 'stats.html',
          template: 'treemap',
          gzipSize: true,
          brotliSize: true,
        })
      ],
      define: {
        // 'process.env': {} // Removed to avoid conflicts, using import.meta.env in code
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
        exclude: ['lucide-react'], // Icons load on-demand
      },
    };
});
