# LearnSphere AI - 后端服务

基于 Spring Boot 3.0.5 的智能英语学习平台后端服务

## 📋 技术栈

- **核心框架**: Spring Boot 3.0.5
- **数据库**: MySQL 8.0 + Redis 6.0+
- **ORM框架**: MyBatis-Plus 3.5.3.1
- **认证授权**: Sa-Token 1.37.0
- **工具库**: Lombok + Hutool 5.8.25

## 🚀 快速开始

### 环境要求

- JDK 17+
- Maven 3.8.0+
- MySQL 8.0+
- Redis 6.0+

### 安装步骤

1. **配置数据库**

```bash
# 登录MySQL
mysql -u root -p

# 执行数据库初始化脚本
source src/main/resources/schema.sql
```

2. **配置Redis**

```bash
# 启动Redis服务
redis-server
```

3. **修改配置文件**

编辑 `src/main/resources/application.yml`，修改数据库和Redis连接信息

4. **编译打包**

```bash
# 清理并打包
mvn clean package -DskipTests

# 或者只编译
mvn clean install
```

5. **启动应用**

```bash
# 方式一：使用Maven启动
mvn spring-boot:run

# 方式二：运行jar包
java -jar target/learnsphere-ai-backend-1.0.0.jar
```

6. **访问测试**

应用启动后，访问: `http://localhost:8080`

## 📁 项目结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── learnsphere/
│   │   │           ├── LearnSphereApplication.java  # 启动类
│   │   │           ├── config/                       # 配置类
│   │   │           │   ├── MybatisPlusConfig.java
│   │   │           │   ├── SaTokenConfig.java
│   │   │           │   └── CorsConfig.java
│   │   │           ├── controller/                   # 控制器
│   │   │           │   └── AuthController.java
│   │   │           ├── service/                      # 服务层
│   │   │           │   ├── IUserService.java
│   │   │           │   └── impl/
│   │   │           │       └── UserServiceImpl.java
│   │   │           ├── mapper/                       # 数据访问层
│   │   │           │   └── UserMapper.java
│   │   │           ├── entity/                       # 实体类
│   │   │           │   └── User.java
│   │   │           ├── dto/                          # 数据传输对象
│   │   │           │   ├── LoginDTO.java
│   │   │           │   └── RegisterDTO.java
│   │   │           ├── common/                       # 公共类
│   │   │           │   ├── Result.java
│   │   │           │   └── PageResult.java
│   │   │           ├── exception/                    # 异常处理
│   │   │           │   ├── BusinessException.java
│   │   │           │   └── GlobalExceptionHandler.java
│   │   │           └── utils/                        # 工具类
│   │   └── resources/
│   │       ├── application.yml                       # 主配置文件
│   │       ├── application-dev.yml                   # 开发环境配置
│   │       ├── application-prod.yml                  # 生产环境配置
│   │       ├── schema.sql                            # 数据库初始化脚本
│   │       └── mapper/                               # MyBatis XML
│   └── test/                                         # 测试代码
└── pom.xml                                           # Maven配置
```

## 🔌 API接口

### 认证相关

- **POST** `/api/auth/login` - 用户登录
- **POST** `/api/auth/register` - 用户注册
- **POST** `/api/auth/logout` - 用户登出
- **GET** `/api/auth/info` - 获取当前用户信息
- **GET** `/api/auth/check` - 检查登录状态

### 测试账号

- 用户名: `admin` / 密码: `123456`
- 用户名: `test` / 密码: `123456`

## 🔧 配置说明

### 数据库配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/learnsphere_ai
    username: root
    password: chen20040209
```

### Redis配置

```yaml
spring:
  redis:
    host: localhost
    port: 6379
    password: 
```

### Sa-Token配置

```yaml
sa-token:
  token-name: satoken
  timeout: 2592000  # 30天
  is-concurrent: true
```

## 📝 开发规范

- 遵循阿里巴巴Java开发手册
- 使用Lombok简化代码
- 统一使用Result返回数据
- 统一异常处理
- 使用MyBatis-Plus简化CRUD操作

## 📖 相关文档

- [完整开发文档](../docs/DEVELOPMENT.md)
- [后端详细文档](../docs/BACKEND.md)
- [API接口文档](../docs/API.md)
- [部署文档](../docs/DEPLOYMENT.md)

## 📄 许可证

MIT License
