# LearnSphere AI 宝塔全栈部署手册 (最终版)

本文档凝练了 LearnSphere AI 在宝塔 Linux 面板上的最佳实践，包含数据库权限、语音引擎及 Nginx 配置的调试经验。

## 1. 核心运行环境
- **Java**: JDK 17
- **Database**: MySQL 8.0 (用户: `root`, 数据库: `learnsphere_ai`)
- **Python**: 3.10+ (用于语音合成)
- **Redis**: 6.0+

## 2. 后端部署 (backend)
### 2.1 启动参数配置 (极简版)
由于数据库凭据和 AI Key 已硬编码在 `application-prod.yml` 中，您在宝塔 Java 项目管理器中只需设置：

**程序参数 (Program Arguments):**
```text
--spring.profiles.active=prod
```

> [!TIP]
> 现在您不再需要创建 `/config/application-secret.properties` 文件，也不需要设置任何环境变量。打好 Jar 包直接运行即可。

### 2.2 语音引擎依赖
如果启用语音功能，必须在服务器终端执行：
```bash
apt update && apt install -y python3-pip
cd /www/wwwroot/learnsphere-backend
pip3 install -r requirements-voice.txt
```

## 3. 数据库初始化
建议使用 `learnsphere_ai_production.sql` 脚本进行完整导入。
- **用户名**: `root`
- **默认密码**: `chen20040209`
- **权限**: 确保该用户拥有 `learnsphere_ai` 库的所有操作权限。

## 4. 前端 Nginx 配置
```nginx
server {
    listen 80;
    server_name 你的域名;
    root /www/wwwroot/前端根目录;
    index index.html;
    charset utf-8;

    # 1. 转发后端 API
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 2. 管理端 (Vue History Mode)
    location ^~ /admin/ {
        try_files $uri $uri/ /admin/index.html;
    }

    # 3. 用户端 (Vue History Mode)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 5. 常见问题排查 (Troubleshooting)
- **502 Bad Gateway**: 通常是后端重启过慢或崩了，检查宝塔 Java 项目日志。
- **Access denied for user 'root'**: 说明外置配置文件没有被 `--spring.config.additional-location` 正确加载。检查路径最后是否带了 `/`。
- **音频无法播放**: 检查 Python 依赖是否安装，及 Nginx 是否允许了必要的 MIME 类型。
