#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出函数
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function banner() {
    console.log('\n' + '='.repeat(60));
    colorLog('cyan', '    🚀 英语学习AI系统 - 全栈开发环境');
    console.log('='.repeat(60));
    console.log('');
}

// 检查端口是否被占用
function checkPort(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        
        server.on('error', () => resolve(false));
    });
}

// 等待服务启动
function waitForServer(url, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            const http = require('http');
            const request = http.get(url, (res) => {
                if (res.statusCode === 200) {
                    resolve(true);
                } else {
                    setTimeout(check, 1000);
                }
            });
            
            request.on('error', () => {
                if (Date.now() - startTime > timeout) {
                    reject(new Error('服务启动超时'));
                } else {
                    setTimeout(check, 1000);
                }
            });
        }
        
        check();
    });
}

// 启动进程
function startProcess(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'pipe',
            shell: true,
            cwd: path.join(__dirname, '..'),
            ...options
        });

        // 处理输出
        if (child.stdout) {
            child.stdout.on('data', (data) => {
                const output = data.toString().trim();
                if (output) {
                    colorLog(options.color || 'white', `[${options.name || 'PROC'}] ${output}`);
                }
            });
        }

        if (child.stderr) {
            child.stderr.on('data', (data) => {
                const output = data.toString().trim();
                if (output && !output.includes('DeprecationWarning')) {
                    colorLog('red', `[${options.name || 'PROC'}] ${output}`);
                }
            });
        }

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`进程退出，代码: ${code}`));
            }
        });

        child.on('error', reject);
        
        return child;
    });
}

async function main() {
    banner();

    try {
        // 检查Node.js版本
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        
        if (majorVersion < 16) {
            colorLog('red', '❌ 需要Node.js 16.0.0或更高版本');
            colorLog('yellow', `   当前版本: ${nodeVersion}`);
            process.exit(1);
        }
        
        colorLog('green', `✅ Node.js版本检查通过: ${nodeVersion}`);

        // 检查端口
        const isPortFree = await checkPort(8080);
        if (!isPortFree) {
            colorLog('yellow', '⚠️  端口8080已被占用，将尝试终止占用进程...');
            
            // Windows下终止占用端口的进程
            if (process.platform === 'win32') {
                try {
                    await startProcess('netstat', ['-ano', '|', 'findstr', ':8080'], { 
                        name: 'PORT-CHECK',
                        color: 'yellow'
                    });
                } catch (e) {
                    // 忽略错误，继续启动
                }
            }
        }

        // 检查依赖
        const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
        if (!fs.existsSync(nodeModulesPath)) {
            colorLog('blue', '📦 正在安装依赖包...');
            await startProcess('npm', ['install'], {
                name: 'NPM-INSTALL',
                color: 'blue'
            });
            colorLog('green', '✅ 依赖安装完成');
        } else {
            colorLog('green', '✅ 依赖检查通过');
        }

        console.log('');
        colorLog('cyan', '🔧 启动全栈开发环境...');
        console.log('');
        
        // 显示启动信息
        colorLog('blue', '📋 启动的服务:');
        console.log('   🔵 后端服务器 (Node.js + Express)');
        console.log('   🟣 前端构建工具 (Webpack + PostCSS)');
        console.log('   🟢 文件监听和热重载');
        console.log('');
        
        colorLog('green', '📍 访问地址:');
        console.log('   - 主应用: http://localhost:8080/');
        console.log('   - AI演示: http://localhost:8080/demo');
        console.log('   - API状态: http://localhost:8080/api/health');
        console.log('');

        // 启动后端服务器
        colorLog('blue', '🚀 启动后端服务器...');
        const backendProcess = spawn('npx', ['nodemon', 'server.js'], {
            stdio: 'pipe',
            shell: true,
            cwd: path.join(__dirname, '..')
        });

        backendProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            if (output) {
                colorLog('blue', `[BACKEND] ${output}`);
            }
        });

        backendProcess.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (output && !output.includes('DeprecationWarning')) {
                colorLog('red', `[BACKEND] ${output}`);
            }
        });

        // 等待后端服务器启动
        colorLog('yellow', '⏳ 等待后端服务器启动...');
        
        setTimeout(async () => {
            try {
                await waitForServer('http://localhost:8080/api/health');
                colorLog('green', '✅ 后端服务器启动成功');
                
                // 启动前端构建工具
                colorLog('magenta', '🎨 启动前端构建工具...');
                
                // 启动CSS监听
                const cssProcess = spawn('npx', ['postcss', 'src/css/*.css', '--dir', 'dist/css', '--watch'], {
                    stdio: 'pipe',
                    shell: true,
                    cwd: path.join(__dirname, '..')
                });

                cssProcess.stdout.on('data', (data) => {
                    const output = data.toString().trim();
                    if (output) {
                        colorLog('magenta', `[CSS] ${output}`);
                    }
                });

                // 启动JS监听
                const jsProcess = spawn('npx', ['webpack', '--mode', 'development', '--watch'], {
                    stdio: 'pipe',
                    shell: true,
                    cwd: path.join(__dirname, '..')
                });

                jsProcess.stdout.on('data', (data) => {
                    const output = data.toString().trim();
                    if (output) {
                        colorLog('cyan', `[JS] ${output}`);
                    }
                });

                // 打开浏览器
                setTimeout(() => {
                    colorLog('green', '🌐 正在打开浏览器...');
                    const open = require('open');
                    open('http://localhost:8080/demo').catch(() => {
                        colorLog('yellow', '💡 请手动打开浏览器访问: http://localhost:8080/demo');
                    });
                }, 2000);

                colorLog('green', '\n🎉 全栈开发环境启动完成！');
                colorLog('yellow', '💡 使用 Ctrl+C 停止所有服务\n');

                // 处理进程退出
                process.on('SIGINT', () => {
                    colorLog('yellow', '\n📴 正在关闭所有服务...');
                    backendProcess.kill('SIGTERM');
                    cssProcess.kill('SIGTERM');
                    jsProcess.kill('SIGTERM');
                    setTimeout(() => process.exit(0), 1000);
                });

            } catch (error) {
                colorLog('red', `❌ 后端服务器启动失败: ${error.message}`);
                backendProcess.kill('SIGTERM');
                process.exit(1);
            }
        }, 3000);

    } catch (error) {
        colorLog('red', `❌ 启动失败: ${error.message}`);
        process.exit(1);
    }
}

// 运行主函数
main().catch((error) => {
    colorLog('red', `❌ 意外错误: ${error.message}`);
    process.exit(1);
});
