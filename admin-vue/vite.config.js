import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    base: '/admin/',
    plugins: [
        vue(),
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
    server: {
        host: '0.0.0.0',
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
                changeOrigin: true
            }
        }
    }
})
