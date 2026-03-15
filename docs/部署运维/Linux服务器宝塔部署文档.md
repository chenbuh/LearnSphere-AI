# Linux 服务器宝塔部署文档

本文档面向 LearnSphere AI 在 Linux 服务器上的宝塔面板部署，覆盖从服务器准备、宝塔安装、软件安装、项目打包上传、Java 项目配置、Nginx 反向代理、SSL、验收和回滚的完整流程。

适用范围：

- 操作系统：`CentOS 7/8`、`Rocky Linux 8/9`、`Ubuntu 20.04/22.04`
- 部署方式：本地构建产物后上传到宝塔运行
- 默认方案：前后端合包到 Spring Boot Jar，不使用 Docker

如果你只想看某一部分，可按下面顺序配合阅读：

- [环境变量与启动说明.md](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E4%B8%8E%E5%90%AF%E5%8A%A8%E8%AF%B4%E6%98%8E.md)
- [前端打包与静态资源配置.md](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E5%89%8D%E7%AB%AF%E6%89%93%E5%8C%85%E4%B8%8E%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90%E9%85%8D%E7%BD%AE.md)
- [本地测试到宝塔上线流程.md](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E6%9C%AC%E5%9C%B0%E6%B5%8B%E8%AF%95%E5%88%B0%E5%AE%9D%E5%A1%94%E4%B8%8A%E7%BA%BF%E6%B5%81%E7%A8%8B.md)
- [发布产物与回滚说明.md](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E5%8F%91%E5%B8%83%E4%BA%A7%E7%89%A9%E4%B8%8E%E5%9B%9E%E6%BB%9A%E8%AF%B4%E6%98%8E.md)

## 一、部署架构

当前项目推荐采用下面的结构：

```text
浏览器
  -> Nginx（80/443）
  -> Spring Boot Jar（127.0.0.1:8080）
  -> MySQL 8.0
  -> Redis 6.0
```

说明：

- 用户端前台和管理后台静态资源已经在本地构建时同步进入后端 `src/main/resources/static/` 目录
- 线上只需要运行一个 Spring Boot Jar
- Nginx 负责域名、HTTPS、反向代理和公网入口
- MySQL、Redis 建议直接安装在同一台服务器或内网可达的独立服务器

### 1. 前端合包路径

当前仓库的前端不是单独部署到 Nginx 静态目录，而是先打包到 `dist/`，再同步到后端资源目录：

```text
frontend-vue/dist/*  -> backend/src/main/resources/static/
admin-vue/dist/*     -> backend/src/main/resources/static/admin/
```

最终由 Spring Boot 打成一个 Jar，宝塔线上运行的是这个合包后的 Jar。

### 2. WebConfig 静态访问规则

后端通过 [WebConfig.java](E:\Project\LearnSphere  AI\backend\src\main\java\com\learnsphere\config\WebConfig.java) 支持静态资源访问和 SPA 路由兜底，关键规则如下：

```text
/admin/**   -> classpath:/static/admin/
/assets/**  -> classpath:/static/assets/
/sw.js      -> classpath:/static/
/**         -> classpath:/static/
```

其中：

- `/admin` 和 `/admin/**` 会 fallback 到 `admin/index.html`
- 普通前台路由会 fallback 到 `index.html`
- `/api/**` 不走静态资源处理，仍然交给后端 Controller
- `/assets/**` 使用长期缓存，普通入口页不缓存

因此宝塔部署时不需要再单独上传前端 `dist` 到网站目录，也不需要单独配置一套前端 History 路由规则，核心前提是打包前必须先把 `dist` 同步进后端 `resources/static`。

## 二、部署前准备

### 1. 服务器建议配置

最低建议：

- `2C4G` CPU / 内存
- 系统盘 `40GB` 以上
- 公网带宽 `3Mbps` 以上

生产更稳妥的建议：

- `4C8G` 及以上
- 开启自动快照或云盘备份

### 2. 域名与端口

建议提前准备：

- 主站域名，例如 `learnsphere.example.com`
- 如管理后台需要独立域名，可额外准备 `admin.learnsphere.example.com`

建议放行端口：

- `22` SSH
- `80` HTTP
- `443` HTTPS
- `8888` 宝塔面板，安装后尽快改为自定义安全端口

不建议将以下端口直接暴露公网：

- `8080` Spring Boot
- `3306` MySQL
- `6379` Redis

### 3. 部署目录规划

建议在宝塔服务器上使用如下目录：

