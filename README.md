# 🎓 LearnSphere AI - 智能英语学习平台

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/chenbuh/LearnSphere-AI)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Vue.js](https://img.shields.io/badge/vue.js-3.5.24-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/vite-7.2.4-646CFF.svg)](https://vitejs.dev/)

> 🤖 基于 Vue 3 + AI 技术的现代化英语学习平台，让英语学习更智能、更高效！
>
> 🔄 **源码仓库**: [GitHub](https://github.com/chenbuh/LearnSphere-AI) | [Gitee](https://gitee.com/yungongfang/learn-sphere-ai)

## 📋 项目简介

LearnSphere AI 是一个采用 **Vue 3 + Vite** 构建的现代化英语学习平台，集成了人工智能推荐系统、自适应学习路径和全面的学习管理功能。通过智能分析学习者的薄弱点，提供个性化的学习建议和内容推荐，帮助用户高效提升英语水平。

### ✨ 核心特色

- 🎯 **现代化技术栈** - Vue 3 + Vite + Spring Boot 3 + MySQL + Redis
- 🤖 **AI智能驱动** - 阅读、写作、听力、语法、口语全场景 AI 生成与批改
- 💎 **智能降级策略** - AI 配额耗尽时自动切换本地高频题库，学习不中断
- 📊 **自适应学习** - 动态调整学习路径和难度
- 🌏 **多考试类型** - 支持CET-4/6、雅思、托福、GRE等
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **精美UI界面** - 基于 Naive UI 的现代化界面设计
- 📈 **学习分析** - 详细的学习统计和进度追踪
- 🛡️ **AI安全治理** - 内置熔断机制与敏感内容过滤，保障系统稳定性
- 🔒 **安全审计** - 完整的登录与操作日志记录，支持异常监测

## 🎯 支持的考试类型

### 🇨🇳 国内考试
- **大学英语四级 (CET-4)** - 4430+ 词汇
- **大学英语六级 (CET-6)** - 5524+ 词汇
- **考研英语** - 5500+ 核心词汇
- **专业英语四级/八级 (TEM-4/8)** - 完整词汇库

### 🌍 国际考试
- **雅思考试 (IELTS)** - 核心词汇 + 真题练习
- **托福考试 (TOEFL)** - 分级词汇系统
- **GRE考试** - 高级词汇 + 逻辑训练

## 🚀 快速开始

### 环境要求

- **Node.js** >= 16.0.0
- **Java** JDK 17+
- **MySQL** >= 8.0
- **Redis** >= 5.0 (Windows下也可运行)
- **Maven** >= 3.6.0
- **npm** >= 7.0.0 或 **yarn** >= 1.22.0
- **现代浏览器** (Chrome 87+, Firefox 78+, Edge 88+, Safari 14+)

### 安装与启动

#### 1. 获取代码

```bash
# GitHub
git clone https://github.com/chenbuh/LearnSphere-AI.git

# Gitee (国内推荐)
git clone https://gitee.com/yungongfang/learn-sphere-ai.git

cd LearnSphere-AI
```

#### 2. 后端设置 (Spring Boot)

> ⚠️ **安全警告**：本项目已移除所有硬编码的密钥。在启动前，您**必须**配置本地敏感信息。

1. **配置数据库和Redis**
   - 创建 MySQL 数据库 `learnsphere_ai`
   - 启动 Redis 服务 (默认端口 6379)

2. **配置敏感信息**
   务必创建 `backend/src/main/resources/application-secret.properties` 文件：

   ```powershell
   # Windows 复制示例文件
   copy backend\src\main\resources\application-secret.properties.example backend\src\main\resources\application-secret.properties
   ```

   编辑该文件，填入您的真实信息：
   ```properties
   # 数据库密码
   spring.datasource.username=root
   spring.datasource.password=您的真实密码

   # 阿里云百炼 API Key (用于AI功能)
   ai.api-key=您的真实API密钥
   ```

3. **启动后端**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

#### 3. 前端设置 (Vue 3)

新开一个终端窗口：

```bash
cd frontend-vue
npm install
npm run dev
```

#### 4. 访问应用

- 前端地址: http://localhost:5173
- 后端API: http://localhost:8080
- Swagger文档: http://localhost:8080/doc.html

### 构建生产版本

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 📦 生产环境部署

详细的部署文档请查看：

- **[宝塔面板部署指南](./docs/BAOTA_DEPLOYMENT.md)** - 推荐！专为宝塔面板优化的部署文档
- **[快速部署参考](./QUICK_DEPLOY.md)** - 快速参考所有部署命令
- **[数据库初始化](./docs/DATABASE_INIT.md)** - 数据库创建和初始化命令
- **[通用部署文档](./docs/DEPLOYMENT.md)** - 适用于各种环境的完整部署指南

一键部署脚本（Windows）：
```powershell
.\deploy.bat
```

## 📚 功能模块

### 🎓 核心学习功能

#### 📖 词汇学习 (VocabularyView)
- **智能记忆算法** - 基于遗忘曲线的复习提醒
- **分级词汇系统** - 按考试类型和难度分级
- **多维度记忆** - 音标、释义、例句、联想记忆
- **实时进度追踪** - 掌握程度可视化
- **词汇测试** - 多种测试模式检验学习效果

#### 📝 语法练习 (GrammarView)
- **交互式练习** - 丰富的语法练习题型
- **知识点讲解** - 清晰的语法规则说明
- **错误分析** - 智能错误原因分析
- **进阶训练** - 从基础到高级的渐进练习

#### 🎵 听力训练 (ListeningView)
- **真题音频** - 历年考试真题听力材料
- **语速调节** - 支持调整播放速度
- **字幕控制** - 可选择显示/隐藏字幕
- **听写练习** - 提升听力理解能力

#### 📖 阅读理解 (ReadingView)
- **分级文章** - 按难度等级分类的阅读材料
- **题型丰富** - 包含各种阅读理解题型
- **时间管理** - 训练阅读速度和效率
- **生词标注** - 自动标注生词并加入学习计划

#### ✍️ 写作训练 (WritingView)
- **写作指导** - 专业的写作技巧指导
- **范文学习** - 优秀范文赏析
- **智能批改** - AI辅助写作批改
- **写作模板** - 各类写作模板参考

#### 🎯 模拟考试 (MockExamView)
- **完整考试体验** - 真实考试环境模拟
- **限时练习** - 严格的时间控制
- **成绩分析** - 详细的答题情况分析
- **错题回顾** - 智能错题整理和复习

### 📊 数据分析与管理

#### 📈 学习统计 (StatisticsView)
- **进度追踪** - 详细的学习进度可视化
- **成绩分析** - 各项能力的趋势分析
- **时间统计** - 学习时间分布和效率分析
- **目标管理** - 学习目标设定和达成情况

#### 🔍 学习分析 (LearningAnalysisView)
- **薄弱点分析** - 多维度评估学习薄弱点
- **能力雷达图** - 可视化展示各项能力
- **学习建议** - AI生成个性化学习建议
- **进步趋势** - 学习进步情况追踪

#### 📔 错题本 (ErrorBookView)
- **智能收集** - 自动收集错题和薄弱点
- **分类整理** - 按知识点和题型分类
- **复习提醒** - 基于遗忘曲线的复习计划
- **掌握追踪** - 错题掌握程度实时更新

#### 👤 个人中心 (ProfileView)
- **个人信息** - 用户资料管理
- **学习设置** - 个性化学习偏好设置
- **成就系统** - 学习成就和徽章
- **数据导出** - 学习数据导出功能

### 🏠 其他功能

#### 🎯 仪表盘 (DashboardView)
- **学习概览** - 今日学习情况总览
- **快速入口** - 常用功能快速访问
- **学习提醒** - 待复习内容提醒
- **推荐内容** - AI推荐的学习内容

#### 🌟 落地页 (LandingPage)
- **产品介绍** - 平台功能和特色展示
- **快速开始** - 新用户引导
- **功能演示** - 核心功能演示

#### 🔐 登录页 (LoginView)
- **用户登录** - 安全的用户认证
- **注册功能** - 新用户注册
- **密码找回** - 密码重置功能

## 🛠️ 技术架构

### 前端技术栈

```json
{
  "核心框架": {
    "vue": "^3.5.24",              // Vue 3 框架
    "vite": "^7.2.4",              // 下一代前端构建工具
    "vue-router": "^4.6.4",        // 官方路由管理器
    "pinia": "^3.0.4"              // 新一代状态管理
  },
  "UI组件库": {
    "naive-ui": "^2.43.2",         // 现代化 Vue 3 UI 组件库
    "lucide-vue-next": "^0.562.0", // 精美图标库
    "vfonts": "^0.0.3"             // 字体库
  },
  "工具库": {
    "axios": "^1.13.2",            // HTTP 客户端
    "autoprefixer": "^10.4.23",    // CSS 自动前缀
    "postcss": "^8.5.6"            // CSS 处理工具
  },
  "开发工具": {
    "@vitejs/plugin-vue": "^6.0.1" // Vue 3 的 Vite 插件
  }
}
```

### 后端技术栈

```xml
<!-- 核心框架 -->
Spring Boot 3.0.5      // Web框架
JDK 17+                // 运行环境

<!-- 数据库 -->
MyBatis-Plus 3.5.3.1   // ORM框架
MySQL 8.0              // 关系型数据库
Redis 6.0+             // 缓存数据库

<!-- 安全与认证 -->
Sa-Token 1.37.0        // 认证授权框架

<!-- AI 能力 -->
Aliyun DashScope       // 通义千问大模型 SDK
OpenAI Compatible      // 兼容 OpenAI 接口
Voice Activity Detect  // 语音活动检测
Text-to-Speech         // 语音合成 (Edge/Azure)
```

### AI算法

```javascript
// 推荐算法
协同过滤 (Collaborative Filtering)
内容过滤 (Content-based Filtering)
混合推荐 (Hybrid Recommendation)

// 学习算法
遗忘曲线算法 (Ebbinghaus Forgetting Curve)
自适应学习 (Adaptive Learning)
间隔重复 (Spaced Repetition)
```

### 🎙️ 语音功能实现 (Technical Breakdown)

本项目致力于提供媲美真实考场的听说交互体验，技术栈深度结合了 Web 标准与云端 AI 能力：

#### 1. 🔊 高保真语音合成 (TTS)
- **技术选型**: 采用多引擎融合架构，支持 **Microsoft Edge TTS**、**Azure Neural Voices** 与 **网易有道 (Youdao) API**。
- **高级降级策略**: 按照 `Edge > Azure > 有道 > 系统原生` 的顺序自动尝试最优质的音源。
- **实现细节**:
  - **后端代理**: 通过 `EdgeTTSController` 中转请求，绕过浏览器原生 `SpeechSynthesis` 的生硬感。
  - **有道引擎**: 针对单词与超短句集成有道 API (`dict.youdao.com/dictvoice`)，提供极速响应的真人发音。
  - **丰富音色**: 内置 `en-US-JennyNeural` (美音-女)、`en-GB-RyanNeural` (英音-男)、`zh-CN-XiaoxiaoNeural` (中文-女) 等多国地道神经网络语音。
  - **性能优化**: 前后端双重缓存，前端 `TTSManager` 利用 `Map` 存储已生成的 Blob URL，相同内容无需重复请求。

#### 2. 🎤 流式语音识别 (STT)
- **核心组件**: `webkitSpeechRecognition` (Web Speech API)。
- **交互特性**:
  - **流式追踪**: 开启 `interimResults: true`，在用户说话的同时实时获取候选文本。
  - **无间断监听**: 结合 `continuous: true` 与 `onend` 自动重启机制，解决移动端或长时间静音导致的识别中断。
  - **多语种适配**: 针对考试类型自动切换 `en-US` 或 `zh-CN` 识别引擎。

#### 3. 📊 智能发音评测算法
- **算法模型**: 位于 `audioRecorder.js` 中的 `PronunciationScorer` 类。
- **三维评估体系**:
  - **准确分 (Accuracy)**: 基于 **Levenshtein Distance (编辑距离)** 算法，计算用户录音转写文本与标准文本的字符/词级匹配度。
  - **流畅分 (Fluency)**: 通过分析词汇多样性 (`Diversity`) 与识别反馈的回调频率估算语速平滑度。
  - **完整分 (Completeness)**: 统计标准文本中单词在转写结果中的召回率。
- **逻辑位置**: 核心计算逻辑在前端完成，利用用户设备算力，极大降低服务器负载。

#### 4. 🎵 音频工程与处理
- **采集链路**: 使用 `MediaRecorder` 采集原始音频流，指定 `audio/webm;codecs=opus` 以获得高压缩比与极佳音质。
- **实时处理**: 封装 `AudioAnalyzer` 类，通过 `Web Audio API` 的 `AnalyserNode` 进行 **快速傅里叶变换 (FFT)**。
- **可视化**: 生成 `Uint8Array` 频谱数据，驱动前端波形图实时律动。

## 📁 项目结构

```
LearnSphere AI/
├── 📁 frontend-vue/              # 前端项目（Vue 3 + Vite）
│   ├── src/
│   │   ├── assets/               # 静态资源
│   │   │   └── vue.svg          # Vue logo
│   │   ├── components/           # 公共组件
│   │   │   └── HelloWorld.vue   # 示例组件
│   │   ├── data/                 # 数据文件
│   │   │   ├── vocabulary.js    # 词汇数据管理
│   │   │   ├── cet4_words.js    # CET-4 词汇
│   │   │   ├── cet6_words.js    # CET-6 词汇
│   │   │   ├── ielts_words.js   # 雅思词汇
│   │   │   ├── toefl_words.js   # 托福词汇
│   │   │   ├── gre_words.js     # GRE 词汇
│   │   │   └── grammar-exercises.js  # 语法练习数据
│   │   ├── layouts/              # 布局组件
│   │   │   └── MainLayout.vue   # 主布局
│   │   ├── router/               # 路由配置
│   │   │   └── index.js         # 路由定义
│   │   ├── stores/               # 状态管理 (Pinia)
│   │   │   ├── user.js          # 用户状态
│   │   │   └── learning.js      # 学习状态
│   │   ├── utils/                # 工具函数
│   │   ├── views/                # 页面组件
│   │   │   ├── DashboardView.vue        # 仪表盘
│   │   │   ├── VocabularyView.vue       # 词汇学习
│   │   │   ├── VocabularyTestView.vue   # 词汇测试
│   │   │   ├── GrammarView.vue          # 语法练习
│   │   │   ├── ListeningView.vue        # 听力训练
│   │   │   ├── ReadingView.vue          # 阅读理解
│   │   │   ├── WritingView.vue          # 写作训练
│   │   │   ├── MockExamView.vue         # 模拟考试
│   │   │   ├── StatisticsView.vue       # 学习统计
│   │   │   ├── LearningAnalysisView.vue # 学习分析
│   │   │   ├── ErrorBookView.vue        # 错题本
│   │   │   ├── ProfileView.vue          # 个人中心
│   │   │   ├── LandingPage.vue          # 落地页
│   │   │   └── LoginView.vue            # 登录页
│   │   ├── App.vue               # 根组件
│   │   ├── main.js               # 入口文件
│   │   └── style.css             # 全局样式
│   ├── public/                   # 公共资源
│   ├── index.html                # HTML 模板
│   ├── package.json              # 项目配置
│   ├── vite.config.js            # Vite 配置
│   └── README.md                 # 前端说明
├── 📁 docs/                      # 文档目录
│   ├── README.md                 # 文档导航
│   ├── DEVELOPMENT.md            # 开发文档
│   ├── BACKEND.md                # 后端文档
│   ├── API.md                    # API文档
│   └── DEPLOYMENT.md             # 部署文档
└── README.md                     # 项目说明
```

## 🎮 使用指南

### 基础学习流程

1. **访问平台** - 在浏览器中打开应用
2. **选择考试** - 从支持的考试类型中选择目标
3. **开始学习** - 选择学习模块开始学习
4. **查看进度** - 在统计页面查看学习进度
5. **复习巩固** - 使用错题本进行复习

### 页面导航

- **仪表盘** (`/`) - 学习概览和快速入口
- **词汇学习** (`/vocabulary`) - 词汇学习和记忆
- **词汇测试** (`/vocabulary-test`) - 词汇测试和检验
- **语法练习** (`/grammar`) - 语法知识学习
- **听力训练** (`/listening`) - 听力能力提升
- **阅读理解** (`/reading`) - 阅读技巧训练
- **写作训练** (`/writing`) - 写作能力培养
- **模拟考试** (`/mock-exam`) - 完整考试模拟
- **学习统计** (`/statistics`) - 学习数据统计
- **学习分析** (`/learning-analysis`) - 深度学习分析
- **错题本** (`/error-book`) - 错题复习管理
- **个人中心** (`/profile`) - 个人信息设置

## 🔧 开发指南

### 📚 完整文档

- **[开发文档](./docs/DEVELOPMENT.md)** - 完整的开发环境搭建和开发指南
- **[后端文档](./docs/BACKEND.md)** - Spring Boot 后端开发详细文档
- **[API文档](./docs/API.md)** - RESTful API 接口完整文档
- **[部署文档](./docs/DEPLOYMENT.md)** - 生产环境部署指南
- **[移动端适配指南](./docs/MOBILE_ADAPTATION.md)** - 全局移动端自动适配指南
- **[文档中心](./docs/README.md)** - 所有文档导航

### 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 代码规范

- 使用 **Vue 3 Composition API**
- 遵循 **ESLint** 代码规范
- 组件命名使用 **PascalCase**
- 文件命名使用 **camelCase**
- 提交信息遵循 **Conventional Commits**

## 📊 性能优化

### 前端优化
- ✅ **Vite 构建** - 极速的开发体验和构建速度
- ✅ **路由懒加载** - 按需加载页面组件
- ✅ **组件懒加载** - 按需加载大型组件
- ✅ **资源压缩** - 自动压缩 CSS/JS 文件
- ✅ **Tree Shaking** - 自动移除未使用的代码
- ✅ **代码分割** - 智能代码分割优化

### 用户体验优化
- ✅ **响应式设计** - 完美适配各种设备
- ✅ **加载动画** - 优雅的加载状态提示
- ✅ **错误处理** - 友好的错误提示
- ✅ **本地存储** - 数据持久化保存

## 🤝 贡献指南

### 参与贡献

我们欢迎所有形式的贡献！

1. **Fork** 本项目到您的账户
2. **Clone** 到本地开发环境
3. **创建** 功能分支 (`git checkout -b feature/AmazingFeature`)
4. **提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
5. **推送** 到分支 (`git push origin feature/AmazingFeature`)
6. **提交** Pull Request

### 开发规范

- ✅ 遵循现有代码风格
- ✅ 添加必要的注释
- ✅ 更新相关文档
- ✅ 提供详细的提交信息
- ✅ 确保代码可以正常运行

### 问题反馈

- 🐛 **Bug 报告** - 使用 Issue 模板报告问题
- 💡 **功能建议** - 提出新功能需求
- 📖 **文档改进** - 协助完善项目文档
- ❓ **使用问题** - 在 Discussions 中提问

## 📞 技术支持

### 常见问题

**Q: 如何重置学习数据？**  
A: 在个人中心页面选择"重置所有数据"或清空浏览器本地存储

**Q: 支持哪些浏览器？**  
A: 支持所有现代浏览器，推荐使用 Chrome、Firefox、Edge 最新版本

**Q: 只有 VIP 才能使用 AI 功能吗？**
A: 不完全是。普通用户每天有 5 次免费的 AI 生成/批改额度。升级 VIP 可享受 50~200 次/天的高额配额，且配额耗尽后系统会自动切换到本地高频题库，保证学习不中断。

**Q: 数据保存在哪里？**
A: 用户数据会安全地存储在服务器端的 MySQL 数据库中。部分临时缓存数据存储在 Redis 中。前端会在此基础上做适当的本地缓存以优化体验。

**Q: 如何导出学习数据？**  
A: 在个人中心页面可以导出 JSON 格式的学习数据

**Q: 项目可以商用吗？**  
A: 本项目基于 MIT 协议开源，可以自由使用和修改

### 联系方式

- 🌐 **项目主页**: [GitHub](https://github.com/chenbuh/LearnSphere-AI) | [Gitee](https://gitee.com/yungongfang/learn-sphere-ai)
- 📧 **邮箱**: support@learnsphere.ai
- 🐛 **问题反馈**: [GitHub Issues](https://github.com/chenbuh/LearnSphere-AI/issues)
- 📖 **在线文档**: [查看文档](./docs/README.md)

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议发布。

```
MIT License

Copyright (c) 2026 LearnSphere AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🏆 致谢

感谢以下优秀的开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Naive UI](https://www.naiveui.com/) - Vue 3 组件库
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库
- [Vue Router](https://router.vuejs.org/) - Vue 官方路由

感谢所有为 LearnSphere AI 做出贡献的开发者和用户！

## 🗺️ 路线图

### v2.0.0 (当前版本)
- ✅ Vue 3 + Vite 项目架构
- ✅ 完整的学习功能模块
- ✅ 数据统计和分析
- ✅ 响应式界面设计

### v2.1.0 (已发布)
- ✅ Spring Boot 后端 API 深度集成
- ✅ Sa-Token 全套用户认证系统 (登录/注册/VIP)
- ✅ AI 智能生成 (Qwen-Plus) 上线
- ✅ 词汇全库去重与 AI 补全
- ✅ VIP 配额系统与本地降级策略
- ✅ 语音识别 (STT) 与智能发音评测系统

### v2.2.0 (计划中)
- 🔄 云端数据实时同步
- 🔄 AI 导师 (AI Tutor) 跨模块全量集成 (进行中)
- 🔄 社交学习功能 (排行榜/挑战)
- 🔄 移动端 PWA 支持

### v3.0.0 (未来)
- 📋 AI 智能推荐系统
- 📋 实时协作学习
- 📋 移动端 App

---

<div align="center">
  <h3>🎓 让 AI 赋能英语学习，开启智慧学习新时代！</h3>
  <p>基于 Vue 3 + Vite 构建的现代化学习平台</p>
  
  [![Star this repo](https://img.shields.io/github/stars/chenbuh/LearnSphere-AI.svg?style=social)](https://github.com/chenbuh/LearnSphere-AI)
  
  <p>
    <a href="./docs/DEVELOPMENT.md">开发文档</a> •
    <a href="./docs/API.md">API 文档</a> •
    <a href="./docs/DEPLOYMENT.md">部署指南</a> •
    <a href="https://github.com/chenbuh/LearnSphere-AI/issues">问题反馈</a>
  </p>
</div>