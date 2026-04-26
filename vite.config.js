import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5180,
    proxy: {
      // 공공데이터 여행 API 프록시
      '/B551011': {
        target: 'https://apis.data.go.kr',
        changeOrigin: true,
        secure: false,
      },
      // 우리 프로젝트 백엔드 서버 프록시 (로그인 등)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      // 서버의 정적 파일(업로드된 이미지) 프록시
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
