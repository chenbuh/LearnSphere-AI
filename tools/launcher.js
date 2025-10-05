/**
 * 英语等级考试学习软件启动器
 * 自动启动本地服务器并在浏览器中打开应用
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

class AppLauncher {
    constructor() {
        this.port = 8080;
        this.defaultBrowser = null;
        this.server = null;
        this.appPath = path.join(__dirname, '..');
        
        console.log('🚀 英语等级考试学习软件启动器');
        console.log('='.repeat(50));
    }

    /**
     * 启动应用
     */
    async start() {
        try {
            // 检查环境
            await this.checkEnvironment();
            
            // 查找可用端口
            this.port = await this.findAvailablePort(this.port);
            
            // 启动服务器
            await this.startServer();
            
            // 等待服务器准备就绪
            await this.waitForServer();
            
            // 打开浏览器
            await this.openBrowser();
            
            console.log('\n✅ 应用启动成功！');
            console.log(`📱 在浏览器中访问: http://localhost:${this.port}`);
            console.log('\n💡 提示：');
            console.log('   - 关闭此窗口将停止应用');
            console.log('   - 按 Ctrl+C 可以安全退出');
            
            // 监听退出信号
            this.setupExitHandlers();
            
        } catch (error) {
            console.error('\n❌ 启动失败:', error.message);
            console.log('\n🔧 解决建议:');
            console.log('   1. 确保没有其他程序占用端口');
            console.log('   2. 检查防火墙设置');
            console.log('   3. 尝试以管理员身份运行');
            process.exit(1);
        }
    }

    /**
     * 检查运行环境
     */
    async checkEnvironment() {
        console.log('🔍 检查运行环境...');
        
        // 检查Node.js版本
        const nodeVersion = process.version;
        console.log(`   Node.js 版本: ${nodeVersion}`);
        
        // 检查项目文件
        const requiredFiles = [
            'src/html/index.html',
            'src/css/main.css',
            'src/js/app.js'
        ];
        
        for (const file of requiredFiles) {
            const filePath = path.join(this.appPath, file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`缺少必要文件: ${file}`);
            }
        }
        
        console.log('   ✅ 环境检查通过');
    }

    /**
     * 查找可用端口
     */
    async findAvailablePort(startPort) {
        return new Promise((resolve) => {
            const server = http.createServer();
            
            server.listen(startPort, () => {
                const port = server.address().port;
                server.close(() => resolve(port));
            });
            
            server.on('error', () => {
                // 端口被占用，尝试下一个
                this.findAvailablePort(startPort + 1).then(resolve);
            });
        });
    }

    /**
     * 启动HTTP服务器
     */
    async startServer() {
        console.log(`🌐 启动服务器 (端口: ${this.port})...`);
        
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        
        return new Promise((resolve, reject) => {
            this.server.listen(this.port, 'localhost', (error) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(`   ✅ 服务器已启动: http://localhost:${this.port}`);
                    resolve();
                }
            });
        });
    }

    /**
     * 处理HTTP请求
     */
    handleRequest(req, res) {
        let filePath = req.url === '/' ? '/src/html/index.html' : req.url;
        
        // 安全检查：防止目录遍历攻击
        if (filePath.includes('..')) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        
        const fullPath = path.join(this.appPath, filePath);
        
        // 检查文件是否存在
        fs.access(fullPath, fs.constants.F_OK, (err) => {
            if (err) {
                // 文件不存在，返回404
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>404 - 文件未找到</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
                            h1 { color: #dc3545; }
                        </style>
                    </head>
                    <body>
                        <h1>404 - 文件未找到</h1>
                        <p>请求的文件不存在: ${filePath}</p>
                        <a href="/">返回首页</a>
                    </body>
                    </html>
                `);
                return;
            }
            
            // 读取文件
            fs.readFile(fullPath, (err, data) => {
                if (err) {
                    res.writeHead(500);
                    res.end('服务器内部错误');
                    return;
                }
                
                // 设置Content-Type
                const ext = path.extname(fullPath).toLowerCase();
                const contentType = this.getContentType(ext);
                
                res.writeHead(200, { 
                    'Content-Type': contentType,
                    'Cache-Control': 'no-cache'
                });
                res.end(data);
            });
        });
    }

    /**
     * 获取Content-Type
     */
    getContentType(ext) {
        const types = {
            '.html': 'text/html; charset=utf-8',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };
        
        return types[ext] || 'text/plain';
    }

    /**
     * 等待服务器准备就绪
     */
    async waitForServer() {
        const maxAttempts = 10;
        const delay = 100;
        
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await this.testServerConnection();
                return;
            } catch (error) {
                if (i === maxAttempts - 1) {
                    throw new Error('服务器启动超时');
                }
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    /**
     * 测试服务器连接
     */
    testServerConnection() {
        return new Promise((resolve, reject) => {
            const req = http.get(`http://localhost:${this.port}`, (res) => {
                resolve();
            });
            
            req.on('error', reject);
            req.setTimeout(1000, () => reject(new Error('连接超时')));
        });
    }

    /**
     * 打开浏览器
     */
    async openBrowser() {
        console.log('🌍 正在打开浏览器...');
        
        const url = `http://localhost:${this.port}`;
        const platform = process.platform;
        
        try {
            let command, args;
            
            if (platform === 'win32') {
                command = 'cmd';
                args = ['/c', 'start', url];
            } else if (platform === 'darwin') {
                command = 'open';
                args = [url];
            } else {
                command = 'xdg-open';
                args = [url];
            }
            
            const child = spawn(command, args, {
                detached: true,
                stdio: 'ignore'
            });
            
            child.unref();
            console.log('   ✅ 浏览器已打开');
            
        } catch (error) {
            console.log('   ⚠️  无法自动打开浏览器，请手动访问:');
            console.log(`      ${url}`);
        }
    }

    /**
     * 设置退出处理
     */
    setupExitHandlers() {
        const exitHandler = (signal) => {
            console.log(`\n\n📡 接收到 ${signal} 信号，正在关闭服务器...`);
            
            if (this.server) {
                this.server.close(() => {
                    console.log('✅ 服务器已关闭');
                    console.log('👋 感谢使用英语等级考试学习软件！');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        };
        
        process.on('SIGINT', () => exitHandler('SIGINT'));
        process.on('SIGTERM', () => exitHandler('SIGTERM'));
        
        // Windows特有的信号
        if (process.platform === 'win32') {
            process.on('SIGBREAK', () => exitHandler('SIGBREAK'));
        }
    }

    /**
     * 显示帮助信息
     */
    static showHelp() {
        console.log('英语等级考试学习软件启动器');
        console.log('');
        console.log('用法:');
        console.log('  node launcher.js           启动应用');
        console.log('  node launcher.js --help    显示帮助');
        console.log('  node launcher.js --port    指定端口');
        console.log('');
        console.log('选项:');
        console.log('  --port <number>   指定服务器端口 (默认: 8080)');
        console.log('  --help           显示此帮助信息');
        console.log('');
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    
    // 处理命令行参数
    if (args.includes('--help') || args.includes('-h')) {
        AppLauncher.showHelp();
        return;
    }
    
    const launcher = new AppLauncher();
    
    // 处理端口参数
    const portIndex = args.indexOf('--port');
    if (portIndex !== -1 && args[portIndex + 1]) {
        const customPort = parseInt(args[portIndex + 1]);
        if (!isNaN(customPort) && customPort > 0 && customPort < 65536) {
            launcher.port = customPort;
        } else {
            console.error('❌ 无效的端口号');
            process.exit(1);
        }
    }
    
    await launcher.start();
}

// 启动应用
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ 启动失败:', error);
        process.exit(1);
    });
}

module.exports = AppLauncher;
