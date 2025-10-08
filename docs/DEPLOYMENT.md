# 🚢 LearnSphere AI - 部署文档

> 生产环境部署完整指南

## 📑 目录

- [服务器要求](#服务器要求)
- [环境准备](#环境准备)
- [数据库部署](#数据库部署)
- [Redis部署](#redis部署)
- [后端部署](#后端部署)
- [前端部署](#前端部署)
- [Nginx配置](#nginx配置)
- [Docker部署](#docker部署)
- [监控运维](#监控运维)

---

## 服务器要求

### 硬件配置

**最低配置**
- CPU: 2核
- 内存: 4GB
- 硬盘: 50GB
- 带宽: 5Mbps

**推荐配置**
- CPU: 4核
- 内存: 8GB
- 硬盘: 100GB SSD
- 带宽: 10Mbps

### 操作系统

- Ubuntu 20.04 LTS（推荐）
- CentOS 7/8
- Debian 10+

---

## 环境准备

### 1. 安装JDK 17

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-17-jdk -y

# CentOS
sudo yum install java-17-openjdk-devel -y

# 验证安装
java -version
```

### 2. 安装Maven

```bash
# 下载Maven
wget https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz

# 解压
tar -xzf apache-maven-3.9.6-bin.tar.gz
sudo mv apache-maven-3.9.6 /opt/maven

# 配置环境变量
echo 'export MAVEN_HOME=/opt/maven' >> ~/.bashrc
echo 'export PATH=$MAVEN_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 验证安装
mvn -version
```

### 3. 安装Node.js

```bash
# 使用NodeSource安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

### 4. 安装Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y

# 启动Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 数据库部署

### 安装MySQL 8.0

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server -y

# CentOS
sudo yum install mysql-server -y

# 启动MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

### 创建数据库

```bash
# 登录MySQL
mysql -u root -p

# 执行以下SQL
```

```sql
-- 创建数据库
CREATE DATABASE learnsphere_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'learnsphere'@'localhost' IDENTIFIED BY 'chen20040209';

-- 授权
GRANT ALL PRIVILEGES ON learnsphere_ai.* TO 'learnsphere'@'localhost';
FLUSH PRIVILEGES;

-- 使用数据库
USE learnsphere_ai;
```

### 导入数据库表结构

```bash
# 导入SQL文件
mysql -u learnsphere -p learnsphere_ai < /path/to/schema.sql
```

---

## Redis部署

### 安装Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server -y

# CentOS
sudo yum install redis -y

# 启动Redis
sudo systemctl start redis
sudo systemctl enable redis

# 验证安装
redis-cli ping
```

### 配置Redis

```bash
# 编辑配置文件
sudo nano /etc/redis/redis.conf

# 修改以下配置
bind 127.0.0.1
port 6379
requirepass your_redis_password
maxmemory 256mb
maxmemory-policy allkeys-lru

# 重启Redis
sudo systemctl restart redis
```

---

## 后端部署

### 1. 上传代码

```bash
# 在服务器上创建目录
mkdir -p /opt/learnsphere/backend
cd /opt/learnsphere/backend

# 使用git克隆代码
git clone https://github.com/learnsphere/learnsphere-ai.git .

# 或使用scp上传代码
scp -r /local/path/backend user@server:/opt/learnsphere/
```

### 2. 配置application.yml

```bash
# 编辑生产环境配置
nano src/main/resources/application-prod.yml
```

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/learnsphere_ai?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: learnsphere
    password: chen20040209
  
  redis:
    host: localhost
    port: 6379
    password: your_redis_password

server:
  port: 8080
```

### 3. 编译打包

```bash
# 清理并打包
mvn clean package -DskipTests

# 打包后的jar文件位于
# target/learnsphere-ai-backend-1.0.0.jar
```

### 4. 创建启动脚本

```bash
# 创建启动脚本
nano /opt/learnsphere/backend/start.sh
```

```bash
#!/bin/bash
APP_NAME=learnsphere-ai-backend
JAR_FILE=/opt/learnsphere/backend/target/${APP_NAME}-1.0.0.jar
LOG_FILE=/opt/learnsphere/logs/backend.log

# 创建日志目录
mkdir -p /opt/learnsphere/logs

# 启动应用
nohup java -jar \
  -Xms512m \
  -Xmx1024m \
  -Dspring.profiles.active=prod \
  ${JAR_FILE} \
  > ${LOG_FILE} 2>&1 &

echo "应用启动成功，PID: $!"
```

```bash
# 赋予执行权限
chmod +x /opt/learnsphere/backend/start.sh
```

### 5. 创建停止脚本

```bash
nano /opt/learnsphere/backend/stop.sh
```

```bash
#!/bin/bash
APP_NAME=learnsphere-ai-backend

# 查找进程ID
PID=$(ps -ef | grep ${APP_NAME} | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
  echo "应用未运行"
else
  kill -9 $PID
  echo "应用已停止，PID: $PID"
fi
```

```bash
chmod +x /opt/learnsphere/backend/stop.sh
```

### 6. 创建systemd服务

```bash
sudo nano /etc/systemd/system/learnsphere-backend.service
```

```ini
[Unit]
Description=LearnSphere AI Backend Service
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/learnsphere/backend
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m -Dspring.profiles.active=prod /opt/learnsphere/backend/target/learnsphere-ai-backend-1.0.0.jar
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 重载systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start learnsphere-backend

# 设置开机自启
sudo systemctl enable learnsphere-backend

# 查看状态
sudo systemctl status learnsphere-backend
```

---

## 前端部署

### 1. 上传代码

```bash
mkdir -p /opt/learnsphere/frontend
cd /opt/learnsphere/frontend

# 克隆或上传代码
git clone https://github.com/learnsphere/learnsphere-ai.git .
cd frontend-vue
```

### 2. 配置环境变量

```bash
# 创建生产环境配置
nano .env.production
```

```bash
VITE_API_BASE_URL=https://api.learnsphere.ai
VITE_APP_TITLE=LearnSphere AI
```

### 3. 构建项目

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建后的文件在 dist 目录
```

### 4. 部署到Nginx

```bash
# 复制构建文件到Nginx目录
sudo mkdir -p /var/www/learnsphere
sudo cp -r dist/* /var/www/learnsphere/

# 设置权限
sudo chown -R www-data:www-data /var/www/learnsphere
sudo chmod -R 755 /var/www/learnsphere
```

---

## Nginx配置

### 配置文件

```bash
sudo nano /etc/nginx/sites-available/learnsphere
```

```nginx
# HTTP服务器配置
server {
    listen 80;
    server_name learnsphere.ai www.learnsphere.ai;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS服务器配置
server {
    listen 443 ssl http2;
    server_name learnsphere.ai www.learnsphere.ai;
    
    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/learnsphere.ai.crt;
    ssl_certificate_key /etc/nginx/ssl/learnsphere.ai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 前端静态文件
    root /var/www/learnsphere;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # 前端路由配置
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/learnsphere /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### SSL证书配置（Let's Encrypt）

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取SSL证书
sudo certbot --nginx -d learnsphere.ai -d www.learnsphere.ai

# 自动续期
sudo certbot renew --dry-run
```

---

## Docker部署

### 1. 安装Docker

```bash
# 安装Docker
curl -fsSL https://get.docker.com | sh

# 启动Docker
sudo systemctl start docker
sudo systemctl enable docker

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 创建Dockerfile

**后端Dockerfile**
```dockerfile
# backend/Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/learnsphere-ai-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Xms512m", "-Xmx1024m", "-Dspring.profiles.active=prod", "app.jar"]
```

**前端Dockerfile**
```dockerfile
# frontend-vue/Dockerfile
FROM node:18-alpine as build
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

### 3. 创建docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: learnsphere-mysql
    environment:
      MYSQL_ROOT_PASSWORD: chen20040209
      MYSQL_DATABASE: learnsphere_ai
      MYSQL_USER: learnsphere
      MYSQL_PASSWORD: chen20040209
    volumes:
      - mysql-data:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    networks:
      - learnsphere-network

  redis:
    image: redis:7-alpine
    container_name: learnsphere-redis
    command: redis-server --requirepass your_redis_password
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - learnsphere-network

  backend:
    build: ./backend
    container_name: learnsphere-backend
    depends_on:
      - mysql
      - redis
    environment:
      SPRING_PROFILES_ACTIVE: prod
    ports:
      - "8080:8080"
    networks:
      - learnsphere-network

  frontend:
    build: ./frontend-vue
    container_name: learnsphere-frontend
    depends_on:
      - backend
    ports:
      - "80:80"
      - "443:443"
    networks:
      - learnsphere-network

volumes:
  mysql-data:
  redis-data:

networks:
  learnsphere-network:
    driver: bridge
```

### 4. 启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 监控运维

### 日志管理

```bash
# 查看后端日志
tail -f /opt/learnsphere/logs/backend.log

# 查看Nginx访问日志
tail -f /var/log/nginx/access.log

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log
```

### 性能监控

```bash
# 查看系统资源
htop

# 查看Java进程
jps -l

# 查看Java内存使用
jmap -heap <pid>
```

### 数据库备份

```bash
# 创建备份脚本
nano /opt/learnsphere/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR=/opt/learnsphere/backups
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME=learnsphere_ai
DB_USER=learnsphere
DB_PASS=chen20040209

# 创建备份目录
mkdir -p ${BACKUP_DIR}

# 备份数据库
mysqldump -u${DB_USER} -p${DB_PASS} ${DB_NAME} > ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql

# 压缩备份文件
gzip ${BACKUP_DIR}/${DB_NAME}_${DATE}.sql

# 删除7天前的备份
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: ${DB_NAME}_${DATE}.sql.gz"
```

```bash
# 设置定时任务
crontab -e

# 每天凌晨2点执行备份
0 2 * * * /opt/learnsphere/scripts/backup.sh
```

---

## 常见问题

### 1. 后端启动失败

```bash
# 检查日志
tail -f /opt/learnsphere/logs/backend.log

# 检查端口占用
netstat -tlnp | grep 8080

# 检查数据库连接
mysql -u learnsphere -p learnsphere_ai
```

### 2. 前端访问404

```bash
# 检查Nginx配置
sudo nginx -t

# 检查文件权限
ls -la /var/www/learnsphere

# 重启Nginx
sudo systemctl restart nginx
```

### 3. 数据库连接失败

```bash
# 检查MySQL状态
sudo systemctl status mysql

# 检查防火墙
sudo ufw status

# 测试连接
mysql -h localhost -u learnsphere -p
```

---

**最后更新时间**: 2026-01-09