```text
/www/wwwroot/learnsphere-backend/
├── app/
│   └── learnsphere-ai-backend-1.0.0.jar
├── config/
│   └── application-secret.properties
├── logs/
└── releases/
```

说明：

- `app/` 存放当前运行的 Jar
- `config/` 存放外置敏感配置
- `logs/` 存放应用日志
- `releases/` 存放历史版本 Jar，便于回滚

## 三、安装宝塔面板

### 1. 登录服务器

```bash
ssh root@your-server-ip
```

### 2. 安装宝塔

请优先使用宝塔官网当前提供的 Linux 安装脚本。安装前确认：

- 新服务器系统时间正确
- 未被安全组或防火墙拦截安装所需网络访问
- 服务器上没有与宝塔默认环境严重冲突的旧版面板

安装完成后记录：

- 宝塔面板访问地址
- 面板账号
- 面板密码
- 安全入口

### 3. 首次安全处理

首次进入宝塔后立即执行：

1. 修改宝塔默认端口
2. 绑定宝塔账号
3. 开启面板 SSL
4. 限制面板登录 IP 或至少启用登录安全验证

## 四、安装运行时软件

在宝塔「软件商店」中安装以下组件：

1. `Nginx`
2. `MySQL 8.0+`
3. `Redis 6.0+`
4. `JDK 17`
5. `Java 项目管理器`
6. `Python 3.10+`，仅在需要本地语音能力时安装

安装后确认：

- `java -version` 输出为 `17`
- MySQL 和 Redis 服务为运行中
- Nginx 能正常重载配置

## 五、数据库与 Redis 初始化

### 1. 创建数据库

在宝塔 MySQL 管理中创建：

- 数据库名：`learnsphere_ai`
- 字符集：`utf8mb4`
- 排序规则：优先选择 `utf8mb4_general_ci` 或服务器默认兼容项

同时创建单独业务账号，不要直接长期使用 `root`。

### 2. 导入数据库

优先参考项目数据库文档：

- [数据库初始化与迁移约定.md](E:/Project/LearnSphere%20%20AI/docs/%E6%95%B0%E6%8D%AE%E5%BA%93%E8%84%9A%E6%9C%AC/%E6%95%B0%E6%8D%AE%E5%BA%93%E5%88%9D%E5%A7%8B%E5%8C%96%E4%B8%8E%E8%BF%81%E7%A7%BB%E7%BA%A6%E5%AE%9A.md)

如果当前为首次全量部署，按仓库提供的初始化脚本执行，不要自行猜测脚本顺序。

### 3. Redis 设置

建议至少确认：

- Redis 服务已启动
- 已设置访问密码，或确认仅本机可访问
- `bind 127.0.0.1`
- 不对公网开放 `6379`

## 六、本地构建发布产物

生产环境推荐在本地完成构建，再上传到服务器。

### 1. 安装依赖

在仓库根目录执行：

```powershell
npm install
```

### 2. 构建前端并打包后端

推荐命令：

```powershell
npm run release:local
```

如果本次包含管理后台：

```powershell
npm run release:local:admin
```

这两个命令会完成：

1. 构建 `frontend-vue`
2. 同步静态资源到 `backend/src/main/resources/static/`
3. 可选构建 `admin-vue`
4. 同步管理后台静态资源到 `backend/src/main/resources/static/admin/`
5. 打包 Spring Boot Jar

对应脚本：

- [scripts/本地发版准备.ps1](E:\Project\LearnSphere  AI\scripts\本地发版准备.ps1)
- [scripts/同步静态资源.ps1](E:\Project\LearnSphere  AI\scripts\同步静态资源.ps1)

`scripts/同步静态资源.ps1` 的实际同步规则是：

```text
frontend-vue/dist/*  -> backend/src/main/resources/static/
admin-vue/dist/*     -> backend/src/main/resources/static/admin/
```

如果只想手动打包后端：

```bash
cd backend
mvn clean package -DskipTests
```

最终重点产物通常为：

```text
backend/target/learnsphere-ai-backend-1.0.0.jar
```

## 七、上传服务器文件

建议上传以下内容到服务器：

- `backend/target/learnsphere-ai-backend-1.0.0.jar`
- `requirements-voice.txt`，仅在启用本地语音时需要

不需要单独上传：

- `frontend-vue/dist`
- `admin-vue/dist`

原因是这两部分静态资源已经在本地打包阶段进入后端 `resources/static`，最终包含在 Jar 内。

建议目录：

```bash
mkdir -p /www/wwwroot/learnsphere-backend/app
mkdir -p /www/wwwroot/learnsphere-backend/config
mkdir -p /www/wwwroot/learnsphere-backend/logs
mkdir -p /www/wwwroot/learnsphere-backend/releases
```

