# 🔧 LearnSphere AI - 调试指南

## 当前问题分析

### 问题现象
- 后端注册接口正常工作
- 登录接口返回500系统异常
- 健康检查接口也返回500异常

### 可能原因

1. **数据库连接问题**
   - MySQL服务未启动
   - 数据库不存在
   - 连接参数错误

2. **依赖问题**
   - MyBatis-Plus配置问题
   - Sa-Token配置问题
   - Redis连接问题

3. **代码问题**
   - 实体类映射问题
   - 服务层注入问题

## 调试步骤

### 1. 检查数据库

```sql
-- 检查数据库是否存在
SHOW DATABASES LIKE 'learnsphere_ai';

-- 检查用户表是否存在
USE learnsphere_ai;
SHOW TABLES;

-- 检查用户表结构
DESC user;

-- 查看已注册的用户
SELECT * FROM user;
```

### 2. 检查后端日志

在IDEA控制台查看详细错误信息，特别关注：
- 数据库连接错误
- Bean注入错误
- SQL执行错误

### 3. 检查配置文件

确认 `application.yml` 中的配置：
- 数据库URL、用户名、密码
- Redis连接配置
- MyBatis-Plus配置

### 4. 临时解决方案

如果数据库有问题，可以先使用内存数据库H2进行测试：

```yaml
spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:mem:testdb
    username: sa
    password: 
  h2:
    console:
      enabled: true
```

### 5. 前端测试

访问前端API测试页面：
```
http://localhost:3000/api-test
```

## 常见错误解决

### 错误1：数据库连接失败
```
解决方案：
1. 启动MySQL服务
2. 创建数据库：CREATE DATABASE learnsphere_ai;
3. 执行初始化脚本：backend/src/main/resources/sql/init.sql
```

### 错误2：Redis连接失败
```
解决方案：
1. 启动Redis服务
2. 或者临时禁用Redis（注释Sa-Token Redis配置）
```

### 错误3：端口冲突
```
解决方案：
1. 检查8080端口是否被占用
2. 修改application.yml中的端口配置
```

## 测试API接口

### 使用PowerShell测试

```powershell
# 健康检查
Invoke-WebRequest -Uri "http://localhost:8080/api/health/check" -UseBasicParsing

# 注册用户
$body = @{username="test";password="123456";email="test@test.com"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# 登录用户
$body = @{username="test";password="123456"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### 使用前端测试页面

1. 启动前端项目：`npm run dev`
2. 访问：`http://localhost:3000/api-test`
3. 依次测试各个接口

## 数据库初始化

如果数据库表不存在，请执行以下SQL：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS learnsphere_ai DEFAULT CHARACTER SET utf8mb4;

-- 使用数据库
USE learnsphere_ai;

-- 创建用户表
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100),
  `nickname` VARCHAR(50),
  `status` TINYINT DEFAULT 1,
  `deleted` TINYINT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 下一步计划

1. **解决登录问题** - 修复系统异常
2. **完善API接口** - 实现词汇、语法等功能
3. **前端集成** - 更新前端使用真实API
4. **数据初始化** - 导入词汇数据
5. **功能测试** - 完整的前后端联调

## 联系方式

如果遇到问题，请检查：
1. IDEA控制台的详细错误日志
2. MySQL和Redis服务状态
3. 网络连接和端口占用情况