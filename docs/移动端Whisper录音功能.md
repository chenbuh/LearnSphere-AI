# 移动端 Whisper 录音功能测试指南

## ✅ 已完成的优化

### 1. HTTPS 支持
- ✅ 已配置 `vite-plugin-mkcert` 插件
- ✅ 自动生成受信任的本地开发证书
- ✅ 支持通过 HTTPS 访问，解决移动端麦克风权限问题

### 2. 移动端音频格式兼容
- ✅ 创建了 `MobileAudioRecorder` 工具类
- ✅ 自动检测浏览器支持的音频格式
- ✅ 支持 Safari (iOS) 的 `audio/mp4` 格式
- ✅ 支持 Android 的 `audio/webm` 格式
- ✅ 自动降级到浏览器默认格式

### 3. 更新的组件
- ✅ `SpeakingView.vue` - 口语练习页面
- ✅ `VoiceInput.vue` - 语音输入组件
- ✅ `audioCompatibility.js` - 音频兼容性测试工具

## 📱 测试步骤

### 前置条件

1. **安装 mkcert（首次使用）**
   ```bash
   # Windows (使用 Chocolatey)
   choco install mkcert

   # 安装本地 CA
   mkcert -install
   ```

2. **启动开发服务器**
   ```bash
   cd frontend-vue
   npm run dev
   ```

3. **确认 HTTPS 访问**
   - 本地：`https://localhost:5173`
   - 局域网：`https://192.168.x.x:5173`

### iOS 测试 (iPhone/iPad)

1. **使用 Safari 浏览器**访问 HTTPS 地址
2. **授予权限**：
   - 首次访问时会弹出麦克风权限请求
   - 点击"允许"
3. **测试录音**：
   - 进入"口语练习"页面
   - 点击麦克风按钮
   - 允许录音权限
   - 说话后停止录音
   - 检查是否正确调用 Whisper 识别

4. **验证音频格式**：
   - 打开浏览器控制台（设置 > Safari > 高级 > Web 检查器）
   - 查看 Console 日志中的 MIME 类型
   - 应该显示：`audio/mp4` 或 `audio/mp4;codecs=aac`

### Android 测试

1. **使用 Chrome 浏览器**访问 HTTPS 地址
2. **授予权限**：
   - 地址栏会显示权限图标
   - 点击并允许麦克风访问
3. **测试录音**：
   - 进入"口语练习"页面
   - 点击麦克风按钮
   - 允许录音权限
   - 说话后停止录音
   - 检查识别结果

4. **验证音频格式**：
   - 查看 Console 日志
   - 应该显示：`audio/webm` 或 `audio/webm;codecs=opus`

## 🔧 故障排查

### 问题 1：麦克风权限被拒绝

**iOS Safari**：
1. 点击地址栏的"AA"图标
2. 选择"网站设置"
3. 将麦克风设置为"允许"
4. 刷新页面

**Android Chrome**：
1. 点击地址栏左侧的锁图标
2. 选择"网站设置"
3. 将麦克风设置为"允许"
4. 刷新页面

### 问题 2：HTTPS 证书警告

**解决方案**：
1. 确认已运行 `mkcert -install`
2. 重启开发服务器
3. 清除浏览器缓存
4. 重新访问

**iOS 特殊处理**：
1. 如果仍然有警告，点击"高级"
2. 点击"继续访问"

### 问题 3：录音无声音或识别失败

**检查清单**：
1. 确认后端 Whisper 服务运行正常：
   ```bash
   # 检查服务状态
   curl http://localhost:5010/health
   ```

2. 查看前端控制台日志：
   - 检查录音是否成功启动
   - 检查音频格式是否正确
   - 检查 API 请求是否成功

3. 查看后端日志：
   ```bash
   # 检查 Whisper 服务日志
   # 应该看到 "Transcribing audio" 日志
   ```

### 问题 4：音频格式不兼容

**症状**：
- 后端无法处理上传的音频文件
- Whisper 返回错误

**解决方案**：
1. 后端需要支持多种音频格式
2. 当前 `edge_tts_server.py` 已支持：
   - `audio/webm`
   - `audio/mp4`
   - `audio/ogg`
   - `audio/wav`

3. 如果需要添加其他格式支持：
   ```python
   # 在 edge_tts_server.py 中添加格式转换
   import ffmpeg

   # 转换为 WAV 格式（Whisper 通用支持）
   ffmpeg.input(temp_audio_path).output(
       temp_wav_path,
       acodec='pcm_s16le',
       ac=1,
       ar='16000'
   ).overwrite_output().run()
   ```

## 🧪 兼容性测试工具

### 在浏览器控制台运行

```javascript
// 1. 导入并运行兼容性检查
import { checkAudioSupport, displayAudioSupport } from '@/utils/audioCompatibility'

// 2. 显示支持情况
const support = displayAudioSupport()

// 3. 导出测试报告
import { exportAudioReport } from '@/utils/audioCompatibility'
const report = exportAudioReport()
console.log('测试报告:', report)

// 4. 请求麦克风权限
import { requestMicrophonePermission } from '@/utils/audioCompatibility'
const permission = await requestMicrophonePermission()
console.log('权限结果:', permission)
```

## 📊 支持的浏览器矩阵

| 浏览器 | 版本 | 录音支持 | Whisper | 音频格式 |
|--------|------|----------|---------|----------|
| Safari (iOS) | 14.1+ | ✅ | ✅ | audio/mp4 |
| Chrome (Android) | 90+ | ✅ | ✅ | audio/webm |
| Firefox (Android) | 90+ | ✅ | ✅ | audio/webm |
| Chrome (Desktop) | 90+ | ✅ | ✅ | audio/webm |
| Safari (Desktop) | 14.1+ | ✅ | ✅ | audio/mp4 |
| Firefox (Desktop) | 90+ | ✅ | ✅ | audio/webm |

## 🚀 性能优化建议

### 移动端优化

1. **降低音频采样率**（可选）：
   ```javascript
   // 在 MobileAudioRecorder.init() 中
   audio: {
       sampleRate: 16000  // 16kHz 足够语音识别
   }
   ```

2. **启用音频压缩**：
   ```javascript
   // 使用比特率更低的编解码器
   mimeType: 'audio/webm;codecs=opus'
   // Opus 在低比特率下表现优异
   ```

3. **限制录音时长**：
   ```javascript
   // 避免过长的录音导致处理超时
   const MAX_RECORDING_DURATION = 60000 // 60秒
   ```

### 网络优化

1. **使用 Wi-Fi**：Whisper 识别需要上传音频文件
2. **压缩音频**：自动选择最低质量的兼容格式
3. **添加重试机制**：网络失败时自动重试

## 📝 测试报告模板

完成测试后，请填写以下报告：

```markdown
## 移动端测试报告

**测试日期**：YYYY-MM-DD
**测试人员**：姓名
**设备信息**：
- 设备型号：iPhone 13 Pro
- 操作系统：iOS 16.5
- 浏览器：Safari 16.5
- 网络环境：Wi-Fi 5G

**测试结果**：

### 功能测试
- [ ] HTTPS 访问正常
- [ ] 麦克风权限授予成功
- [ ] 录音功能正常
- [ ] Whisper 识别准确
- [ ] 音频格式兼容

### 兼容性测试
- [ ] iOS Safari 测试通过
- [ ] Android Chrome 测试通过
- [ ] 其他浏览器测试通过

### 问题记录
- 问题描述：
- 复现步骤：
- 解决方案：

### 性能测试
- 录音启动时间：__ 秒
- 识别响应时间：__ 秒
- 音频文件大小：__ KB
```
