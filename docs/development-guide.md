# 🔧 开发指南

## 🚀 快速开始

### 环境要求

#### 💻 开发环境
- **Node.js**: 14.0+ (推荐 LTS 版本)
- **npm**: 6.0+ 或 **yarn**: 1.22+
- **Git**: 2.20+
- **代码编辑器**: VS Code (推荐) / WebStorm / Sublime Text

#### 🌐 浏览器支持
- **Chrome**: 80+ (主要开发浏览器)
- **Firefox**: 75+
- **Edge**: 80+
- **Safari**: 13+

### 🛠️ 项目初始化

#### 1. 克隆项目
```bash
git clone https://github.com/yourname/english-exam-learning.git
cd english-exam-learning
```

#### 2. 安装依赖
```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

#### 3. 启动开发服务器
```bash
# 开发模式
npm run dev

# 或
yarn dev
```

#### 4. 构建生产版本
```bash
# 生产构建
npm run build

# 或
yarn build
```

## 📁 项目结构说明

### 🎯 核心目录

```
src/
├── html/           # HTML模板文件
├── css/            # 样式文件
├── js/             # JavaScript源码
└── components/     # 可复用组件
```

### 📄 配置文件

```
config/
├── app.config.js      # 应用配置
├── build.config.js    # 构建配置
└── database.config.js # 数据库配置
```

### 🛠️ 工具脚本

```
tools/
├── build.js       # 构建脚本
├── serve.js       # 开发服务器
└── launcher.js    # 桌面启动器
```

## 💻 开发流程

### 🌿 Git 工作流

#### 分支策略
```bash
main           # 主分支 (生产环境)
├── develop    # 开发分支
├── feature/*  # 功能分支
├── hotfix/*   # 紧急修复分支
└── release/*  # 发布分支
```

#### 常用命令
```bash
# 创建功能分支
git checkout -b feature/新功能名称

# 提交代码
git add .
git commit -m "feat: 添加新功能描述"

# 推送分支
git push origin feature/新功能名称

# 合并到开发分支
git checkout develop
git merge feature/新功能名称
```

#### 提交信息规范
```
feat: 新增功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

### 🔄 开发流程

#### 1. 需求分析
- 明确功能需求
- 设计用户界面
- 确定技术方案
- 评估开发时间

#### 2. 编码实现
- 创建功能分支
- 编写代码和测试
- 代码审查
- 合并到开发分支

#### 3. 测试验证
- 单元测试
- 集成测试
- 用户体验测试
- 性能测试

#### 4. 发布部署
- 构建生产版本
- 更新文档
- 发布版本
- 用户反馈收集

## 🧩 组件开发规范

### 📦 组件结构

```javascript
// 组件模板
class ComponentName {
  constructor(options = {}) {
    this.element = options.element;
    this.options = { ...this.defaultOptions, ...options };
    this.init();
  }
  
  // 默认配置
  get defaultOptions() {
    return {
      // 默认选项
    };
  }
  
  // 初始化
  init() {
    this.render();
    this.bindEvents();
  }
  
  // 渲染
  render() {
    // 渲染逻辑
  }
  
  // 事件绑定
  bindEvents() {
    // 事件处理
  }
  
  // 销毁
  destroy() {
    // 清理工作
  }
}
```

### 🎨 样式规范

#### CSS 命名规范 (BEM)
```css
/* 块 (Block) */
.vocabulary-card { }

/* 元素 (Element) */
.vocabulary-card__title { }
.vocabulary-card__content { }

/* 修饰符 (Modifier) */
.vocabulary-card--highlighted { }
.vocabulary-card__title--large { }
```

#### CSS 变量使用
```css
:root {
  /* 颜色变量 */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  
  /* 尺寸变量 */
  --border-radius: 4px;
  --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  /* 字体变量 */
  --font-family-base: 'Roboto', sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;
}
```

### 🔧 JavaScript 编码规范

#### ES6+ 特性使用
```javascript
// 使用 const/let 替代 var
const API_URL = 'https://api.example.com';
let currentUser = null;

// 使用箭头函数
const processData = (data) => {
  return data.map(item => item.value);
};

// 使用解构赋值
const { name, score, level } = studentData;

// 使用模板字符串
const message = `用户 ${name} 获得了 ${score} 分`;

// 使用 async/await
async function fetchData() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('数据获取失败:', error);
  }
}
```

#### 错误处理
```javascript
// 统一错误处理
class ErrorHandler {
  static handle(error, context = '') {
    console.error(`[${context}] 错误:`, error);
    
    // 用户友好的错误提示
    if (error.name === 'NetworkError') {
      this.showMessage('网络连接失败，请检查网络设置');
    } else {
      this.showMessage('操作失败，请稍后重试');
    }
  }
  
