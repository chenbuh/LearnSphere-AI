# 🔗 LearnSphere AI - 前后端联调指南

## 当前状态

✅ **已完成**：
- 后端项目结构搭建
- 前端Vue3项目搭建
- API接口文档编写
- 密码加盐加密实现
- 前端API工具类创建
- 用户状态管理更新

❌ **待解决**：
- 后端系统异常（500错误）
- 数据库连接问题
- API接口无法正常响应

## 问题诊断

### 1. 后端问题排查

**检查项目启动日志**：
在IDEA控制台查看启动日志，重点关注：
```
- 数据库连接是否成功
- Spring Boot启动是否完整
- 端口8080是否正常监听
- Bean注入是否有错误
```

**常见启动错误**：
1. **数据库连接失败**
   ```
   Error: Communications link failure
   ```
   解决：启动MySQL，创建数据库`learnsphere_ai`

2. **Redis连接失败**
   ```
   Error: Unable to connect to Redis
   ```
   解决：启动Redis或临时禁用Redis配置

3. **端口占用**
   ```
   Error: Port 8080 was already in use
   ```
   解决：修改端口或关闭占用进程

### 2. 数据库初始化

**步骤1：创建数据库**
```sql
CREATE DATABASE learnsphere_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**步骤2：执行初始化脚本**
```sql
-- 运行 backend/src/main/resources/sql/init.sql
```

**步骤3：验证表结构**
```sql
USE learnsphere_ai;
SHOW TABLES;
DESC user;
```

## 前端API集成

### 1. API工具类

已创建的文件：
- `frontend-vue/src/utils/request.js` - Axios封装
- `frontend-vue/src/api/auth.js` - 认证API
- `frontend-vue/src/api/vocabulary.js` - 词汇API

### 2. 状态管理

已更新：
- `frontend-vue/src/stores/user.js` - 用户状态管理，集成真实API

### 3. 测试页面

已创建：
- `frontend-vue/src/views/ApiTest.vue` - API测试页面
- 路由：`/api-test`

## 联调测试步骤

### 第一阶段：基础连通性测试

1. **启动后端服务**
   ```bash
   # 在IDEA中运行 LearnSphereApplication
   # 或使用命令行：mvn spring-boot:run
   ```

2. **测试基础接口**
   ```powershell
   # 健康检查
   Invoke-WebRequest -Uri "http://localhost:8080/api/test/hello" -UseBasicParsing
   ```

3. **启动前端服务**
   ```bash
   cd frontend-vue
   npm run dev
   ```

4. **访问测试页面**
   ```
   http://localhost:3000/api-test
   ```

### 第二阶段：认证功能测试

1. **用户注册测试**
   - 使用API测试页面注册新用户
   - 检查数据库中是否创建用户记录
   - 验证密码是否正确加密

2. **用户登录测试**
   - 测试正确的用户名密码
   - 验证返回的token格式
   - 检查token是否保存到localStorage

3. **用户信息获取**
   - 使用token获取用户信息
   - 验证权限控制是否正常

### 第三阶段：业务功能测试

1. **词汇API测试**
   - 获取词汇列表
   - 获取单词详情
   - 获取每日单词

2. **学习记录测试**
   - 创建学习记录
   - 查询学习统计

## 临时解决方案

如果后端问题暂时无法解决，可以使用Mock数据：

### 1. 前端Mock服务

```javascript
// frontend-vue/src/api/mock.js
export const mockApi = {
  async login(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          message: '登录成功',
          data: {
            satoken: 'mock-token-' + Date.now(),
            user: {
              id: 1,
              username: data.username,
              nickname: data.username,
              email: 'mock@example.com',
              examType: 'cet4',
              currentLevel: 'intermediate'
            }
          }
        })
      }, 500)
    })
  }
}
```

### 2. 使用JSON Server

```bash
# 安装json-server
npm install -g json-server

# 创建mock数据文件
# frontend-vue/mock/db.json

# 启动mock服务
json-server --watch mock/db.json --port 3001
```

## 完整的API测试用例

### 认证接口测试

```javascript
// 注册测试
const registerTest = {
  url: '/api/auth/register',
  method: 'POST',
  data: {
    username: 'testuser',
    password: '123456',
    email: 'test@example.com',
    nickname: '测试用户'
  },
  expected: { code: 200, message: '注册成功' }
}

// 登录测试
const loginTest = {
  url: '/api/auth/login',
  method: 'POST',
  data: {
    username: 'testuser',
    password: '123456'
  },
  expected: { 
    code: 200, 
    data: { satoken: 'string', user: 'object' }
  }
}
```

### 词汇接口测试

```javascript
// 获取词汇列表
const vocabularyListTest = {
  url: '/api/vocabulary/list',
  method: 'GET',
  params: {
    examType: 'cet4',
    page: 1,
    pageSize: 20
  },
  headers: {
    satoken: 'your-token-here'
  },
  expected: {
    code: 200,
    data: {
      total: 'number',
      list: 'array'
    }
  }
}
```

## 下一步开发计划

1. **解决后端启动问题** ⚠️ 优先级最高
2. **完成认证功能联调**
3. **实现词汇学习功能**
4. **添加语法练习功能**
5. **完善用户界面**
6. **添加学习统计功能**

## 开发建议

1. **分步骤调试**：先解决基础连通性，再测试复杂功能
2. **日志记录**：在关键位置添加日志输出
3. **错误处理**：完善前端错误提示和后端异常处理
4. **数据验证**：添加前后端数据验证
5. **安全考虑**：确保密码加密和token安全

---

**注意**：当前最重要的是解决后端的系统异常问题，建议检查IDEA控制台的详细错误日志。