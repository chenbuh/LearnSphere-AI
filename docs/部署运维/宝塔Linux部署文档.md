# LearnSphere AI 宝塔 Linux 部署文档

本文档基于当前仓库配置编写，适用于在 Linux 服务器的宝塔面板中部署：

- 用户端前端：`frontend-vue`
- 管理端前端：`admin-vue`（当前构建基路径为 `/admin/`）
- 后端服务：`backend`（Spring Boot 3 + JDK 17）

## 1. 目标架构

建议使用一个域名，路径拆分：

- `/` -> 用户端前端
- `/admin/` -> 管理端前端
- `/api/*` -> 转发到后端 `127.0.0.1:8080`

这样不需要改前端生产环境 `VITE_API_URL=/api` 的默认配置。

## 2. 服务器准备

在宝塔软件商店安装并确认可用：

- Nginx（1.22+）
- MySQL（8.0+）
- Redis（6.0+）
- Java 项目管理器 + JDK 17
- Python 3（如需语音功能）

建议目录规划：

```text
/www/wwwroot/learnsphere-web                 # 前端站点根目录
/www/wwwroot/learnsphere-backend             # 后端目录
/www/wwwroot/learnsphere-backend/config      # 后端外置配置
```

## 3. 本地打包

在本地仓库根目录执行：

```bash
# 1) 后端
cd backend
mvn clean package -DskipTests

# 2) 用户端
cd ../frontend-vue
npm install
npm run build

# 3) 管理端
cd ../admin-vue
npm install
npm run build
```

产物说明：

- 后端 Jar：`backend/target/learnsphere-ai-backend-1.0.0.jar`
- 用户端静态文件：`frontend-vue/dist/*`
- 管理端静态文件：`admin-vue/dist/*`

## 4. 上传文件到服务器

上传并摆放文件：

1. 上传后端 Jar 到：`/www/wwwroot/learnsphere-backend/`
2. 上传用户端 `dist` 内容到：`/www/wwwroot/learnsphere-web/`
3. 上传管理端 `dist` 内容到：`/www/wwwroot/learnsphere-web/admin/`
4. （可选）若启用语音服务，上传：
   - `backend/edge_tts_server.py`
   - `backend/requirements-voice.txt`

说明：管理端当前 `base=/admin/`，必须放在站点根目录下的 `admin` 子目录。

## 5. 数据库与 Redis

### 5.1 创建数据库

- 数据库名建议：`learnsphere_ai`
- 字符集：`utf8mb4`
- 排序规则：`utf8mb4_general_ci` 或 `utf8mb4_unicode_ci`

### 5.2 导入 SQL

至少导入：

- `backend/src/main/resources/schema.sql`

如项目有增量脚本，再按实际版本补充导入根目录 `migration_*.sql`。

### 5.3 Redis

确保 Redis 在本机可用（默认 `127.0.0.1:6379`）。

## 6. 后端外置配置（重点）

在服务器创建文件：

`/www/wwwroot/learnsphere-backend/config/application-secret.properties`

示例（可先用明文，稳定后再改 ENC）：

```properties
spring.datasource.username=你的数据库用户名
spring.datasource.password=你的数据库密码

ai.api-key=你的阿里云百炼API Key
ai.model=qwen-turbo
```

如使用加密值，格式如下：

```properties
spring.datasource.password=ENC(你的密文)
ai.api-key=ENC(你的密文)
```

注意：

- 使用 `ENC(...)` 时，必须在启动参数中提供同一把密钥 `JASYPT_PASSWORD`。
- 当前项目已统一为 `PBEWithMD5AndDES` 兼容配置，密钥不一致会导致启动失败。

## 7. 宝塔中创建 Java 项目

在「Java项目管理器」添加 Spring Boot 项目：

- Jar 路径：`/www/wwwroot/learnsphere-backend/learnsphere-ai-backend-1.0.0.jar`
- 运行端口：`8080`
- JDK：`17`
- 工作目录：`/www/wwwroot/learnsphere-backend`

启动参数（程序参数）建议：

```text
--spring.profiles.active=prod --spring.config.additional-location=file:/www/wwwroot/learnsphere-backend/config/
```

JVM 参数建议：

```text
-Xms512m -Xmx2048m -Dfile.encoding=UTF-8 -DJASYPT_PASSWORD=请替换为你的解密密钥
```

如果你暂时不需要语音能力，可追加：

```text
-Dvoice-engine.enabled=false
```

## 8. 宝塔站点 Nginx 配置

在宝塔网站中配置你的站点（把 `example.com` 换成你的域名）：

```nginx
server {
    listen 80;
    server_name example.com;
    root /www/wwwroot/learnsphere-web;
    index index.html;
    charset utf-8;

    # 后端 API 反向代理
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 管理端（Vue Router history）
    location ^~ /admin/ {
        try_files $uri $uri/ /admin/index.html;
    }

    # 用户端（Vue Router history）
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

保存后重载 Nginx。

## 9. 首次验收清单

按顺序检查：

1. 宝塔 Java 项目状态为「运行中」
2. `http://127.0.0.1:8080/api/health/check` 在服务器可返回成功
3. 访问 `https://你的域名/` 可打开用户端
4. 访问 `https://你的域名/admin/` 可打开管理端
5. 前端操作接口不再出现跨域错误

## 10. 常见问题

### 10.1 启动报错：`Failed to bind properties under 'spring.datasource.password'`

排查顺序：

1. `application-secret.properties` 是否被正确加载（路径和参数）
2. `spring.datasource.password` 是否写错（包含多余空格、不可见字符）
3. 若是 `ENC(...)`，`JASYPT_PASSWORD` 是否正确

### 10.2 打开 `/admin/` 404 或空白

确认两点：

1. 管理端 `dist` 已放到 `/www/wwwroot/learnsphere-web/admin/`
2. Nginx 有 `location ^~ /admin/ { try_files ... /admin/index.html; }`

### 10.3 接口 502

通常是后端未启动或端口不一致。检查：

- Java 项目日志
- Nginx `proxy_pass` 端口是否为 `8080`

## 11. 编码与中文不乱码建议

为避免配置文件和日志中文乱码：

- 所有配置文件统一使用 UTF-8（无 BOM）
- Java 启动参数保留 `-Dfile.encoding=UTF-8`
- Nginx 配置 `charset utf-8;`
- 使用宝塔文件编辑器时确认保存编码为 UTF-8

---

如果你需要，我可以继续给你补一份「同域名 + HTTPS + 自动续签证书 + 防火墙端口」的最小安全配置清单。
