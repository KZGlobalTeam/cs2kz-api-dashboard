import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue({
    template: {
      compilerOptions: {
        // 将所有带短横线的标签名都视为自定义元素
        isCustomElement: (tag) => tag.startsWith('ion-')
      }
    }
  })],
  server: {
    host: '127.0.0.1',
    port: 80
  }
})
