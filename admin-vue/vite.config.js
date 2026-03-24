import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { existsSync, rmSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

const adminStaticOutDir = fileURLToPath(new URL('../backend/src/main/resources/static/admin', import.meta.url))

function cleanAdminStaticOutput() {
    if (!existsSync(adminStaticOutDir)) {
        return
    }

    rmSync(adminStaticOutDir, { recursive: true, force: true })
}

export default defineConfig({
    base: '/admin/',
    plugins: [
        vue(),
        {
            name: 'clean-backend-admin-static',
            apply: 'build',
            buildStart() {
                cleanAdminStaticOutput()
            }
        },
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

                    const port = server.config.server.port || 5174;
                    const protocol = server.config.server.https ? 'https' : 'http';
                    console.log('\n  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m     ' + protocol + '://localhost:' + port + '/admin/');
                    console.log('  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m     ' + protocol + '://127.0.0.1:' + port + '/admin/');
                    if (bestIp) {
                        console.log('  \x1b[32m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m   ' + protocol + '://' + bestIp + ':' + port + '/admin/\n');
                    }
                }
            }
        }
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        outDir: adminStaticOutDir,
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
                        inPkg('treemate') ||
                        inPkg('css-render')
                    ) {
                        return
                    }

                    if (inPkg('echarts')) {
                        return 'echarts-vendor'
                    }

                    if (inPkg('zrender')) {
                        return 'zrender-vendor'
                    }

                    if (inPkg('lucide-vue-next')) {
                        return 'icons'
                    }

                    if (inPkg('xlsx')) {
                        return 'xlsx-vendor'
                    }

                    if (inPkg('gsap')) {
                        return 'gsap-vendor'
                    }

                    if (
                        inPkg('axios')
                    ) {
                        return 'utils'
                    }

                    return 'vendor'
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            }
        },
        cssCodeSplit: true,
        minify: 'esbuild',
        target: 'es2015'
    },
    server: {
        host: '0.0.0.0',
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
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
        ]
    }
})
