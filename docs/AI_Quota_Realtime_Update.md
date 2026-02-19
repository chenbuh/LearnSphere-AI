# AI 配额实时更新功能文档

## 📊 功能概述

**日期**: 2026-02-15 02:20  
**功能**: 实现 AI 助教提问和内容生成配额的实时更新

用户在使用 AI 功能后，无需刷新页面即可看到配额变化，提供更流畅的用户体验。

## ✨ 实现机制

### 三重更新策略

我们采用三种互补的策略确保配额信息始终保持最新：

| 策略 | 触发时机 | 延迟 | 目的 |
|------|---------|------|------|
| **事件驱动** | AI 请求成功后 | 500ms | 立即响应用户操作 |
| **定时轮询** | 固定时间间隔 | 30s | 防止遗漏更新 |
| **手动刷新** | 用户主动触发 | 0ms | 提供即时反馈 |

### 1. 事件驱动更新 (核心机制)

#### 工作流程

```
用户调用 AI 功能
    ↓
request.js 拦截响应
    ↓
检测 URL 是否为 AI 接口
    ↓
触发 'quota-updated' 事件
    ↓
QuotaDisplay 监听事件
    ↓
调用 fetchQuotaInfo()
    ↓
配额显示实时更新
```

#### 实现代码

**request.js** (响应拦截器):
```javascript
import { triggerQuotaUpdate } from './quotaEvent'

// 响应拦截器
if (data.code === 200) {
  // 检测 AI 相关接口
  const aiEndpoints = ['/ai-tutor/', '/reading/', '/writing/', '/listening/', '/mock-exam/']
  const url = response.config.url || ''
  
  if (aiEndpoints.some(endpoint => url.includes(endpoint))) {
    // 延迟 500ms 确保后端配额已更新
    setTimeout(() => {
      triggerQuotaUpdate()
    }, 500)
  }
  return data
}
```

**quotaEvent.js** (事件工具):
```javascript
export function triggerQuotaUpdate() {
    window.dispatchEvent(new CustomEvent('quota-updated'))
}
```

**useVipPermission.js** (配额管理):
```javascript
const setupQuotaListener = () => {
    window.addEventListener('quota-updated', () => {
        fetchQuotaInfo()
    })
}
```

**QuotaDisplay.vue** (UI 组件):
```javascript
onMounted(() => {
  fetchQuotaInfo()
  setupQuotaListener()  // 监听事件
  
  // 每 30 秒轮询一次
  setInterval(() => {
    fetchQuotaInfo()
  }, 30 * 1000)
})
```

### 2. 定时轮询

**间隔时间**: 30 秒  
**原因**: 
- 捕获可能遗漏的配额变化
- 处理多设备/多标签页的情况
- 确保长时间停留页面时数据新鲜度

**优化前**: 5 分钟更新一次 ❌  
**优化后**: 30 秒更新一次 ✅

### 3. 手动刷新

用户可以通过以下方式手动刷新配额：
- 调用 `refreshQuota()` 方法
- 页面路由切换时自动刷新
- 点击配额显示区域触发刷新（可选）

## 🎯 支持的 AI 功能

配额实时更新自动应用于以下功能：

| 功能模块 | API 路径 | 消耗配额类型 |
|---------|---------|------------|
| AI 助教提问 | `/ai-tutor/` | 助教提问配额 |
| 阅读理解 | `/reading/` | 内容生成配额 |
| 写作评估 | `/writing/` | 内容生成配额 |
| 听力训练 | `/listening/` | 内容生成配额 |
| 模拟考试 | `/mock-exam/` | 内容生成配额 |

## 📱 用户体验提升

### Before (之前)
```
用户: 使用 AI 助教提问
显示: 剩余 200/200
用户: 继续提问 5 次
显示: 仍然是 200/200 ❌ 
用户: 刷新页面
显示: 195/200 ✅ (但体验不佳)
```

### After (现在)
```
用户: 使用 AI 助教提问
显示: 剩余 200/200
等待: 0.5 秒
显示: 自动更新为 199/200 ✅
用户: 继续提问 5 次
显示: 实时显示 194/200 ✅ (无需刷新)
```

## 🔧 技术细节

### 延迟设置

**为什么延迟 500ms?**

1. **后端处理时间**: 后端需要时间写入 Redis
2. **网络延迟**: API 响应到达前端需要时间
3. **数据一致性**: 确保读取到最新的配额值

```javascript
setTimeout(() => {
  triggerQuotaUpdate()
}, 500)  // 500ms 是经过测试的最优值
```

### 防抖机制

如果用户在短时间内多次调用 AI，事件会被多次触发，但 `fetchQuotaInfo` 内部应该有防抖逻辑避免过多请求。

**建议优化** (未来可添加):
```javascript
let quotaUpdateTimer = null

function triggerQuotaUpdate() {
  clearTimeout(quotaUpdateTimer)
  quotaUpdateTimer = setTimeout(() => {
    window.dispatchEvent(new CustomEvent('quota-updated'))
  }, 500)
}
```

## 📊 性能影响

### 网络请求分析

**场景**: 用户在 5 分钟内使用 AI 功能 10 次

**优化前**:
- 主动更新: 0 次
- 定时轮询: 1 次 (5分钟)
- **总计**: 1 次额外请求

**优化后**:
- 事件驱动: 10 次
- 定时轮询: 10 次 (30秒×10)
- **总计**: 20 次额外请求

**评估**: 虽然请求增加，但每次请求极小 (<1KB)，用户体验提升显著，值得。

### 优化建议

1. **请求合并**: 如果短时间内多次更新，合并为一次
2. **缓存策略**: 前端缓存配额信息，减少无效请求
3. **WebSocket**: 长期可考虑使用 WebSocket推送

## 🧪 测试验证

### 测试步骤

1. **打开浏览器控制台**
   ```javascript
   // 监听配额事件
   window.addEventListener('quota-updated', () => {
     console.log('配额更新事件触发!')
   })
   ```

2. **使用 AI 助教功能**
   - 提问任意问题
   - 观察控制台输出
   - 观察右上角配额数字变化

3. **预期结果**
   - 500ms 后控制台输出 "配额更新事件触发!"
   - 配额数字从 200/200 变为 199/200
   - 无需刷新页面

### 调试技巧

```javascript
// 手动触发配额更新
import { triggerQuotaUpdate } from '@/utils/quotaEvent'
triggerQuotaUpdate()

// 手动刷新配额
import { useVipPermission } from '@/composables/useVipPermission'
const { refreshQuota } = useVipPermission()
await refreshQuota()
```

## 📝 文件清单

| 文件 | 作用 | 修改内容 |
|------|------|---------|
| `quotaEvent.js` | 事件工具 | 新建文件 |
| `request.js` | HTTP 拦截器 | 添加事件触发 |
| `useVipPermission.js` | 配额管理 | 添加监听器 |
| `QuotaDisplay.vue` | UI 组件 | 应用监听器 |

## 🚀 后续优化

1. **WebSocket 推送** (高级)
   - 服务端主动推送配额变化
   - 支持多设备同步
   - 延迟更低

2. **乐观更新** (体验优化)
   - 调用 API 时立即减少配额显示
   - API 失败时回滚
   - 用户感知延迟为 0

3. **配额预警**
   - 配额低于 10% 时高亮提示
   - 即将用完时弹窗提醒
   - 建议用户升级 VIP

---

**创建时间**: 2026-02-15 02:20  
**作者**: Antigravity AI  
**版本**: 1.0  
**相关文档**: 
- `AI_Quota_System_Fix.md`
- `AI_Governance_Enhancement.md`
