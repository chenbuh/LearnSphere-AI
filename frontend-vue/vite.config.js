import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const frontendStaticOutDir = fileURLToPath(new URL('../backend/src/main/resources/static/dist', import.meta.url))
const frontendStaticRootDir = fileURLToPath(new URL('../backend/src/main/resources/static', import.meta.url))
const legacyFrontendStaticTargets = [
  'assets',
  'index.html',
  'favicon.svg',
  'manifest.json',
  'manifest.webmanifest',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'registerSW.js',
  'robots.txt',
  'sw.js',
  'vite.svg'
]

function cleanFrontendStaticOutput() {
  if (!existsSync(frontendStaticOutDir)) {
    return
  }

  rmSync(frontendStaticOutDir, { recursive: true, force: true })
}

function cleanLegacyFrontendStaticOutput() {
  for (const target of legacyFrontendStaticTargets) {
    const targetPath = fileURLToPath(new URL(`../backend/src/main/resources/static/${target}`, import.meta.url))
    if (!existsSync(targetPath)) {
      continue
    }

    rmSync(targetPath, { recursive: true, force: true })
  }
}

function cleanLegacyWorkboxFiles() {
  if (!existsSync(frontendStaticRootDir)) {
    return
  }

  const workboxGlobDir = frontendStaticRootDir
  const pattern = /^workbox-.*\.js$/
  for (const entry of readdirSync(workboxGlobDir, { withFileTypes: true })) {
    if (!entry.isFile() || !pattern.test(entry.name)) {
      continue
    }

    rmSync(fileURLToPath(new URL(`../backend/src/main/resources/static/${entry.name}`, import.meta.url)), {
      force: true
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    (() => {
      let resolvedOutDir = frontendStaticOutDir
      return {
        name: 'clean-backend-frontend-static',
        apply: 'build',
        configResolved(config) {
          resolvedOutDir = resolve(config.root, config.build.outDir)
        },
        buildStart() {
          // 只在输出到后端 static/dist 时清理；--outDir 指向临时目录时不动后端文件
          if (resolvedOutDir !== resolve(frontendStaticOutDir)) {
            return
          }
          cleanLegacyFrontendStaticOutput()
          cleanLegacyWorkboxFiles()
          cleanFrontendStaticOutput()
        }
      }
    })(),
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
            src: '/dist/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/dist/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 8388608, // 8MB
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],
        globIgnores: ['admin/**/*', 'models/**/*'],
        runtimeCaching: [
          {
            // 只缓存前台学习端的接口，明确排除 /api/admin。
            //
            // 原因：SW 注册在根 scope（/registerSW.js），会接管包括 /admin 在内的
            // 全部同源请求。后台接口带 satoken、返回实时数据，被 NetworkFirst
            // 缓存 12 小时后会出现「后台显示旧数据」；而且 SW 层的重试会在后端
            // 变慢时放大请求量，把管理员 IP 顶进反爬黑名单。
            urlPattern: ({ url, request }) => (
              url.pathname.startsWith('/api') &&
              !url.pathname.startsWith('/api/admin') &&
              !request.headers.has('range')
            ),
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
            urlPattern: ({ url, request }) => (
              /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i.test(url.pathname) &&
              !request.headers.has('range')
            ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: ({ url, request }) => (
              /\.(?:mp3|wav|ogg|webm)$/i.test(url.pathname) &&
              !request.headers.has('range')
            ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: ({ url, request }) => (
              /\.(?:woff2?|eot|ttf|otf)$/i.test(url.pathname) &&
              !request.headers.has('range')
            ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [200]
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
          const os = await import('node:os')
          const interfaces = os.networkInterfaces()
          let bestIp = ''

          outer: for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
              if (iface.family === 'IPv4' && !iface.internal) {
                if (iface.address.startsWith('192.168.') && !iface.address.endsWith('.1')) {
                  bestIp = iface.address
                  break outer
                }
              }
            }
          }

          const port = server.config.server.port || 5173
          const protocol = server.config.server.https ? 'https' : 'http'
          console.log('\n  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   ' + protocol + '://localhost:' + port + '/')
          console.log('  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   ' + protocol + '://127.0.0.1:' + port + '/')
          if (bestIp) {
            console.log('  \x1b[32m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m ' + protocol + '://' + bestIp + ':' + port + '/\n')
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
    // Frontend bundle is emitted into Spring Boot static resources/dist.
    outDir: frontendStaticOutDir,
    emptyOutDir: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) {
            return
          }

          const normalized = id.replace(/\\/g, '/')
          const inPkg = (pkg) => normalized.includes(`/node_modules/${pkg}/`)

          // 体积大、且只在特定功能里动态 import 的库，不要并入 vendor。
          // manualChunks 一旦把它们归到 vendor，动态 import 就失效了：
          // vendor 里有首屏要用的包，整块会被 modulepreload 提前加载，
          // 这些库也就跟着进了首屏。返回 undefined 交给 Rollup 自动拆成按需 chunk。
          if (inPkg('vosk-browser') || inPkg('html2canvas')) {
            return
          }

          if (
            inPkg('vue') ||
            inPkg('@vue') ||
            inPkg('pinia') ||
            inPkg('vue-router')
          ) {
            return 'vue-core'
          }

          if (
            inPkg('naive-ui') ||
            inPkg('vueuc') ||
            inPkg('@css-render') ||
            inPkg('vooks') ||
            inPkg('vdirs') ||
            inPkg('seemly') ||
            inPkg('evtd') ||
            inPkg('treemate')
          ) {
            // Keep Naive UI ecosystem auto-split to avoid cross-chunk cycles.
            return
          }

          if (inPkg('echarts')) {
            return 'echarts-vendor'
          }

          if (inPkg('zrender')) {
            return 'zrender-vendor'
          }

          if (inPkg('@wangeditor') || inPkg('wangeditor')) {
            return 'editor'
          }

          if (inPkg('lucide-vue-next')) {
            return 'icons'
          }

          if (
            inPkg('axios') ||
            inPkg('idb') ||
            inPkg('canvas-confetti') ||
            inPkg('qrcode.vue') ||
            inPkg('vue-i18n')
          ) {
            return 'utils'
          }

          return 'vendor'
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
        // dev 后端端口为 8081（application-dev.yml），8080 被本机其他项目占用
        target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8081',
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
