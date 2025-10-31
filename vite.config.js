import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// Custom plugin to make CSS non-blocking
function nonBlockingCssPlugin() {
  return {
    name: 'non-blocking-css',
    enforce: 'post',
    transformIndexHtml(html) {
      // Convert stylesheet links to preload with onload handler
      return html.replace(
        /<link rel="stylesheet"([^>]*href="[^"]*\.css"[^>]*)>/g,
        (match, attrs) => {
          return `<link rel="preload" as="style"${attrs} onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet"${attrs}></noscript>`;
        }
      );
    }
  };
}

// Custom plugin to strip ALL console statements (including from vendor libraries)
function stripConsolePlugin() {
  return {
    name: 'strip-console',
    enforce: 'post',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const chunk = bundle[fileName];
        if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
          // Aggressively remove all console statements using multiple passes
          let code = chunk.code;
          
          // Pass 1: Remove simple console statements
          code = code.replace(/console\.(log|debug|info|warn|error|trace|dir|dirxml|group|groupEnd|time|timeEnd|assert|profile|profileEnd|count|countReset|table|clear|exception)\s*\([^)]*\)\s*;?/g, '');
          
          // Pass 2: Remove console statements with nested parentheses
          code = code.replace(/console\.(log|debug|info|warn|error|trace|dir|dirxml|group|groupEnd|time|timeEnd|assert|profile|profileEnd|count|countReset|table|clear|exception)\s*\((?:[^()]*|\([^()]*\))*\)\s*;?/g, '');
          
          // Pass 3: Remove console statements with complex arguments (multiple passes)
          for (let i = 0; i < 5; i++) {
            const before = code.length;
            code = code.replace(/console\.(log|debug|info|warn|error|trace|dir|dirxml|group|groupEnd|time|timeEnd|assert|profile|profileEnd|count|countReset|table|clear|exception)\s*\((?:[^()]*|\((?:[^()]*|\([^()]*\))*\))*\)\s*;?/g, '');
            if (code.length === before) break; // No more replacements
          }
          
          // Pass 4: Remove any remaining console.* patterns
          code = code.replace(/console\.[a-zA-Z]+\s*\(/g, '(');
          
          chunk.code = code;
        }
      }
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nonBlockingCssPlugin(),
    stripConsolePlugin(),
    // Gzip compression
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    // Brotli compression
    viteCompression({
      verbose: false,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
      deleteOriginFile: false
    }),
    // Bundle analyzer
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './',
  build: {
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks: {
          'vue-vendor': ['vue'],
          'vuetify-vendor': ['vuetify'],
          'chart-vendor': ['chart.js', 'vue-chartjs'],
          'pdf-vendor': ['jspdf', 'jspdf-autotable', 'html2canvas']
        },
        compact: true
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'],
        passes: 3,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_arrows: true,
        keep_fargs: false,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        hoist_funs: true,
        inline: 3,
        global_defs: {
          '@console.log': 'alert',
          '@console.debug': 'alert',
          '@console.info': 'alert',
          '@console.warn': 'alert'
        }
      },
      mangle: {
        safari10: true,
        properties: false
      },
      format: {
        comments: false,
        ascii_only: true
      }
    }
  },
  server: {
    proxy: {
      '/api/prices': {
        target: 'https://sahabat.pegadaian.co.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/prices/, '/gold/prices'),
      },
    },
  },
})