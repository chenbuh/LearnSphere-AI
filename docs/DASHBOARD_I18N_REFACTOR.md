# DashboardView.vue 国际化重构文档

## 🚀 变更总结

本文档记录了对 `DashboardView.vue` 首页进行的多语言系统（i18n）重构，旨在移除所有硬编码的中文字符串，使平台具备多语言切换能力。

---

## 🛠️ 技术方案

### 1. 国际化框架
- **技术栈**: `vue-i18n` (v10+)
- **实现方式**: 使用 Composition API 的 `useI18n()` 钩子，配合 `tm()` 处理数组类型（如星期）。

### 2. 字段映射 (zh-CN & en-US)
在 `src/locales/` 目录下新增了 `dashboard` 命名空间，涵盖以下内容：
- **欢迎语**: 支持动态用户名注入。
- **状态统计**: 连续打卡、学习时长、词汇量。
- **图表控制**: 7天/30天切换、图表 Tooltip。
- **AI 洞察**: 神经网络扫描状态、AI 建议内容。
- **排行榜与活动**: 标题、XP 单位、时间格式（分钟前、小时前等）。

### 3. 代码变更点
- **Script 部分**:
    - 引入 `useI18n` 并解构出 `t` 和 `tm`。
    - 重构 `formatDateLabel`, `getWeekday` 等日期处理函数，使其从语言包读取星期名称。
    - 重构 `formatRecordTitle` 和 `simplifyTime`，确保活动标题和时间跨度支持 i18n。
- **Template 部分**:
    - 使用 `{{ t('...') }}` 替换所有静态标题、按钮文字和段落。
    - 对 NButton, NCard, NTag 等组件的 `title` 或 `label` 属性进行动态绑定。

---

## ✅ 优化效果对比

| 特性 | 重构前 | 重构后 |
|-----|-------|--------|
| **语言支持** | 仅限中文 | 中文 (zh-CN) & 英文 (en-US) |
| **可维护性** | 字符串分散在模版中 | 统一管理在 `locales/*.js` |
| **感知质量** | 固定文字 | 符合国际化标准，术语专业 |
| **扩展性** | 增加语言需修改代码 | 仅需增加一个新的 Locale 文件 |

---

## 📁 涉及文件

- `frontend-vue/src/views/DashboardView.vue` (核心逻辑)
- `frontend-vue/src/locales/zh-CN.js` (中文包)
- `frontend-vue/src/locales/en-US.js` (英文包)

---

## 📝 总结

通过本次重构，LearnSphere AI 的首页已完全适配 `vue-i18n` 框架。这不仅提升了代码质量，也为平台走向全球化奠定了坚实的基础。

**重构完成时间**: 2026-02-09  
**版本**: v2.5.0
