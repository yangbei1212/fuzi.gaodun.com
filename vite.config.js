import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 80,
    open: true,
    host: true,
    allowedHosts: [
      'dev-fuzi.gaodun.com',
      'fuzi.gaodun.com',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      // 代理豆包AI聊天接口
      '/api/doubao-chat': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/doubao-chat/, '/api/v3/chat/completions'),
        secure: true,
        headers: {
          'Origin': 'https://ark.cn-beijing.volces.com'
        }
      },
      // 代理豆包AI图片生成接口
      '/api/doubao-image': {
        target: 'https://ark.cn-beijing.volces.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/doubao-image/, '/api/v3/images/generations'),
        secure: true,
        headers: {
          'Origin': 'https://ark.cn-beijing.volces.com'
        }
      }
    }
  }
})