上传后建议保留一份版本化副本：

```text
/www/wwwroot/learnsphere-backend/releases/2026-03-14-learnsphere-ai-backend-1.0.0.jar
```

然后复制到运行目录：

```bash
cp /www/wwwroot/learnsphere-backend/releases/2026-03-14-learnsphere-ai-backend-1.0.0.jar /www/wwwroot/learnsphere-backend/app/learnsphere-ai-backend-1.0.0.jar
```

## 八、准备生产配置

### 1. 推荐方式

生产环境敏感配置优先放在外置文件或环境变量中，不要写回源码。

当前项目生产配置来源：

- `backend/src/main/resources/application-prod.yml`
- 外置 `application-secret.properties`
- 环境变量

### 2. 创建外置配置文件

在服务器创建：

```bash
vi /www/wwwroot/learnsphere-backend/config/application-secret.properties
```

示例内容：

```properties
spring.datasource.username=your-db-username
spring.datasource.password=your-db-password
ai.api-key=your-ai-api-key
# spring.redis.password=your-redis-password
```

### 3. 推荐环境变量

如通过宝塔 Java 项目环境变量或启动参数注入，建议至少提供：

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
CORS_ALLOWED_ORIGINS=https://learnsphere.example.com
JASYPT_PASSWORD=your-jasypt-password
```

如果前台和后台分别使用两个域名，`CORS_ALLOWED_ORIGINS` 用英文逗号分隔多个源。

## 九、宝塔创建 Java 项目

进入「Java 项目管理器」后新增项目，建议填写：

- 项目名称：`learnsphere-backend`
- 运行目录：`/www/wwwroot/learnsphere-backend/app`
- Jar 路径：`/www/wwwroot/learnsphere-backend/app/learnsphere-ai-backend-1.0.0.jar`
- 监听地址：`127.0.0.1`
- 项目端口：`8080`

### 1. JVM 参数

建议起步配置：

```text
-Xms256M -Xmx1024M -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai -DJASYPT_PASSWORD=your-jasypt-password
```

如果服务器内存较大，可按实际情况调整堆大小。

### 2. 程序参数

建议使用：

```text
--spring.profiles.active=prod --spring.config.additional-location=file:/www/wwwroot/learnsphere-backend/config/
```

注意：

- `--spring.config.additional-location` 必须以 `/` 结尾
- 生产环境务必启用 `prod`

### 3. 日志目录

如果宝塔支持日志目录配置，建议指定到：

```text
/www/wwwroot/learnsphere-backend/logs
```

### 4. 首次启动检查

启动后先检查：

- Java 项目状态是否为“运行中”
- 日志中是否有数据库连接失败
- 日志中是否有 Redis 认证失败
- 日志中是否有 `AI_API_KEY` 缺失

## 十、宝塔网站与 Nginx 配置

### 1. 创建站点

在宝塔「网站」中创建站点：

- 域名：`learnsphere.example.com`
- PHP 版本：纯静态或关闭 PHP 即可
- 根目录可使用宝塔默认网站目录，不依赖实际静态文件

说明：

- 当前前端资源由 Spring Boot 提供
- 站点的主要作用是托管域名、SSL 和 Nginx 反向代理

### 2. 反向代理配置

站点配置中增加反向代理或直接写入 Nginx 配置，建议如下：

```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

说明：

- 当前项目首页、管理后台、`/api/` 接口都由同一个 Spring Boot 服务承载
- 首页和 `/admin` 的静态页面来自 Jar 内的 `resources/static`
- 因此前置 Nginx 直接把整个站点流量转发到 `8080` 最简单，也最符合当前仓库结构

### 3. 如果管理后台走二级路径

当前合包方式下，管理后台默认访问路径通常为：

```text
https://learnsphere.example.com/admin
```

不需要单独再建第二个 Java 服务。

## 十一、SSL 与安全设置

### 1. 申请 SSL

在宝塔站点的 SSL 配置中申请证书并开启强制 HTTPS。

### 2. 生产安全建议

至少执行：

1. 将 Spring Boot 仅监听 `127.0.0.1:8080`
2. 不开放 `8080`、`3306`、`6379` 到公网
3. 数据库和 Redis 使用强密码
4. 宝塔面板修改默认端口并启用访问限制
5. `application-secret.properties` 权限只给运行用户
6. 定期备份数据库和 Jar 包

### 3. 文件权限建议

例如：

```bash
chmod 600 /www/wwwroot/learnsphere-backend/config/application-secret.properties
```

