import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    // Бібліотека підключена через file: (symlink) — інакше вона тягне власну копію Vue.
    dedupe: ['vue'],
  },
  optimizeDeps: {
    // Локальна бібліотека змінюється через `npm run lib:sync` — без пребандлу Vite
    // не тримає її стару копію в node_modules/.vite і нова версія видна після перезавантаження.
    exclude: ['@sociallabs/frontend-components'],
  },
})
