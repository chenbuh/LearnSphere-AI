# 音频播放问题修复说明

## 问题描述

### 1. CSP (Content Security Policy) 错误
- **错误信息**: `Loading media from 'https://dict.youdao.com/dictvoice' violates the following Content Security Policy directive: "default-src 'self'"`
- **原因**: CSP 配置中缺少 `media-src` 指令，导致浏览器阻止从外部源加载音频文件

### 2. aria-hidden 警告
- **警告信息**: 关于 `aria-hidden` 和焦点管理的可访问性警告
- **影响**: 这可能影响使用辅助技术（如屏幕阅读器）的用户体验

## 修复方案

### ✅ 已修复：CSP 音频加载问题

**文件**: `frontend-vue/index.html`

**修改内容**:
```html
<!-- 修改前 -->
content="default-src 'self'; script-src ... ; img-src 'self' data: https: blob:; connect-src ..."

<!-- 修改后 -->
content="default-src 'self'; script-src ... ; img-src ... ; media-src 'self' https://dict.youdao.com https://api.frdic.com; connect-src ..."
```

**关键改动**:
- 新增 `media-src 'self' https://dict.youdao.com https://api.frdic.com`
- 允许从有道词典和 FreDict API 加载音频资源

### 音频播放策略

系统使用三层降级策略确保音频播放:

1. **单词发音** (`VocabularyView.vue` 第 118-124 行):
   - 优先使用有道词典 API: `https://dict.youdao.com/dictvoice`
   - 降级到浏览器原生 TTS

2. **句子发音** (第 94-116 行):
   - 优先使用必应 TTS: `https://api.frdic.com/api/v2/speech/speakweb`
   - 降级到浏览器原生 SpeechSynthesis

### aria-hidden 警告

这个警告通常由 UI 组件库（Naive UI）的模态框或弹窗触发，属于框架级别的问题，不影响核心功能。可以通过以下方式优化：

**建议**:
- 使用 `inert` 属性替代 `aria-hidden`（如果浏览器支持）
- 确保模态框打开时，焦点正确管理
- 这是 Naive UI 的内部实现，等待框架更新

## 测试验证

修复后，请刷新浏览器页面并验证：

1. ✅ 点击词汇卡片上的音频图标能正常播放单词发音
2. ✅ 在学习模式中，单词自动播放功能正常
3. ✅ 控制台不再出现 CSP 错误

## 技术细节

### CSP 指令说明

| 指令 | 作用 | 配置值 |
|------|------|--------|
| `default-src` | 默认加载策略 | `'self'` |
| `media-src` | 音频/视频源 | `'self' https://dict.youdao.com https://api.frdic.com` |
| `script-src` | JavaScript 源 | `'self' 'unsafe-inline' 'unsafe-eval'` |
| `connect-src` | API 请求源 | `'self' http://localhost:8080 https://api.frdic.com https://dict.youdao.com` |

### 相关文件

- `frontend-vue/index.html` - CSP 配置
- `frontend-vue/src/views/VocabularyView.vue` - 音频播放逻辑
- `frontend-vue/src/utils/logger.js` - 日志工具

## 版本历史

- **2026-01-26**: 添加 `media-src` 指令，修复音频加载问题
- **2026-01-26**: 文档化音频播放策略和降级方案
