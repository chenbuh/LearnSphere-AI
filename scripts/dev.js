#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const open = require('open');
const fs = require('fs');

console.log('🚀 启动Node.js开发环境...\n');

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error('❌ 需要Node.js 16.0.0或更高版本');
    console.error(`   当前版本: ${nodeVersion}`);
    process.exit(1);
}

console.log(`✅ Node.js版本检查通过: ${nodeVersion}`);

// 检查依赖是否安装
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 正在安装依赖...');
    const install = spawn('npm', ['install'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.join(__dirname, '..')
    });

    install.on('close', (code) => {
        if (code !== 0) {
            console.error('❌ 依赖安装失败');
            process.exit(1);
        }
        startDevelopmentServer();
    });
} else {
    console.log('✅ 依赖检查通过');
    startDevelopmentServer();
}

function startDevelopmentServer() {
    console.log('\n🔧 启动开发服务器...');
    
    // 设置环境变量
    process.env.NODE_ENV = 'development';
    
    // 启动nodemon
    const server = spawn('npx', ['nodemon', 'server.js'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.join(__dirname, '..')
    });

    // 延迟打开浏览器
    setTimeout(() => {
        console.log('\n🌐 正在打开浏览器...');
        open('http://localhost:8080/demo').catch(() => {
            console.log('💡 请手动打开浏览器访问: http://localhost:8080/demo');
        });
    }, 3000);

    // 处理进程退出
    process.on('SIGINT', () => {
        console.log('\n📴 正在关闭开发服务器...');
        server.kill('SIGTERM');
        process.exit(0);
    });

    server.on('close', (code) => {
        console.log(`\n✅ 开发服务器已关闭 (退出码: ${code})`);
    });
}

// 显示开发提示
console.log('\n💡 开发提示:');
console.log('   - 主应用: http://localhost:8080/');
console.log('   - AI演示: http://localhost:8080/demo');
console.log('   - API状态: http://localhost:8080/api/health');
console.log('   - 使用 Ctrl+C 停止服务器');
console.log('   - 修改文件会自动重启服务器\n');
