# 📚 LearnSphere AI 管理后台

## 🎯 功能简介

LearnSphere AI 管理后台是一个现代化的后台管理系统，用于管理LearnSphere英语学习平台的各项数据和内容。

### 主要功能模块：

1. **📊 数据概览（Dashboard）**
   - 系统统计数据：总用户数、活跃用户、词汇总数、学习记录
   - 用户增长趋势图（最近30天）
   - 今日数据监控

2. **👥 用户管理（Users）**
   - 用户列表查看与分页
   - 搜索用户（用户名、邮箱、昵称）
   - 用户启用/禁用
   - 用户删除

3. **📖 词汇库管理（Vocabulary）**
   - 词汇列表查看与分页
   - 按考试类型筛选（CET-4、CET-6、IELTS、TOEFL、GRE）
   - 添加/编辑/删除词汇
   - 批量导入词汇（API支持）

4. **📝 学习记录（Records）**
   - 查看所有用户学习记录
   - 按内容类型筛选（词汇、语法、阅读）
   - 学习数据统计分析

5. **📚 内容管理（Content）**
   - 听力材料管理
   - 阅读文章管理

---

## 🚀 快速开始

### 1️⃣ 启动后端服务

确保后端服务已启动并运行在 `http://localhost:8080`。

后端已自动配置管理API接口（`AdminController.java`），无需额外操作。

### 2️⃣ 安装依赖

```bash
cd admin-vue
npm install
```

### 3️⃣ 启动管理后台

```bash
npm run dev
```

管理后台将运行在：**http://localhost:5174**

### 4️⃣ 生产环境打包

```bash
npm run build
```

打包后的文件在 `dist/` 目录，可部署到任何静态服务器。

---

## 🎨 技术栈

- **前端框架**: Vue 3 + Vite
- **UI组件库**: Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router
- **图表**: ECharts
- **图标**: Lucide Vue Next
- **HTTP客户端**: Axios

---

## 📁 项目结构

```
admin-vue/
├── src/
│   ├── api/              # API接口
│   │   └── admin.js
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── utils/            # 工具函数
│   │   └── request.js
│   ├── views/            # 页面视图
│   │   ├── Dashboard.vue      # 数据概览
│   │   ├── Users.vue          # 用户管理
│   │   ├── Vocabulary.vue     # 词汇库
│   │   ├── Records.vue        # 学习记录
│   │   └── Content.vue        # 内容管理
│   ├── App.vue           # 主应用组件
│   ├── main.js           # 入口文件
│   └── style.css         # 全局样式
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔧 配置说明

### API地址配置

在 `.env.development` 文件中配置后端API地址：

```env
VITE_API_URL=http://localhost:8080/api
```

生产环境配置 `.env.production`：

```env
VITE_API_URL=https://your-domain.com/api
```

---

## 📡 后端API接口

所有管理接口都在 `/admin` 路径下：

| 接口路径 | 方法 | 说明 |
|---------|------|------|
| `/admin/stats` | GET | 获取系统统计数据 |
| `/admin/user-growth` | GET | 获取用户增长趋势 |
| `/admin/users` | GET | 获取用户列表 |
| `/admin/users/{id}/status` | PUT | 更新用户状态 |
| `/admin/users/{id}` | DELETE | 删除用户 |
| `/admin/vocabulary` | GET / POST | 获取/添加词汇 |
| `/admin/vocabulary/{id}` | PUT / DELETE | 更新/删除词汇 |
| `/admin/vocabulary/batch` | POST | 批量导入词汇 |
| `/admin/learning-records` | GET | 获取学习记录 |
| `/admin/listening` | GET | 获取听力材料 |
| `/admin/reading` | GET | 获取阅读文章 |

---

## 🎯 使用建议

1. **权限控制**：建议在后端添加管理员权限验证
2. **数据导出**：可扩展添加数据导出功能（Excel、CSV）
3. **批量操作**：可添加批量删除、批量修改功能
4. **日志审计**：记录管理员操作日志

---

## 🌟 界面特色

- 🎨 现代化深色主题设计
- 📱 响应式布局，支持多种屏幕尺寸
- ⚡ 快速加载与流畅交互
- 📊 数据可视化看板
- 🎭 渐变色彩与微动效

---

##  开发团队

LearnSphere Team

---

祝你使用愉快！如有问题，请查看项目文档或联系开发团队。