## 十二、语音能力可选安装

仅当你需要本地语音功能时，再安装相关依赖：

```bash
cd /www/wwwroot/learnsphere-backend
pip3 install -r requirements-voice.txt
```

同时确认生产环境变量：

```env
VOICE_ENGINE_ENABLED=true
VOICE_ENGINE_PYTHON=python3
```

如果暂时不用语音能力，保持默认关闭即可。

## 十三、上线验收

至少按下面顺序检查：

1. 打开首页，确认前台可访问
2. 打开 `/admin`，确认管理后台可访问
3. 执行登录流程，确认鉴权正常
4. 打开一个普通业务列表页，确认接口可返回
5. 检查 AI 相关接口，确认 `AI_API_KEY` 已生效
6. 检查 Redis 相关能力，确认缓存或配额功能正常
7. 检查 Java 项目日志，确认无持续异常堆栈
8. 检查 Nginx 日志，确认没有大量 `502/504`

可用于基础探活的地址：

```text
https://你的域名/api/health/check
```

如果管理了 Actuator，也建议确认健康状态与指标接口权限配置是否符合预期。

## 十四、发布与回滚建议

### 1. 发布建议

每次发版保留一份带日期的 Jar：

```text
/www/wwwroot/learnsphere-backend/releases/2026-03-14-learnsphere-ai-backend-1.0.0.jar
```

发布步骤建议：

1. 上传新 Jar 到 `releases/`
2. 备份当前运行 Jar
3. 用新 Jar 覆盖 `app/` 目录中的运行文件
4. 在宝塔中重启 Java 项目
5. 完成上线验收

### 2. 回滚建议

如果新版本异常：

1. 将上一版 Jar 复制回 `app/`
2. 重启 Java 项目
3. 重新检查首页、`/admin` 和关键接口

回滚文档可继续参考：

- [发布产物与回滚说明.md](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E5%8F%91%E5%B8%83%E4%BA%A7%E7%89%A9%E4%B8%8E%E5%9B%9E%E6%BB%9A%E8%AF%B4%E6%98%8E.md)
- [宝塔版本目录与发布记录模板.md](E:/Project/LearnSphere%20%20AI/docs/%E9%83%A8%E7%BD%B2%E8%BF%90%E7%BB%B4/%E5%AE%9D%E5%A1%94%E7%89%88%E6%9C%AC%E7%9B%AE%E5%BD%95%E4%B8%8E%E5%8F%91%E5%B8%83%E8%AE%B0%E5%BD%95%E6%A8%A1%E6%9D%BF.md)

## 十五、常见问题排查

### 1. 页面打开是 502

优先排查：

- Java 项目是否启动成功
- Nginx 代理目标是否为 `127.0.0.1:8080`
- Spring Boot 是否监听在正确端口

### 2. 首页能打开，但接口报 401 或跨域

优先排查：

- `CORS_ALLOWED_ORIGINS` 是否和正式域名一致
- HTTPS 下 Cookie 的 `secure` 行为是否符合预期
- 登录域名和接口域名是否混用

### 3. 数据库连接失败

优先排查：

- `DB_HOST`、`DB_PORT`、`DB_NAME` 是否正确
- 数据库账号是否有该库权限
- `application-secret.properties` 是否生效

### 4. Redis 连接失败

优先排查：

- Redis 是否启动
- 密码是否一致
- 是否只允许本机访问但应用连接了错误地址

### 5. 配置没生效

优先排查：

- 是否启用了 `--spring.profiles.active=prod`
- `--spring.config.additional-location` 是否正确且以 `/` 结尾
- `JASYPT_PASSWORD` 是否已传入 JVM 参数或环境变量

## 十六、推荐的最简上线路径

如果你是第一次部署，直接按下面流程执行即可：

1. 安装宝塔、Nginx、MySQL、Redis、JDK 17、Java 项目管理器
2. 在本地执行 `npm run release:local:admin`
3. 上传 `backend/target/learnsphere-ai-backend-1.0.0.jar`
4. 在服务器创建 `config/application-secret.properties`
5. 在宝塔 Java 项目管理器中配置 Jar、JVM 参数和程序参数
6. 创建站点并将域名全部代理到 `127.0.0.1:8080`
7. 申请 SSL，开启 HTTPS
8. 按验收清单逐项检查

说明：当前仓库的实际部署重心不在“把前端拆成独立 Nginx 静态站点”，而是在“本地构建后把前后端合包进一个 Spring Boot Jar”，这也是本项目在宝塔上的默认落地方式。

