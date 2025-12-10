import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Generate unique build hash for cache invalidation
const generateBuildHash = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${timestamp}-${random}`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const buildHash = mode === 'production' ? generateBuildHash() : 'dev';

  console.log(`📦 Build hash: ${buildHash}`);

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
      // Build hash for cache invalidation
      '__BUILD_HASH__': JSON.stringify(buildHash),
      // Environment variables
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
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
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['lucide-react'], // Icons load on-demand
    },
  };
});
