import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5180,
    proxy: {
      '/kto-tour-api': {
        target: 'https://apis.data.go.kr/B551011/KorService1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kto-tour-api/, ''),
      },
    },
  },
})
