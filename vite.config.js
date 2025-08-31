import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // Vite 开发端口
    proxy: {
      // 把 /auth 开头的请求代理到 Spring Boot 后端
      '/auth': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      // 把 /api 开头的请求代理到 Spring Boot 后端
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
