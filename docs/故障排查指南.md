# 🚨 LearnSphere AI - 故障排除指南

## 当前问题：后端500内部服务器错误

### 问题现象
- 所有后端API接口返回500错误
- 前端无法正常调用后端服务
- 注册接口偶尔能成功，但登录失败

### 调试步骤

#### 第一步：检查后端启动状态

1. **查看IDEA控制台**
   - 检查是否有红色错误信息
   - 查看Spring Boot启动日志
   - 确认端口8080是否正常监听

2. **常见启动错误**
   ```
   ❌ 数据库连接失败
   ❌ Redis连接失败  
   ❌ 端口被占用
   ❌ Bean注入失败
   ❌ 配置文件错误
   ```

#### 第二步：使用简化启动模式

如果正常启动有问题，尝试使用调试模式：

1. **运行DebugApplication**
   - 文件位置：`backend/src/main/java/com/learnsphere/DebugApplication.java`
   - 这个版本排除了数据库和Redis依赖
   - 只测试基础的Spring Boot功能

2. **测试简化接口**
   ```
   GET http://localhost:8080/api/diagnostic/ping
   ```

#### 第三步：前端调试测试

1. **访问调试页面**
   ```
   http://localhost:3000/debug-test
   ```

2. **按顺序测试**
   - Ping测试（最基础）
   - 系统状态检查
   - 原始健康检查

#### 第四步：数据库问题排查

如果简化模式正常，问题可能在数据库：

1. **检查MySQL服务**
   ```bash
   # Windows
   net start mysql
   
   # 或检查服务状态
   services.msc
   ```

2. **创建数据库**
   ```sql
   CREATE DATABASE learnsphere_ai DEFAULT CHARACTER SET utf8mb4;
   ```

3. **测试连接**
   ```bash
   mysql -u root -p -h localhost -P 3306
   ```

#### 第五步：Redis问题排查

1. **检查Redis服务**
   ```bash
   # Windows (如果安装了Redis)
   redis-server
   
   # 或临时禁用Redis
   ```

2. **临时禁用Redis**
   在`application.yml`中注释Redis配置

### 解决方案

#### 方案1：使用调试模式启动

1. 停止当前的LearnSphereApplication
2. 运行DebugApplication
3. 测试基础功能是否正常

#### 方案2：修复数据库连接

1. 确保MySQL服务运行
2. 创建数据库`learnsphere_ai`
3. 执行初始化脚本：`backend/src/main/resources/sql/init.sql`

#### 方案3：使用H2内存数据库（临时）

修改`application.yml`：
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

#### 方案4：完全重启

1. 停止所有服务（前端、后端、数据库）
2. 重启MySQL服务
3. 重新启动后端（使用DebugApplication）
4. 重新启动前端
5. 按顺序测试功能

### 测试检查清单

- [ ] 后端服务启动无错误
- [ ] 端口8080正常监听
- [ ] 基础Ping接口正常
- [ ] 数据库连接正常
- [ ] 前端能访问后端
- [ ] 注册功能正常
- [ ] 登录功能正常

### 常用调试命令

#### PowerShell测试命令
```powershell
# 测试连接
Test-NetConnection -ComputerName localhost -Port 8080

# 简单HTTP测试
Invoke-WebRequest -Uri "http://localhost:8080/api/diagnostic/ping" -UseBasicParsing

# 检查端口占用
netstat -ano | findstr :8080
```

#### 数据库测试命令
```sql
-- 检查数据库
SHOW DATABASES;

-- 检查表
USE learnsphere_ai;
SHOW TABLES;

-- 检查用户数据
SELECT * FROM user LIMIT 5;
```

### 日志分析

#### 关键错误信息
- `Communications link failure` → 数据库连接问题
- `Connection refused` → 服务未启动或端口问题
- `Bean creation failed` → 依赖注入问题
- `Port already in use` → 端口冲突

#### 正常启动日志应包含
```
✅ Started LearnSphereApplication in X.X seconds
✅ Tomcat started on port(s): 8080
✅ HikariPool-1 - Start completed
```

### 联系支持

如果以上步骤都无法解决问题，请提供：

1. **IDEA控制台完整错误日志**
2. **系统环境信息**
   - Java版本
   - MySQL版本
   - 操作系统版本
3. **测试结果截图**
4. **配置文件内容**

---

## 快速解决方案

**最快的解决方案**：
1. 运行`DebugApplication`而不是`LearnSphereApplication`
2. 访问`http://localhost:3000/debug-test`进行测试
3. 如果基础功能正常，再逐步添加数据库配置

这样可以快速确定问题是在基础框架还是在数据库配置上。