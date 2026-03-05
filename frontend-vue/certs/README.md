# HTTPS 开发环境配置说明

## 问题描述

浏览器安全策略要求使用麦克风等敏感设备 API（`MediaDevices`、`getUserMedia`）时，必须在**安全上下文**中运行。安全上下文包括：

- HTTPS 协议
- `localhost`
- `127.0.0.1`

**如果你使用 HTTP + IP 地址访问**（如 `http://192.168.x.x:5173`），浏览器会阻止麦克风访问，导致录音功能无法使用。

## 解决方案

### 方案 1：使用 HTTPS（推荐）

本项目已配置 `@vitejs/plugin-basic-ssl` 插件，自动为开发环境提供 HTTPS 支持。

#### 使用步骤：

1. **启动开发服务器**

   ```bash
   npm run dev
   ```

2. **访问应用**

   - 本地访问：`https://localhost:5173`
   - 局域网访问：`https://192.168.x.x:5173`

3. **信任自签名证书**

   首次访问时，浏览器会提示"您的连接不是私密连接"或"潜在的安全风险"。

   **Chrome/Edge：**
   - 点击"高级" → "继续访问 localhost"（或你的 IP 地址）

   **Firefox：**
   - 点击"高级" → "接受风险并继续"

### 方案 2：仅使用 localhost 访问

如果只在本地开发，直接访问 `http://localhost:5173` 即可，不需要 HTTPS。

### 方案 3：配置浏览器允许非安全源（不推荐）

仅用于测试环境，不推荐在正式开发中使用。

#### Chrome/Edge：
1. 地址栏输入：`chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. 启用该选项
3. 输入你的 HTTP 地址（如 `http://192.168.x.x:5173`）
4. 重启浏览器

#### Firefox：
1. 地址栏输入：`about:config`
2. 搜索：`media.devices.insecure.enabled`
3. 设置为 `true`
4. 重启浏览器

## 技术细节

### Vite 配置

已在 `vite.config.js` 中添加 `@vitejs/plugin-basic-ssl`：

```javascript
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    basicSsl(),
    // ... 其他插件
  ],
  // ... 其他配置
})
```

### 依赖项

确保 `package.json` 中已安装：

```json
{
  "devDependencies": {
    "@vitejs/plugin-basic-ssl": "^2.1.4"
  }
}
```

如果没有安装，运行：

```bash
npm install -D @vitejs/plugin-basic-ssl
```

## 验证

启动后，在浏览器控制台运行：

```javascript
console.log(location.protocol)
// 应该输出 "https:"
console.log(window.isSecureContext)
// 应该输出 true
```

## 常见问题

### Q: 为什么需要 HTTPS？
A: 浏览器安全策略要求访问麦克风等敏感设备必须在安全上下文中。

### Q: 自签名证书安全吗？
A: 自签名证书仅用于本地开发，不应在生产环境使用。生产环境应使用正式的 SSL 证书（如 Let's Encrypt）。

### Q: 可以关闭 HTTPS 吗？
A: 可以，但只能通过 `localhost` 访问才能使用麦克风功能。如果需要通过 IP 访问，必须使用 HTTPS。

### Q: 其他设备无法访问？
A: 其他设备访问时需要信任你的自签名证书。确保你的电脑和移动设备在同一局域网内。

## 生产环境部署

生产环境应该配置正式的 SSL 证书：

1. 使用 Nginx/Apache 等 Web 服务器配置 SSL
2. 使用 Let's Encrypt 免费证书
3. 或使用云服务商提供的 HTTPS 服务

相关配置文件位置：
- 前端配置：`frontend-vue/vite.config.js`
- 后端配置：`backend/src/main/resources/application.yml`
