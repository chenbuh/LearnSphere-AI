# LearnSphere AI

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/chenbuh/LearnSphere-AI)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/vue-3.5.24-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/vite-7.3.1-646CFF.svg)](https://vitejs.dev/)

基于 Vue 3、Spring Boot 3、MySQL、Redis 和 AI 能力构建的英语学习平台，包含学习者前台、管理后台、后端服务、AI 治理和部署运维文档体系。

源码仓库： [GitHub](https://github.com/chenbuh/LearnSphere-AI) | [Gitee](https://gitee.com/yungongfang/learn-sphere-ai)

## 项目组成

仓库当前主要包含 3 个运行主体：

- `frontend-vue`
  学习者前台，包含词汇、语法、听力、阅读、写作、模拟考试、学习分析等模块。
- `admin-vue`
  管理后台，包含用户、内容、日志、系统设置、AI 治理、敏感词审计、Redis 管理等模块。
- `backend`
  Spring Boot 后端，负责业务 API、AI 调用、配置管理、日志审计和 Prometheus 指标暴露。

补充入口：

- `docs`
  项目文档中心。
- `scripts`
  本地发版、静态资源同步等辅助脚本。

如果你是第一次接手这个仓库，建议先读：

- [项目总览与模块边界](./docs/开发指南/项目总览与模块边界.md)
- [系统模块关系与关键链路](./docs/开发指南/系统模块关系与关键链路.md)
- [关键模块维护地图](./docs/开发指南/关键模块维护地图.md)
- [文档中心](./docs/README.md)
- [环境变量与启动说明](./docs/部署运维/环境变量与启动说明.md)
- [本地测试到宝塔上线流程](./docs/部署运维/本地测试到宝塔上线流程.md)
- [部署链路图与发布节点说明](./docs/部署运维/部署链路图与发布节点说明.md)

## 技术栈

- 前端：Vue 3.5、Vite 7、Vue Router、Pinia、Naive UI、Axios、ECharts
- 后端：Spring Boot 3、MyBatis-Plus、Sa-Token、MySQL、Redis、Maven
- 观测：Actuator、Prometheus、自定义前端性能埋点
- 部署：本地构建后部署到 Linux 宝塔，不使用 Docker 作为默认方案

## 环境要求

- Node.js `>=20 <21`
- npm `>=7`
- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.0+

说明：仓库根目录 `package.json` 当前也约束 Node 为 `>=20 <21`。

## 快速开始

### 1. 获取代码

```bash
git clone https://github.com/chenbuh/LearnSphere-AI.git
cd LearnSphere-AI
```

国内网络也可以使用：

```bash
git clone https://gitee.com/yungongfang/learn-sphere-ai.git
cd learn-sphere-ai
```

### 2. 准备后端配置

先准备：

- MySQL 数据库
- Redis 服务
- AI 平台密钥

推荐优先阅读：

- [环境变量与启动说明](./docs/部署运维/环境变量与启动说明.md)
- [backend/README.md](./backend/README.md)

后端敏感配置不要直接写死在源码里。当前推荐两种方式：

1. 使用环境变量注入，例如 `DB_HOST`、`DB_NAME`、`DB_USERNAME`、`DB_PASSWORD`、`AI_API_KEY`。
2. 复制示例文件后本地填写：

```powershell
copy backend\src\main\resources\application-secret.properties.example backend\src\main\resources\application-secret.properties
```

相关配置文件：

- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-prod.yml`
- `backend/src/main/resources/application-secret.properties.example`

### 3. 安装前端依赖

可以直接在仓库根目录安装：

```bash
npm install
```

### 4. 本地启动

先启动后端：

```bash
cd backend
mvn spring-boot:run
```

再分别启动前台和后台：

```bash
npm run dev:frontend
npm run dev:admin
```

常用本地地址：

- 学习者前台：`http://localhost:5173`
- 管理后台：`http://localhost:5174`
- 后端 API：`http://localhost:8080`
- Swagger 文档：`http://localhost:8080/doc.html`

### 5. 移动端真机调试

如果你用 Android 或其他手机浏览器联调，请注意：

- 不要在手机上使用 `localhost` 或 `127.0.0.1`，这只会指向手机自己。
- 应使用电脑的局域网 IP，例如 `http://192.168.1.49:5173` 或 `http://192.168.1.49:8080`。
- 当前开发配置已经允许常见私有网段跨域访问，默认覆盖：`192.168.x.x`、`10.x.x.x`、`172.16.x.x` - `172.31.x.x`。

常见访问方式：

- 前端开发服务：`http://电脑局域网IP:5173`
- 后端静态站点：`http://电脑局域网IP:8080`

如果手机端登录出现 `403 Invalid CORS request`，优先检查是否错误地使用了 `localhost`。

## 构建与发版

### 根目录统一构建入口

当前仓库已经统一了 workspace 命令入口：

```bash
npm run build:frontend
npm run build:admin
npm run build
```

### 前端静态资源输出规则

当前学习者前台 `frontend-vue` 已调整为“构建时直接输出到后端静态目录”：

- 输出目录：`backend/src/main/resources/static`
- 构建命令：`npm run build:frontend`

这意味着学习者前台不再需要手工复制 `dist` 到后端，`vite build` 会直接覆盖用户端静态资源。

管理后台 `admin-vue` 仍然保持独立构建，再通过脚本同步到：

- 目标目录：`backend/src/main/resources/static/admin`
- 推荐命令：`npm run build:admin` 后执行 `npm run sync:admin`

如果你想一次性完成本地发版准备，优先使用：

- `npm run release:local`
- `npm run release:local:admin`

### 后端静态访问说明

后端已经通过 `WebConfig` 配置了静态资源与 SPA 路由回退，核心规则如下：

- `/assets/**` -> `classpath:/static/assets/`
- `/sw.js`、`/registerSW.js`、`/workbox-*.js` -> `classpath:/static/`
- `/admin/**` -> `classpath:/static/admin/`
- 其他前台页面路由 -> 回退到 `classpath:/static/index.html`

因此在后端启动后，可以直接通过以下地址访问构建后的页面：

- 学习者前台：`http://localhost:8080/`
- 管理后台：`http://localhost:8080/admin/`

### 本地发版准备

如果你采用“本地测试完成后再发布到 Linux 宝塔”的流程，推荐直接使用：

```powershell
npm run release:local
npm run release:local:admin
```

这两个入口会串联前端构建、静态资源同步和后端打包。

对应脚本：

- [scripts/本地发版准备.ps1](./scripts/本地发版准备.ps1)

### 后端单独打包

```bash
cd backend
mvn clean package -DskipTests
```

## 语音能力说明

当前项目的语音链路分为 TTS 与 STT 两部分：

- TTS 接口：`/api/tts/edge`
- STT 接口：`/api/tts/stt`

TTS 当前采用”纯 Java + 浏览器原生兜底”的方案：

1. 服务端优先使用 Java 原生 `EdgeTTSClient`
2. 移动端首次点击优先同步触发浏览器原生 TTS，后台再异步预热 Edge 音频缓存

这套设计的目的，是降低部署环境下 Edge 上游握手波动或服务端响应偏慢导致的移动端播放失败。

### 移动端音频播放问题排查

如果你在本地或线上遇到听力无法播放，优先检查：

- 后端是否正常启动
- 当前账号是否已登录
- 部署环境下 `/api/tts/edge` 是否持续报错
- 页面是否运行在会拦截音频自动播放的浏览器环境中
- 移动端是否使用了正确的局域网 IP（不要使用 localhost）

详细排查步骤请参考：[移动端音频播放问题排查指南](./docs/部署运维/移动端音频播放问题排查指南.md)

### 开发环境音频调试

在开发模式下，可以访问音频诊断工具：

```
http://localhost:5173/app/audio-debug
```

或在移动端真机调试时：

```
http://你的电脑局域网IP:5173/app/audio-debug
```

该工具可以帮助你：
- 查看设备信息和浏览器兼容性
- 测试 Edge TTS API 连接
- 测试音频播放器组件
- 测试浏览器原生 TTS
- 查看详细的调试日志

STT 仍依赖后端语音转写能力与相关模型/配置，详细说明可参考：

- [backend/README.md](./backend/README.md)

## 数据库与迁移

当前仓库里已经有多份 SQL 脚本，建议不要凭文件名猜执行顺序。优先参考：

- [数据库初始化与迁移约定](./docs/数据库脚本/数据库初始化与迁移约定.md)

其中已经整理了：

- 根目录迁移脚本用途
- 历史升级脚本位置
- 全新初始化与增量迁移的推荐执行顺序

## 监控与 AI 成本治理

当前项目已经具备基础观测能力：

- 后端 `Actuator + Prometheus`
- 前端 Web Vitals / API 延迟埋点
- AI 请求耗时、失败率、Token、成本指标

可直接参考：

- [观测链路实施](./docs/性能优化/观测链路实施.md)
- [Prometheus 告警规则草案](./docs/性能优化/prometheus-alert-rules.yml)
- [Grafana 看板草案](./docs/性能优化/Grafana看板草案.md)
- [Grafana 导入模板](./docs/性能优化/grafana-dashboard-template.json)
- [AI 成本控制](./docs/AI功能/AI成本控制.md)

## Linux 宝塔部署

这个项目当前更推荐“本地联调完成后，再发布到 Linux 宝塔”的路径。

优先阅读：

- [Linux 服务器宝塔部署文档](./docs/部署运维/Linux服务器宝塔部署文档.md)
- [本地测试到宝塔上线流程](./docs/部署运维/本地测试到宝塔上线流程.md)
- [部署链路图与发布节点说明](./docs/部署运维/部署链路图与发布节点说明.md)
- [本地发版与宝塔上线检查清单](./docs/部署运维/本地发版与宝塔上线检查清单.md)
- [发布产物与回滚说明](./docs/部署运维/发布产物与回滚说明.md)
- [宝塔版本目录与发布记录模板](./docs/部署运维/宝塔版本目录与发布记录模板.md)
- [宝塔后端部署保姆级教程](./docs/部署运维/宝塔后端部署保姆级教程.md)

## 文档索引

如果你不确定某份说明放在哪里，直接从这里开始：

- [docs/README.md](./docs/README.md)

高频文档：

- [项目总览与模块边界](./docs/开发指南/项目总览与模块边界.md)
- [系统模块关系与关键链路](./docs/开发指南/系统模块关系与关键链路.md)
- [关键模块维护地图](./docs/开发指南/关键模块维护地图.md)
- [环境变量与启动说明](./docs/部署运维/环境变量与启动说明.md)
- [数据库初始化与迁移约定](./docs/数据库脚本/数据库初始化与迁移约定.md)
- [本地测试到宝塔上线流程](./docs/部署运维/本地测试到宝塔上线流程.md)
- [部署链路图与发布节点说明](./docs/部署运维/部署链路图与发布节点说明.md)
- [项目优化任务清单](./docs/项目优化任务清单.md)

## 补充说明

- `node_modules` 不属于版本交付内容。
- 当前仓库存在少量历史脚本和旧文档引用，默认以 `docs/` 目录下较新的中文文档为准。
- 如果你刚完成前端修改并准备给后端静态部署，优先执行 `npm run build:frontend`，不要再手工复制用户端 `dist`。
- 如果要继续收口接手文档，下一步更适合补数据库版本登记机制。



