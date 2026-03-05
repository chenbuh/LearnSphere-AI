# LearnSphere AI 宝塔面板全栈部署终极指南

本文档位 LearnSphere AI 项目的长效部署手册，整合了后端（Java 17）、语音服务（Python）、用户端前端（Vue 3）及管理端前端（Vue 3）的完整部署流程。

---

## 1. 核心环境要求汇总

在宝塔“软件商店”中，请确保安装并配置好以下环境：

*   **Nginx**: 1.22+ (核心反向代理)
*   **MySQL**: 8.0 (推荐，兼容 5.7)
*   **Redis**: 7.0+ (用于高频数据缓存与配额管理)
*   **JDK 17**: 必须，项目基于 Java 17 运行。可通过“Java项目管理器”安装。
*   **Python 3.9+**: 语音服务（Edge TTS）需要。
*   **Node.js 20+**: 仅用于服务器端构建（如不在本地打包）。

---

## 2. 数据库配置与数据迁移

1.  **创建数据库**:
    *   在宝塔“数据库”面板，新建数据库 `learnsphere_ai`。
    *   设置字符集为 `utf8mb4`。
2.  **导入结构与数据**:
    *   依次导入项目根目录下的 SQL 文件：
        1.  `check_tables.sql` (基础结构)
        2.  `seed_prompts.sql` (初始提示词)
        3.  `migration_*.sql` (按需导入所有更新脚本，确保版本一致)
3.  **校验**:
    *   确保 `system_config` 表中包含必要的 API 密钥 and AI 引擎配置。

---

## 3. 后端发布 (Spring Boot)

### 3.1 本地编译
在本地 `backend` 目录下执行：
```bash
mvn clean package -DskipTests
```
生成：`target/learnsphere-ai-backend-1.0.0.jar`。

### 3.2 宝塔部署
1.  **上传**: 将 JAR 包及目录下的 `requirements-voice.txt` 上传至服务器 `/www/wwwroot/learnsphere/backend/`。
2.  **创建项目**:
    *   **宝塔面板 -> Java项目管理器 -> 添加项目**。
    *   **项目类型**: SpringBoot。
    *   **项目jar路径**: 选择上传的 JAR。
    *   **JDK版本**: 选择 JDK 17。
    *   **端口**: 8080（需与 `application.yml` 一致）。
3.  **环境变量**: 如需覆盖配置，可在“启动参数”添加 `--spring.profiles.active=prod`。

---

## 4. 语音服务 (Python Edge TTS) 部署

语音服务作为后端的一个子模块独立运行。

1.  **安装依赖**:
    进入服务端目录执行：
    ```bash
    pip install -r requirements-voice.txt
    # 若无该文件，手动安装必备库：
    pip install edge-tts flask flask-cors
    ```
2.  **后台运行**:
    建议在宝塔“Python项目管理器”中创建项目，或者使用 `PM2` 守护运行：
    ```bash
    pm2 start edge_tts_server.py --interpreter python3 --name learnsphere-tts
    ```
3.  **连接校验**:
    访问 `http://127.0.0.1:5010/health` 应返回 `{"status": "ok"}`。

---

## 5. 双前端打包与 Nginx 部署

项目包含两个前端，建议通过**双域名**或**多路径**部署。

### 5.1 前端构建 (本地)
```bash
# 用户端
cd frontend-vue && npm install && npm run build
# 管理端
cd admin-vue && npm install && npm run build
```

### 5.2 宝塔站点创建
在宝塔“网站”处创建两个站点（或一个站点下配置两个根目录）：
*   **站点 A (用户端)**: `yungongfang.de5.net`
*   **站点 B (管理端)**: `admin.yungongfang.de5.net`

### 5.3 关键 Nginx 配置文件 (解决跨域与 API 路由)

请根据实际情况修改站点的 Nginx 配置：

```nginx
# --- 用户端 Nginx 配置片段 ---
server {
    listen 80;
    server_name yungongfang.de5.net;
    root /www/wwwroot/learnsphere/frontend;

    # 1. 静态文件路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. 后端 API 反向代理 (统一通过 /api 转发)
    location /api/ {
        proxy_pass http://127.0.0.1:8080/; # 注意末尾的斜杠
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# --- 管理端 Nginx 配置片段 ---
server {
    listen 80;
    server_name admin.yungongfang.de5.net;
    root /www/wwwroot/learnsphere/admin;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 6. 安全增强与运维建议

1.  **SSL 证书**: 强烈建议在宝塔站点设置中开启“SSL -> Let's Encrypt”免费证书，并开启“强制 HTTPS”。
2.  **防火墙**: 
    *   系统防火墙只需开放 **80 (HTTP)** 和 **443 (HTTPS)**。
    *   **禁止外网访问 8080 (后端) 和 5010 (语音)**，这些端口仅供 Nginx 内部反向代理访问。
3.  **自动清理**:
    *   后端已内置 AI 对话清理任务，执行频率见 `application.yml` 中的 `cron` 配置。
    *   定期在宝塔“计划任务”中设置数据库备份。
4.  **日志监控**:
    *   后端日志路径：`/www/wwwroot/learnsphere/backend/logs/`。
    *   查看实时日志：`tail -f spring.log`。

---
*本文档由 Antigravity 整理生成，如有变更请参照项目文档库更新。*
