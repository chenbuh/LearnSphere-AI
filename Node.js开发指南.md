# 🚀 Node.js 开发环境指南

## 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 快速开始

### 方式一：一键启动（推荐）
```bash
# 双击运行批处理文件
启动Node开发服务器.bat
```

### 方式二：命令行启动
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📦 可用脚本

| 脚本 | 功能 | 说明 |
|------|------|------|
| `npm start` | 生产环境启动 | 启动生产版本服务器 |
| `npm run dev` | 开发环境启动 | 启动开发服务器，支持热重载 |
| `npm run build` | 构建生产版本 | 编译和优化所有资源 |
| `npm run watch` | 监听模式 | 同时监听CSS和JS文件变化 |
| `npm run lint` | 代码检查 | 使用ESLint检查代码质量 |
| `npm run test` | 运行测试 | 执行Jest单元测试 |
| `npm run serve` | 静态文件服务 | 简单的HTTP静态文件服务器 |
| `npm run ai-demo` | AI演示 | 直接打开AI演示页面 |

## 🌐 访问地址

启动服务器后，可以访问以下地址：

- **主应用**: http://localhost:8080/
- **AI演示页面**: http://localhost:8080/demo
- **API健康检查**: http://localhost:8080/api/health
- **学习统计API**: http://localhost:8080/api/learning/stats

## 🔧 开发特性

### 热重载 (Hot Reload)
- 修改JavaScript文件会自动重启服务器
- 支持实时文件监听和变化检测
- 开发过程中无需手动重启

### 代码质量检查
```bash
# 检查代码规范
npm run lint

# 自动修复可修复的问题
npm run lint:fix
```

### 单元测试
```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch
```

### 构建优化
```bash
# 构建生产版本
npm run build

# 查看构建结果
ls -la dist/
```

## 📁 项目结构

```
项目根目录/
├── src/                    # 源代码
│   ├── js/                # JavaScript文件
│   │   ├── ai-recommendation/  # AI推荐系统模块
│   │   ├── utils.js       # 工具函数
│   │   ├── storage.js     # 数据存储
│   │   └── app.js         # 主应用
│   ├── css/               # 样式文件
│   └── html/              # HTML页面
├── tests/                 # 测试文件
├── scripts/               # 构建脚本
├── dist/                  # 构建输出（自动生成）
├── node_modules/          # 依赖包（自动生成）
├── server.js              # Express服务器
├── package.json           # 项目配置
└── 各种配置文件...
```

## 🛠️ 开发工作流

### 日常开发
1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **修改代码**
   - 编辑 `src/` 目录下的文件
   - 服务器会自动检测变化并重启

3. **查看效果**
   - 浏览器访问 http://localhost:8080/demo
   - 实时查看修改效果

4. **代码检查**
   ```bash
   npm run lint
   ```

### 测试开发
```bash
# 运行测试
npm test

# 查看测试覆盖率
open coverage/lcov-report/index.html
```

### 生产部署
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🔍 调试技巧

### 服务器日志
开发服务器会显示详细的请求日志：
```
🚀 英语学习AI系统开发服务器已启动!
GET / 200 - 15ms
GET /demo 200 - 8ms
GET /api/health 200 - 2ms
```

### 浏览器开发者工具
- 按 F12 打开开发者工具
- 查看控制台输出了解AI系统运行状态
- 使用网络面板监控API请求

### API测试
```bash
# 测试健康检查API
curl http://localhost:8080/api/health

# 测试学习统计API
curl http://localhost:8080/api/learning/stats
```

## 🎯 性能优化

### 开发环境优化
- 使用nodemon实现快速重启
- 启用源码映射便于调试
- 实时文件监听减少手动操作

### 生产环境优化
- CSS和JavaScript文件压缩
- 启用Gzip压缩
- 设置合适的缓存策略
- 安全头部配置

## 🔒 安全配置

服务器已配置以下安全措施：
- **Helmet**: 设置安全HTTP头部
- **CORS**: 跨域请求控制
- **Rate Limiting**: 请求频率限制
- **CSP**: 内容安全策略

## 📊 监控和日志

### 请求日志
- 开发环境：显示详细的请求信息
- 生产环境：记录标准的访问日志

### 错误处理
- 统一的错误处理中间件
- 详细的错误信息（仅开发环境）
- 优雅的错误响应

## 🚨 故障排除

### 常见问题

**Q: 端口8080被占用？**
```bash
# 查看端口占用
netstat -ano | findstr :8080

# 修改端口（在package.json或环境变量中）
set PORT=3000 && npm run dev
```

**Q: 依赖安装失败？**
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

**Q: 热重载不工作？**
- 检查nodemon配置
- 确认文件监听权限
- 查看控制台错误信息

**Q: 构建失败？**
```bash
# 检查构建日志
npm run build 2>&1 | tee build.log

# 清理构建缓存
rm -rf dist/
npm run build
```

### 性能问题
- 检查内存使用：`node --inspect server.js`
- 分析包大小：使用webpack-bundle-analyzer
- 监控响应时间：查看morgan日志

## 💡 开发建议

### 代码规范
- 遵循ESLint配置的代码规范
- 使用有意义的变量和函数名
- 添加必要的注释和文档

### 测试策略
- 为新功能编写单元测试
- 保持测试覆盖率在80%以上
- 使用模拟数据进行测试

### 版本控制
- 提交前运行代码检查
- 使用有意义的提交信息
- 定期更新依赖包

---

**🎉 现在您可以享受现代化的Node.js开发体验了！**

有任何问题请查看控制台输出或联系开发团队。
