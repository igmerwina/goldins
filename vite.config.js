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

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    nonBlockingCssPlugin(),
    // Gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false
    }),
    // Brotli compression
    viteCompression({
      verbose: true,
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
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        keep_fargs: false,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        hoist_funs: true,
        inline: 2
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