  static showMessage(message) {
    // 显示错误消息
  }
}
```

## 🧪 测试指南

### 🔍 单元测试

#### 测试框架: Jest
```javascript
// vocabulary.test.js
import { VocabularyManager } from '../src/js/vocabulary.js';

describe('VocabularyManager', () => {
  let vocabularyManager;
  
  beforeEach(() => {
    vocabularyManager = new VocabularyManager();
  });
  
  test('应该正确添加新单词', () => {
    const word = { english: 'hello', chinese: '你好' };
    vocabularyManager.addWord(word);
    
    expect(vocabularyManager.getWordCount()).toBe(1);
    expect(vocabularyManager.getWord('hello')).toEqual(word);
  });
  
  test('应该正确计算学习进度', () => {
    vocabularyManager.addWord({ english: 'hello', chinese: '你好', learned: true });
    vocabularyManager.addWord({ english: 'world', chinese: '世界', learned: false });
    
    expect(vocabularyManager.getProgress()).toBe(0.5);
  });
});
```

#### 运行测试
```bash
# 运行所有测试
npm test

# 运行特定测试文件
npm test vocabulary.test.js

# 生成覆盖率报告
npm run test:coverage
```

### 🔗 集成测试

#### 端到端测试: Playwright
```javascript
// e2e/vocabulary.spec.js
import { test, expect } from '@playwright/test';

test('词汇学习流程', async ({ page }) => {
  await page.goto('http://localhost:8080');
  
  // 点击词汇学习
  await page.click('[data-testid="vocabulary-button"]');
  
  // 验证页面跳转
  await expect(page).toHaveURL(/.*vocabulary/);
  
  // 开始学习
  await page.click('[data-testid="start-learning"]');
  
  // 验证单词显示
  await expect(page.locator('.vocabulary-card')).toBeVisible();
});
```

## 🚀 构建和部署

### 📦 构建配置

#### Webpack 配置优化
```javascript
// webpack.prod.js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/js/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    clean: true
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      }),
      new OptimizeCSSAssetsPlugin()
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 🖥️ 桌面应用打包

#### Electron 集成
```javascript
// main.js (Electron主进程)
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  // 加载应用
  mainWindow.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);
```

#### 打包脚本
```json
{
  "scripts": {
    "electron": "electron .",
    "electron:build": "electron-builder",
    "dist:win": "electron-builder --win",
    "dist:mac": "electron-builder --mac",
    "dist:linux": "electron-builder --linux"
  }
}
```

## 📊 性能优化

### ⚡ 代码优化

#### 懒加载实现
```javascript
// 路由懒加载
const routes = {
  vocabulary: () => import('./modules/vocabulary.js'),
  grammar: () => import('./modules/grammar.js'),
  listening: () => import('./modules/listening.js')
};

// 动态加载模块
async function loadModule(moduleName) {
  const module = await routes[moduleName]();
  return module.default;
}
```

#### 防抖和节流
```javascript
// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}
```

### 🔄 缓存策略

#### Service Worker 缓存
```javascript
// sw.js
const CACHE_NAME = 'english-exam-v1';
const urlsToCache = [
  '/',
  '/css/main.css',
  '/js/app.js',
  '/assets/data/vocabulary.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
```

## 🐛 调试技巧

### 🔍 开发者工具使用

#### Console 调试
```javascript
// 使用不同级别的日志
console.log('普通信息');
console.info('提示信息');
console.warn('警告信息');
console.error('错误信息');

// 使用断点调试
debugger; // 在此处暂停执行

// 性能分析
console.time('数据处理');
// ... 代码执行
console.timeEnd('数据处理');
```

#### 网络请求调试
```javascript
// 拦截 fetch 请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch 请求:', args);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Fetch 响应:', response);
      return response;
    });
};
```

### 📱 移动端调试

#### 远程调试设置
1. Chrome DevTools 远程调试
2. 使用 Eruda 移动端调试工具
3. Weinre 远程调试工具

## 📚 文档维护

### 📝 代码注释规范

#### JSDoc 注释
```javascript
/**
 * 词汇管理器
 * @class VocabularyManager
 */
class VocabularyManager {
  /**
   * 添加新单词
   * @param {Object} word - 单词对象
   * @param {string} word.english - 英文单词
   * @param {string} word.chinese - 中文释义
   * @param {number} [word.level=1] - 难度等级
   * @returns {boolean} 添加是否成功
   */
  addWord(word) {
    // 实现逻辑
  }
}
```

### 📖 文档生成

#### 使用 JSDoc 生成文档
```bash
# 安装 JSDoc
npm install -g jsdoc

# 生成文档
jsdoc src/ -d docs/api/
```

---

<div align="center">
  <b>🛠️ 遵循以上开发指南，确保代码质量和团队协作效率！</b>
</div>
