import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: './',
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]'
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