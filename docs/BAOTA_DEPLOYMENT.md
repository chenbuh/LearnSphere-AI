# LearnSphere AI 宝塔面板极致部署指南

本文档专为 LearnSphere AI 项目定制，详细说明如何在 Linux 服务器上使用宝塔面板（Baota Panel）进行全栈部署。

## 1. 环境准备

在开始之前，请确保您的服务器已安装宝塔面板，并安装了以下核心软件：

1.  **Nginx**: 1.22 或更高版本
2.  **MySQL**: 8.0 (推荐) 或 5.7
3.  **Redis**: 7.0 或更高版本
4.  **Java 环境**: OpenJDK 17 (必须，项目基于 Java 17)
    *   *在宝塔“软件商店” -> “运行环境”中安装“Java项目管理器”或直接安装 JDK 17。*
5.  **Node.js**: v18+ (用于本地构建，或在服务器如果需要)

## 2. 数据库部署 (已确认信息)

1.  **创建数据库**:
    *   登录宝塔 -> **数据库** -> **添加数据库**。
    *   数据库名: `learnsphere_ai`
    *   用户名: `learnsphere`
    *   密码: `chen20040209`
    *   访问权限: 本地服务器 (127.0.0.1)

2.  **导入数据**: (略)

## 3. 后端部署 (Spring Boot)

### 3.1 生产环境配置
修改 `backend/src/main/resources/application.properties` (项目当前使用的配置文件)。

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/learnsphere_ai?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
spring.datasource.username=learnsphere
spring.datasource.password=chen20040209

# Domain Configuration (已针对多子域名修复跨域)
sa-token.cookie.domain=yungongfang.de5.net
sa-token.cookie.same-site=None
sa-token.cookie.http-only=true
```

### 3.2 打包项目
1. 在本地 `backend` 目录执行 `mvn clean package`。
2. 生成 `learnsphere-ai-backend-1.0.0.jar`。

### 3.3 宝塔面板运行 Java 项目
1.  **上传**: 将生成的 JAR 包上传到服务器目录，例如 `/www/wwwroot/learnsphere/backend/`。
2.  **创建项目**:
    *   进入宝塔 -> **Java项目管理器** -> **添加Java项目**。
    *   项目类型: `SpringBoot`。
    *   项目jar路径: 选择上传的 JAR 文件。
    *   **JDK版本**: 务必选择 **JDK 17**。
    *   项目端口: `8080` (确保与后端配置一致)。
3.  **运行参数**:
    *   如果需要在外部放配置文件，启动参数中可以加入 `-Dspring.config.location=/路径/application.properties`。
4.  **状态检查**: 提交后确保状态为“运行中”，点击“日志”查看是否有报错。

## 4. 前端部署

### 4.1 用户端 (yungongfang.de5.net)
1. 编译 `frontend-vue` (运行 `npm run build`)。
2. 将 `dist` 目录内容上传至宝塔网站根目录。

### 4.2 管理端 (admin.yungongfang.de5.net)
1. 编译 `admin-vue` (运行 `npm run build`)。
2. 将 `dist` 目录内容上传至管理系统对应的宝塔站点目录。

## 5. Nginx 站点配置 (核心)

根据您的域名规划，需要在宝塔创建**两个**站点。

### 5.1 用户端站点 (yungongfang.de5.net)
```nginx
server {
    listen 80;
    server_name yungongfang.de5.net;
    
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /www/wwwroot/yungongfang.de5.net;
        try_files $uri $uri/ /index.html;
    }
}
```

### 5.2 管理端站点 (admin.yungongfang.de5.net)
```nginx
server {
    listen 80;
    server_name admin.yungongfang.de5.net;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/; # 注意：管理端请求也指向同一个后端
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /www/wwwroot/admin.yungongfang.de5.net;
        try_files $uri $uri/ /index.html;
    }
}

### 5.3 反向代理 (Reverse Proxy) 说明
在上述 Nginx 配置中，`location /api/` 块即为**反向代理**：
*   所有发往 `你的域名/api/...` 的请求都会被 Nginx 拦截。
*   Nginx 将请求转发给本地运行在 `8080` 端口的 Java 程序。
*   这样做的好处是：前端访问后端不再产生跨域问题（CORS），且不需要对外开放 8080 端口，提高了安全性。
```

## 6. 常见问题排查

1.  **刷新页面 404**:
    *   检查 Nginx 配置中的 `try_files $uri $uri/ /index.html;` 是否存在，不仅是根目录，`/admin` 路径下也需要对应的 fallback 配置。

2.  **API 请求 502 Bad Gateway**:
    *   后端服务未启动：检查 Java 项目运行状态和日志。
    *   端口不一致：确认 `proxy_pass` 的端口与这 Spring Boot `application.yml` 中的 `server.port` 一致。

3.  **跨域 (CORS) 错误**:
    *   尽管 Nginx 做了反向代理，但后端可能仍需配置 CORS。
    *   在生产环境通常通过 Nginx 统一转发 `/api`，前端请求 `/api` 此时属于同源，**不需要**后端开启 CORS。如果不经过 Nginx 转发直接请求后端端口，则必须在后端 `WebConfig` 中配置 `registry.addMapping("/**").allowedOrigins("*")`。

4.  **Java 版本错误**:
    *   报错 `List.of` method not found 或 `Record` not found，说明服务器使用的不是 JDK 17+。请务必在宝塔 Java 项目管理器中选择正确的 JDK 版本。

## 7. 安全建议

*   **防火墙**: 仅开放 80/443 端口，关闭 8080 (后端端口)，只允许 Nginx 内部反代访问。
*   **SSL**: 建议在宝塔“SSL”选项卡中申请免费 Let's Encrypt 证书，开启 HTTPS 强制跳转。
