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
        maximumFileSizeToCacheInBytes: 5242880, // 5MB
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 12 // 12 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:mp3|wav|ogg|webm)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          },
          {
            urlPattern: /\.(?:woff2?|eot|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
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
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            if (id.includes('naive-ui')) {
              return 'ui-vendor'
            }
            if (id.includes('echarts')) {
              return 'charts'
            }
            if (id.includes('lucide')) {
              return 'icons'
            }
            if (id.includes('wangeditor')) {
              return 'editor'
            }
            if (id.includes('lodash') || id.includes('axios') || id.includes('dayjs')) {
              return 'utils'
            }
            return 'vendor'
          }
          if (id.includes('src/components')) {
            if (id.includes('FlashCard') || id.includes('AudioPlayer') ||
              id.includes('Achievement') || id.includes('DailyChallenge')) {
              return 'learning-components'
            }
            if (id.includes('AITutor') || id.includes('Streaming') ||
              id.includes('Conversation') || id.includes('QuickReplies')) {
              return 'ai-components'
            }
            return 'components'
          }
          if (id.includes('src/views')) {
            if (id.includes('Vocabulary') || id.includes('Grammar') ||
              id.includes('Listening') || id.includes('Reading') ||
              id.includes('Writing') || id.includes('Speaking')) {
              return 'learning-pages'
            }
            return 'pages'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    cssCodeSplit: true,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'esbuild',
    target: 'es2015',
    cssMinify: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: false,
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'naive-ui',
        'echarts',
        'lucide-vue-next',
        'axios'
      ],
      exclude: ['@wangeditor/editor-for-vue']
    },
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
      'lucide-vue-next',
      'axios'
    ],
    exclude: ['@wangeditor/editor-for-vue']
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    },
    devSourcemap: true
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})
