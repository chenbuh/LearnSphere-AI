# 📖 LearnSphere AI - 开发文档

> 本文档为开发者提供完整的项目开发指南，包括环境搭建、架构设计、开发规范和最佳实践。

## 📑 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [环境搭建](#环境搭建)
- [项目结构](#项目结构)
- [核心模块](#核心模块)
- [开发规范](#开发规范)
- [API文档](#api文档)
- [数据库设计](#数据库设计)
- [测试指南](#测试指南)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

---

## 项目概述

### 项目简介

LearnSphere AI 是一个基于 Vue 3 + Vite 的现代化英语学习平台，采用前后端分离架构，集成了AI智能推荐系统、自适应学习路径和全面的学习管理功能。

### 核心功能

- **词汇学习系统** - 支持多种考试类型的词汇学习
- **语法练习模块** - 交互式语法练习和知识点讲解
- **阅读理解训练** - 分级阅读材料和题型练习
- **AI推荐引擎** - 个性化学习内容推荐
- **学习数据分析** - 详细的学习统计和进度追踪
- **用户管理系统** - 完整的用户认证和权限管理

### 技术特点

- 🚀 **现代化技术栈** - Vue 3 + Vite + Pinia
- 📦 **组件化开发** - 高度模块化的组件设计
- 🎨 **UI组件库** - Naive UI 提供丰富的UI组件
- 🔄 **状态管理** - Pinia 实现响应式状态管理
- 🛣️ **路由管理** - Vue Router 4 实现SPA路由
- 📡 **HTTP客户端** - Axios 处理API请求
- 🎯 **TypeScript支持** - 可选的类型安全

---

## 技术栈

### 后端技术栈

#### 核心框架
```xml
<!-- Spring Boot 3.0.5 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.0.5</version>
</dependency>
```

#### 数据库相关
```xml
<!-- MyBatis-Plus -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.5.3.1</version>
</dependency>

<!-- MySQL驱动 -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.0.33</version>
</dependency>

<!-- Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

#### 认证授权
```xml
<!-- Sa-Token -->
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-spring-boot3-starter</artifactId>
    <version>1.37.0</version>
</dependency>

<!-- Sa-Token Redis集成 -->
<dependency>
    <groupId>cn.dev33</groupId>
    <artifactId>sa-token-redis-jackson</artifactId>
    <version>1.37.0</version>
</dependency>
```

### 前端技术栈

#### 核心框架
```json
{
  "vue": "^3.5.24",           // Vue 3 框架
  "vite": "^7.2.4",           // 构建工具
  "vue-router": "^4.6.4",     // 路由管理
  "pinia": "^3.0.4"           // 状态管理
}
```

#### UI组件库
```json
{
  "naive-ui": "^2.43.2",      // UI组件库
  "lucide-vue-next": "^0.562.0", // 图标库
  "vfonts": "^0.0.3"          // 字体库
}
```

#### 工具库
```json
{
  "axios": "^1.13.2",         // HTTP客户端
  "autoprefixer": "^10.4.23", // CSS自动前缀
  "postcss": "^8.5.6"         // CSS处理工具
}
```

### 开发工具

**后端**
- **Maven** - 项目构建管理
- **Lombok** - 简化Java代码
- **Hutool** - Java工具类库

**前端**
- **@vitejs/plugin-vue** - Vue 3 的 Vite 插件
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

### 环境要求

**后端**
- JDK >= 17
- Maven >= 3.8.0
- MySQL >= 8.0
- Redis >= 6.0

**前端**
- Node.js >= 16.0.0
- npm >= 7.0.0

### 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

---

## 环境搭建

### 前置要求

确保你的开发环境满足以下要求：

**后端环境**
```bash
JDK >= 17
Maven >= 3.8.0
MySQL >= 8.0
Redis >= 6.0
```

**前端环境**
```bash
Node.js >= 16.0.0
npm >= 7.0.0 或 yarn >= 1.22.0
Git >= 2.0.0
```

### 安装步骤

#### 1. 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/learnsphere/learnsphere-ai.git

# 或使用 SSH
git clone git@github.com:learnsphere/learnsphere-ai.git

# 进入项目目录
cd learnsphere-ai
```

#### 2. 后端环境搭建

##### 2.1 配置数据库

```sql
-- 创建数据库
CREATE DATABASE learnsphere_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE learnsphere_ai;

-- 导入数据库脚本（如果有）
SOURCE /path/to/schema.sql;
```

##### 2.2 配置Redis

```bash
# 启动Redis服务
redis-server

# 或使用Docker启动
docker run -d -p 6379:6379 --name redis redis:latest
```

##### 2.3 配置application.yml

```yaml
# src/main/resources/application.yml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/learnsphere_ai?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: chen20040209
  
  redis:
    host: localhost
    port: 6379
    password: 
    database: 0

# MyBatis-Plus配置
mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.learnsphere.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# Sa-Token配置
sa-token:
  token-name: satoken
  timeout: 2592000
  active-timeout: -1
  is-concurrent: true
  is-share: true
  token-style: uuid
  is-log: false
```

##### 2.4 启动后端服务

```bash
# 进入后端目录
cd backend

# 使用Maven编译
mvn clean install

# 启动Spring Boot应用
mvn spring-boot:run

# 或直接运行jar包
java -jar target/learnsphere-ai-backend.jar
```

后端服务默认运行在：`http://localhost:8080`

#### 3. 前端环境搭建

##### 3.1 安装依赖

```bash
# 进入前端目录
cd frontend-vue

# 使用 npm 安装
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

##### 3.2 配置环境变量

在 `frontend-vue` 目录创建环境变量文件：

```bash
# .env.development（开发环境）
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=LearnSphere AI - 开发环境

# .env.production（生产环境）
VITE_API_BASE_URL=https://api.learnsphere.ai
VITE_APP_TITLE=LearnSphere AI
```

##### 3.3 启动开发服务器

```bash
# 启动开发服务器（默认端口：5173）
npm run dev

# 指定端口启动
npm run dev -- --port 3000
```

前端应用默认运行在：`http://localhost:5173`

#### 4. 访问应用

打开浏览器访问：`http://localhost:5173`

---

## 项目结构

### 目录结构

```
frontend-vue/
├── public/                    # 静态资源目录
│   └── vite.svg              # 网站图标
├── src/                      # 源代码目录
│   ├── assets/               # 资源文件
│   │   └── vue.svg          # Vue logo
│   ├── components/           # 公共组件
│   │   └── HelloWorld.vue   # 示例组件
│   ├── data/                 # 数据文件
│   │   ├── vocabulary.js    # 词汇数据管理
│   │   ├── cet4_words.js    # CET-4词汇
│   │   ├── cet6_words.js    # CET-6词汇
│   │   ├── ielts_words.js   # 雅思词汇
│   │   ├── toefl_words.js   # 托福词汇
│   │   ├── gre_words.js     # GRE词汇
│   │   ├── grammar-exercises.js        # 语法练习数据
│   │   ├── reading-comprehension-*.js  # 阅读理解数据
│   │   └── vocabulary_index.js         # 词汇索引
│   ├── layouts/              # 布局组件
│   │   ├── DefaultLayout.vue # 默认布局
│   │   └── AdminLayout.vue   # 管理后台布局
│   ├── router/               # 路由配置
│   │   └── index.js         # 路由定义
│   ├── stores/               # 状态管理
│   │   ├── user.js          # 用户状态
│   │   ├── learning.js      # 学习状态
│   │   └── ai.js            # AI系统状态
│   ├── utils/                # 工具函数
│   │   ├── request.js       # HTTP请求封装
│   │   ├── storage.js       # 本地存储工具
│   │   └── helpers.js       # 辅助函数
│   ├── views/                # 页面组件
│   │   ├── Home.vue         # 首页
│   │   ├── Vocabulary.vue   # 词汇学习
│   │   ├── Grammar.vue      # 语法练习
│   │   ├── Reading.vue      # 阅读理解
│   │   ├── Profile.vue      # 用户中心
│   │   └── Admin.vue        # 管理后台
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局样式
├── .gitignore               # Git忽略文件
├── index.html               # HTML模板
├── package.json             # 项目配置
├── postcss.config.js        # PostCSS配置
├── vite.config.js           # Vite配置
└── README.md                # 项目说明
```

### 核心文件说明

#### main.js - 应用入口
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
```

#### vite.config.js - 构建配置
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

---

## 核心模块

### 1. 路由系统

#### 路由配置示例

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/vocabulary',
    name: 'Vocabulary',
    component: () => import('../views/Vocabulary.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/grammar',
    name: 'Grammar',
    component: () => import('../views/Grammar.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

### 2. 状态管理

#### Pinia Store 示例

```javascript
// src/stores/user.js
import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: null,
    isLoggedIn: false
  }),
  
  getters: {
    username: (state) => state.userInfo?.username || '',
    userId: (state) => state.userInfo?.id || null
  },
  
  actions: {
    // 登录
    async login(credentials) {
      try {
        const response = await loginApi(credentials)
        this.token = response.data.satoken
        this.userInfo = response.data.user
        this.isLoggedIn = true
        localStorage.setItem('satoken', this.token)
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },
    
    // 登出
    async logout() {
      try {
        await logoutApi()
      } finally {
        this.token = null
        this.userInfo = null
        this.isLoggedIn = false
        localStorage.removeItem('satoken')
      }
    },
    
    // 从本地存储恢复登录状态
    restoreLogin() {
      const token = localStorage.getItem('satoken')
      if (token) {
        this.token = token
        this.isLoggedIn = true
      }
    }
  }
})
```

### 3. HTTP请求封装

```javascript
// src/utils/request.js
import axios from 'axios'
import { useMessage } from 'naive-ui'

const message = useMessage()

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取Sa-Token
    const token = localStorage.getItem('satoken')
    if (token) {
      config.headers['satoken'] = token
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据后端返回的code判断
    if (res.code === 200) {
      return res
    } else {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    console.error('响应错误:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并跳转登录
          localStorage.removeItem('satoken')
          window.location.href = '/login'
          message.error('登录已过期，请重新登录')
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(error.response.data?.message || '请求失败')
      }
    } else {
      message.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default request
```

### 4. 本地存储工具

```javascript
// src/utils/storage.js

/**
 * 本地存储工具类
 */
class Storage {
  /**
   * 设置存储项
   */
  set(key, value) {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(key, data)
    } catch (error) {
      console.error('存储失败:', error)
    }
  }
  
  /**
   * 获取存储项
   */
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error('读取失败:', error)
      return defaultValue
    }
  }
  
  /**
   * 删除存储项
   */
  remove(key) {
    localStorage.removeItem(key)
  }
  
  /**
   * 清空所有存储
   */
  clear() {
    localStorage.clear()
  }
}

export default new Storage()
```

---

## 开发规范

### 代码风格

#### Vue组件规范

```vue
<!-- 推荐的组件结构 -->
<template>
  <div class="component-name">
    <!-- 模板内容 -->
  </div>
</template>

<script setup>
// 1. 导入依赖
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. 定义props
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

// 3. 定义emits
const emit = defineEmits(['update', 'delete'])

// 4. 响应式数据
const count = ref(0)

// 5. 计算属性
const doubleCount = computed(() => count.value * 2)

// 6. 方法
const increment = () => {
  count.value++
  emit('update', count.value)
}

// 7. 生命周期
onMounted(() => {
  console.log('组件已挂载')
})
</script>

<style scoped>
/* 组件样式 */
.component-name {
  /* 样式定义 */
}
</style>
```

#### JavaScript规范

```javascript
// 1. 使用 const 和 let，避免使用 var
const API_URL = 'https://api.example.com'
let count = 0

// 2. 使用箭头函数
const add = (a, b) => a + b

// 3. 使用模板字符串
const message = `Hello, ${username}!`

// 4. 使用解构赋值
const { name, age } = user
const [first, second] = array

// 5. 使用扩展运算符
const newArray = [...oldArray, newItem]
const newObject = { ...oldObject, newProp: value }

// 6. 使用可选链
const value = obj?.prop?.subProp

// 7. 使用空值合并
const result = value ?? defaultValue
```

### 命名规范

#### 文件命名
```
组件文件：PascalCase（大驼峰）
  ✅ UserProfile.vue
  ✅ VocabularyCard.vue
  ❌ userProfile.vue
  ❌ vocabulary-card.vue

工具文件：camelCase（小驼峰）
  ✅ request.js
  ✅ storageHelper.js
  ❌ Request.js
  ❌ storage-helper.js

常量文件：UPPER_CASE（大写下划线）
  ✅ API_CONSTANTS.js
  ✅ CONFIG.js
```

#### 变量命名
```javascript
// 布尔值：使用 is/has/can 前缀
const isLoading = ref(false)
const hasPermission = computed(() => true)
const canEdit = ref(true)

// 数组：使用复数形式
const users = ref([])
const vocabularyList = ref([])

// 对象：使用名词
const userInfo = ref({})
const config = ref({})

// 函数：使用动词开头
const fetchData = async () => {}
const handleClick = () => {}
const validateForm = () => {}
```

### 注释规范

```javascript
/**
 * 函数功能说明
 * @param {string} username - 用户名
 * @param {number} age - 年龄
 * @returns {Object} 用户信息对象
 */
function createUser(username, age) {
  // 实现逻辑
  return { username, age }
}

/**
 * 组件说明
 * @component VocabularyCard
 * @description 词汇卡片组件，用于展示单词信息
 */
```

### Git提交规范

```bash
# 提交格式
<type>(<scope>): <subject>

# 类型说明
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式调整
refactor: 代码重构
test:     测试相关
chore:    构建/工具链更新

# 示例
feat(vocabulary): 添加单词收藏功能
fix(grammar): 修复语法练习提交bug
docs(readme): 更新安装说明
```

---

## API文档

### 基础信息

```
Base URL: http://localhost:3000/api
认证方式: Bearer Token
数据格式: JSON
```

### 用户相关API

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": "string",
    "token": "string"
  }
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string"
    }
  }
}
```

### 词汇相关API

#### 获取词汇列表
```http
GET /api/vocabulary?type=cet4&page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "string",
        "word": "string",
        "phonetic": "string",
        "definition": "string",
        "example": "string"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

#### 添加学习记录
```http
POST /api/learning/record
Authorization: Bearer {token}
Content-Type: application/json

{
  "wordId": "string",
  "isCorrect": boolean,
  "timeSpent": number
}

Response:
{
  "code": 200,
  "message": "记录成功"
}
```

### 错误码说明

```javascript
200: 成功
400: 请求参数错误
401: 未授权
403: 禁止访问
404: 资源不存在
500: 服务器错误
```

---

## 数据库设计

### 用户表 (users)

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  exam_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 词汇表 (vocabulary)

```sql
CREATE TABLE vocabulary (
  id VARCHAR(36) PRIMARY KEY,
  word VARCHAR(100) NOT NULL,
  phonetic VARCHAR(100),
  definition TEXT,
  example TEXT,
  exam_type VARCHAR(20),
  difficulty INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 学习记录表 (learning_records)

```sql
CREATE TABLE learning_records (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  word_id VARCHAR(36) NOT NULL,
  is_correct BOOLEAN,
  time_spent INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (word_id) REFERENCES vocabulary(id)
);
```

---

## 测试指南

### 单元测试

```bash
# 安装测试依赖
npm install -D vitest @vue/test-utils

# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 测试示例

```javascript
// tests/components/VocabularyCard.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VocabularyCard from '@/components/VocabularyCard.vue'

describe('VocabularyCard', () => {
  it('正确渲染单词信息', () => {
    const wrapper = mount(VocabularyCard, {
      props: {
        word: 'hello',
        definition: '你好'
      }
    })
    
    expect(wrapper.text()).toContain('hello')
    expect(wrapper.text()).toContain('你好')
  })
})
```

---

## 部署指南

### 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

### 部署到服务器

#### 使用Nginx

```nginx
server {
    listen 80;
    server_name learnsphere.ai;
    
    root /var/www/learnsphere/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 使用Docker

```dockerfile
# Dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 常见问题

### Q: 如何解决端口占用问题？

```bash
# 修改 vite.config.js
export default defineConfig({
  server: {
    port: 3000  // 修改为其他端口
  }
})
```

### Q: 如何配置代理解决跨域问题？

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### Q: 如何优化构建体积？

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['naive-ui']
        }
      }
    }
  }
})
```

---

## 📞 技术支持

如有问题，请通过以下方式联系：

- 📧 Email: dev@learnsphere.ai
- 💬 GitHub Issues: https://github.com/learnsphere/learnsphere-ai/issues
- 📖 文档: https://docs.learnsphere.ai

---

**最后更新时间**: 2026-01-09
