const path = require('path');
const fs = require('fs');

// 检查文件是否存在
function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (e) {
        return false;
    }
}

// 动态构建入口点
const entry = {};

// 主应用入口
const appEntry = './src/js/app.js';
if (fileExists(appEntry)) {
    entry.app = appEntry;
}

// AI系统模块入口
const aiModules = [
    './src/js/ai-recommendation/weakness-analyzer.js',
    './src/js/ai-recommendation/recommendation-engine.js',
    './src/js/ai-recommendation/adaptive-learning-path.js',
    './src/js/ai-recommendation/performance-tracker.js',
    './src/js/ai-recommendation/ai-recommendation-manager.js'
];

const existingAiModules = aiModules.filter(fileExists);
if (existingAiModules.length > 0) {
    entry['ai-system'] = existingAiModules;
}

module.exports = {
    entry,
    output: {
        path: path.resolve(__dirname, 'dist', 'js'),
        filename: '[name].bundle.js',
        clean: false // 不清理，避免删除其他文件
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : false, // 开发模式不生成source map
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                type: 'javascript/auto'
            }
        ]
    },
    optimization: {
        splitChunks: false // 简化配置，不分割代码
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@ai': path.resolve(__dirname, 'src/js/ai-recommendation'),
            '@utils': path.resolve(__dirname, 'src/js/utils')
        }
    },
    stats: {
        errorDetails: false, // 简化错误输出
        warnings: false
    }
};
