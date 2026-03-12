# LearnSphere AI - 后端服务

基于 Spring Boot 3.x 的智能英语学习平台后端服务。

## 技术栈

- Spring Boot 3.x
- MySQL 8.0+
- Redis 6.0+
- MyBatis-Plus
- Sa-Token
- Maven

## 环境要求

- JDK 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 6.0+

## 推荐使用方式

当前项目更推荐下面这条路径：

1. 本地先完成数据库、Redis、AI 配置
2. 本地完成联调测试
3. 本地通过统一命令完成前端构建、静态资源同步和后端打包
4. 再部署到 Linux 宝塔环境

如果你要看完整部署说明，优先参考：

- [环境变量与启动说明](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E4%B8%8E%E5%90%AF%E5%8A%A8%E8%AF%B4%E6%98%8E.md)
- [本地测试到宝塔上线流程](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E6%9C%AC%E5%9C%B0%E6%B5%8B%E8%AF%95%E5%88%B0%E5%AE%9D%E5%A1%94%E4%B8%8A%E7%BA%BF%E6%B5%81%E7%A8%8B.md)
- [本地发版与宝塔上线检查清单](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E6%9C%AC%E5%9C%B0%E5%8F%91%E7%89%88%E4%B8%8E%E5%AE%9D%E5%A1%94%E4%B8%8A%E7%BA%BF%E6%A3%80%E6%9F%A5%E6%B8%85%E5%8D%95.md)
- [宝塔后端部署保姆级教程](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E5%AE%9D%E5%A1%94%E5%90%8E%E7%AB%AF%E9%83%A8%E7%BD%B2%E4%BF%9D%E5%A7%86%E7%BA%A7%E6%95%99%E7%A8%8B.md)

## 本地快速开始

### 1. 准备依赖

- 启动 MySQL
- 启动 Redis
- 准备 `AI_API_KEY`

### 2. 配置方式

后端配置现已改为优先使用环境变量或 `application-secret.properties` 注入敏感信息。

主配置文件：

- `src/main/resources/application.yml`
- `src/main/resources/application-prod.yml`
- `src/main/resources/application-secret.properties.example`

推荐环境变量示例：

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=learnsphere_ai
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0
AI_API_KEY=your-ai-api-key
AI_MODEL=qwen-turbo
JASYPT_PASSWORD=your-jasypt-password
```

如果需要文件注入，可复制 `src/main/resources/application-secret.properties.example` 为 `application-secret.properties`。

### 3. 本地启动

```bash
mvn spring-boot:run
```

或：

```bash
mvn clean package -DskipTests
java -jar target/learnsphere-ai-0.0.1-SNAPSHOT.jar
```

默认访问地址：

- 应用首页：`http://localhost:8080`
- 管理后台：`http://localhost:8080/admin`
- API：`http://localhost:8080/api`

## 打包说明

如果当前采用前后端合包方式，建议优先使用根目录统一入口：

```powershell
npm run release:local
npm run release:local:admin
```

也可以继续复用以下脚本：

- `deploy.bat`
- `scripts/构建前端应用.ps1`
- `scripts/同步静态资源.ps1`
- `scripts/本地发版准备.ps1`

后端单独打包命令：

```bash
mvn clean package -DskipTests
```

## 部署说明

生产环境不要再把数据库密码、Redis 密码、AI Key 写回源码。

Linux 宝塔部署时建议：

- 使用 JDK 17
- 使用外置 `application-secret.properties` 或环境变量注入敏感配置
- 通过 `--spring.profiles.active=prod` 启动
- 如使用外置配置目录，配合 `--spring.config.additional-location=file:/your-path/config/`
- 用 Nginx 将 `/api/` 转发到 Spring Boot 端口

## 项目结构

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       ├── application-secret.properties.example
│   │       └── mapper/
│   └── test/
└── pom.xml
```

## 说明

本 README 仅保留后端快速启动和部署入口；更具体的本地测试、前端合包和宝塔上线步骤请以 `docs/部署运维` 目录下的最新文档为准。
