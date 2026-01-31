import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'LearnSphere AI',
        short_name: 'LearnSphere',
        description: 'AI-Powered English Learning Platform',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
      },
      devOptions: {
        enabled: true
      }
    }),
    {
      name: 'custom-console-output',
      configureServer(server) {
        server.printUrls = async () => {
          const os = await import('node:os');
          const interfaces = os.networkInterfaces();
          let bestIp = '';

          outer: for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
              if (iface.family === 'IPv4' && !iface.internal) {
                // Return the first 192.168.x.x that isn't ending in .1 (gateway/virtual)
                if (iface.address.startsWith('192.168.') && !iface.address.endsWith('.1')) {
                  bestIp = iface.address;
                  break outer;
                }
              }
            }
          }

          const port = server.config.server.port || 5173;
          console.log('\n  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   http://localhost:' + port + '/');
          if (bestIp) {
            console.log('  \x1b[32m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m http://' + bestIp + ':' + port + '/\n');
          }
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue-real': 'vue/dist/vue.runtime.esm-bundler.js',
      'vue': fileURLToPath(new URL('./src/vue-shim.js', import.meta.url))
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'naive-ui': ['naive-ui'],
          'echarts': ['echarts'],
          'lucide': ['lucide-vue-next'],
          'wangeditor': ['@wangeditor/editor', '@wangeditor/editor-for-vue']
        }
      }
    },
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'naive-ui',
      'echarts',
      'lucide-vue-next'
    ],
    exclude: ['@wangeditor/editor-for-vue']
  }
})
