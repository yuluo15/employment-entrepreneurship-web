import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { VantResolver } from '@vant/auto-import-resolver';
import { defineConfig, loadEnv } from 'vite'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    base: env.VITE_PUBLIC_PATH || '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 9090,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:9595',
          changeOrigin: true,
          rewrite: (path) => path
        }
      },
      open: true,
    },
    plugins: [
      vue(),
      // VueDevTools(),
      UnoCSS(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver(), VantResolver()],
        dts: 'auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver(), VantResolver()],
        dts: 'components.d.ts',
      }),
    ],
  }
})


