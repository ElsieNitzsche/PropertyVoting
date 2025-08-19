import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  base: './',

  build: {
    outDir: '../dist',
    emptyOutDir: true,

    // Code splitting configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      },
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          'vendor-ethers': ['ethers'],
          'vendor-fhevm': ['fhevmjs']
        },
        // Asset file names
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: 'js/[name].[hash].js'
      }
    },

    // Optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      format: {
        comments: false
      }
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500, // KB

    // CSS code splitting
    cssCodeSplit: true,

    // Source maps for production debugging (disable for smaller builds)
    sourcemap: false,

    // Asset inlining threshold
    assetsInlineLimit: 4096 // 4KB
  },

  // Development server
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    cors: true,

    // Security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },

  // Preview server (for production build testing)
  preview: {
    port: 8080,
    strictPort: false,
    open: true,
    cors: true
  },

  // Dependency optimization
  optimizeDeps: {
    include: ['ethers'],
    exclude: ['fhevmjs'] // Large dependencies to not pre-bundle
  },

  // Performance optimizations
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },

  // Environment variables
  envPrefix: 'VITE_',

  // Define global constants
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  }
});
