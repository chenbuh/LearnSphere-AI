#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

console.log('🏗️  开始构建生产版本...\n');

async function build() {
    try {
        // 设置生产环境
        process.env.NODE_ENV = 'production';
        
        // 清理dist目录
        const distPath = path.join(__dirname, '..', 'dist');
        try {
            await fs.rmdir(distPath, { recursive: true });
            console.log('🗑️  清理dist目录完成');
        } catch (err) {
            // 目录不存在，忽略错误
        }
        
        // 创建dist目录
        await fs.mkdir(distPath, { recursive: true });
        await fs.mkdir(path.join(distPath, 'css'), { recursive: true });
        await fs.mkdir(path.join(distPath, 'js'), { recursive: true });
        
        console.log('📁 创建构建目录完成');
        
        // 构建CSS
        console.log('🎨 构建CSS文件...');
        await runCommand('npm', ['run', 'build:css']);
        
        // 构建JavaScript
        console.log('📦 构建JavaScript文件...');
        await runCommand('npm', ['run', 'build:js']);
        
        // 复制HTML文件
        console.log('📄 复制HTML文件...');
        await copyHtmlFiles();
        
        // 生成构建信息
        await generateBuildInfo();
        
        console.log('\n✅ 构建完成!');
        console.log('📊 构建统计:');
        await showBuildStats();
        
    } catch (error) {
        console.error('❌ 构建失败:', error.message);
        process.exit(1);
    }
}

function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            cwd: path.join(__dirname, '..')
        });
        
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`命令失败: ${command} ${args.join(' ')}`));
            } else {
                resolve();
            }
        });
    });
}

async function copyHtmlFiles() {
    const srcHtmlPath = path.join(__dirname, '..', 'src', 'html');
    const distHtmlPath = path.join(__dirname, '..', 'dist', 'html');
    
    await fs.mkdir(distHtmlPath, { recursive: true });
    
    const htmlFiles = await fs.readdir(srcHtmlPath);
    
    for (const file of htmlFiles) {
        if (file.endsWith('.html')) {
            const srcFile = path.join(srcHtmlPath, file);
            const distFile = path.join(distHtmlPath, file);
            
            let content = await fs.readFile(srcFile, 'utf8');
            
            // 更新资源路径为构建后的路径
            content = content
                .replace(/\.\.\/css\//g, '../css/')
                .replace(/\.\.\/js\//g, '../js/')
                .replace(/src="\.\.\/js\/([^"]+)\.js"/g, 'src="../js/$1.bundle.js"');
            
            await fs.writeFile(distFile, content);
        }
    }
}

async function generateBuildInfo() {
    const buildInfo = {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
        nodeVersion: process.version,
        environment: 'production'
    };
    
    const buildInfoPath = path.join(__dirname, '..', 'dist', 'build-info.json');
    await fs.writeFile(buildInfoPath, JSON.stringify(buildInfo, null, 2));
}

async function showBuildStats() {
    const distPath = path.join(__dirname, '..', 'dist');
    
    async function getDirectorySize(dirPath) {
        let totalSize = 0;
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const file of files) {
            const filePath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                totalSize += await getDirectorySize(filePath);
            } else {
                const stats = await fs.stat(filePath);
                totalSize += stats.size;
            }
        }
        
        return totalSize;
    }
    
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    try {
        const totalSize = await getDirectorySize(distPath);
        console.log(`   总大小: ${formatBytes(totalSize)}`);
        
        // 显示各类文件大小
        const cssSize = await getDirectorySize(path.join(distPath, 'css'));
        const jsSize = await getDirectorySize(path.join(distPath, 'js'));
        
        console.log(`   CSS文件: ${formatBytes(cssSize)}`);
        console.log(`   JS文件: ${formatBytes(jsSize)}`);
        
    } catch (err) {
        console.log('   无法获取构建统计信息');
    }
}

// 运行构建
build();
