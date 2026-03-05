# 快速启动指南 - 解决录音功能问题

## 问题解决完成 ✅

已为 Vite 开发服务器配置 HTTPS 支持，解决使用 IP 地址访问时麦克风无法使用的问题。

## 方案说明

使用 `vite-plugin-mkcert` 插件，自动生成受浏览器信任的本地开发证书。

## 前置设置（首次使用）

### Windows 用户

**方法 1：使用自动安装脚本（推荐）**
```bash
# 双击运行或在 PowerShell 中运行
setup-https.bat
```

**方法 2：手动安装**

1. **安装 mkcert 工具**
   ```powershell
   # 使用 Chocolatey 安装（需要管理员权限）
   choco install mkcert

   # 或者从 GitHub 下载
   # https://github.com/FiloSottile/mkcert/releases
   ```

2. **安装本地 CA**
   ```bash
   mkcert -install
   ```
   会弹出 UAC 提示，点击"是"确认安装。

### macOS / Linux 用户

```bash
# 安装 mkcert
brew install mkcert  # macOS
# 或 sudo apt install mkcert  # Ubuntu/Debian

# 安装本地 CA
mkcert -install
```

## 启动开发服务器

```bash
cd frontend-vue
npm run dev
```

启动后你会看到：
```
➜  Local:   https://localhost:5173/
➜  Network: https://192.168.x.x:5173/
```

## 验证录音功能

1. 访问 `https://localhost:5173` 或你的网络 HTTPS 地址
2. 进入"口语练习"页面
3. 点击麦克风按钮
4. 允许浏览器访问麦克风权限
5. 开始录音！

**注意：** 使用 mkcert 生成的证书会被浏览器自动信任，无需手动确认安全警告。

## 技术说明

- **使用了** `vite-plugin-mkcert` 插件
- **自动生成** 受信任的本地开发证书
- **无需手动配置** 浏览器信任
- **仅用于开发环境**，生产环境需要正式证书

## 如果还有问题

### mkcert 命令找不到
1. 确认已正确安装 mkcert
2. 重启终端/命令提示符
3. 检查 PATH 环境变量

### 证书警告
1. 确认运行了 `mkcert -install`
2. 清除浏览器缓存：`设置 → 隐私和安全 → 清除浏览数据`
3. 重启浏览器

### 端口被占用
修改 `vite.config.js` 中的 `port` 配置

### 需要帮助
查看详细文档：`frontend-vue/certs/README.md`
