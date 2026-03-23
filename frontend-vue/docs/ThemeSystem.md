# 主题系统配置与维护文档 (Theme System)

文档版本: 1.0.0
更新时间: 2026-03-23

## 功能概述
LearnSphere AI 前端项目支持深色 (Dark) 与浅色 (Light) 主题的动态平滑切换，提供一致且美观的视觉体验。主题切换功能主要由 `naive-ui` 的 `NConfigProvider` 组件和自定义的 CSS 变量配合完成。

## 目录结构关联
- `src/stores/theme.js`：定义全局的主题模式状态，并同步 `localStorage`。
- `src/utils/theme.js`：封装 DOM 操作，为 `html` 和 `body` 添加响应的主题类名和 `data-theme` 属性。
- `src/App.vue`：包裹界面的 `NConfigProvider` 核心，配置 `naive-ui` 对深浅两套核心调色板 (`themeOverrides`) 的支持。
- `src/style.css`：定义 `html[data-theme='light']` 与深色的全局 CSS 变量体系。

## 近期更新与问题修复记录

### 浅色模式全白与频繁刷新问题的修复
**现象**：
在应用从深色模式切换到浅色模式时，界面突然变白脱离文档流导致元素消失（DOM 空载），并且触发大量对 `/api/common/config` 等接口的限流请求报错（429 Too Many Requests）。

**根本原因**：
1. **动画死锁机制（DOM 崩溃）**：之前的全局样式在切换主题时（`html[data-theme-switching='true'] *`）强行应用了 `transition: none !important;` 以防主题色闪烁。这一规则会干扰 `Vue.js` 的 `<Transition>` 组件中依赖于 `transitionend` 的钩子事件。在弹窗或响应式元素执行重绘动画时若发生主题切换，事件丢失会导致 Vue 脱离生命周期，使得 DOM 元素意外处于未挂载或隐藏状态，页面彻底变成空白。
2. **`NConfigProvider` 的浅色缺省引发渲染重构**：早前代码在 App.vue 中对浅色模式强制引入了未导出的 `lightTheme`，其被解析为 `undefined`。Vue 3 组件渲染失败后会导致应用边界重新加载，频繁挂载组件的生命周期（如 `App.vue` 中的 `onMounted`），进而发起巨大的网络请求。

**解决方案**：
1. 在 `App.vue` 中将默认的浅色主题定义修正为：
   `const theme = computed(() => (themeStore.isDark ? darkTheme : null))`（`null` 是 `naive-ui` 默认浅色的安全触发值）。
2. 在 `style.css` 中移除了会导致死锁全局 `transition: none !important;` 规则。

## 未来开发最佳实践
1. **添加颜色变量时**：请务必同时在 `src/style.css` 内为深色 `html[data-theme='dark']` 与浅色 `html[data-theme='light']` 提供配对的色值，防止字体颜色与背景难以区分。
2. **对 `Naive UI` 的样式覆盖**：推荐统一写入 `App.vue` 内部的 `themeOverrides` 计算属性中，或者采用 `var(--{css变量})` 引用。绝对不要使用固定十六进制直接写死在其他业务 `.vue` 中。
3. **动画元素**：不要在主题系统层再通过修改全局 `transition` 来处理闪烁问题，应采用渐进颜色的 `0.3s cubic-bezier` 执行过渡（详见 `var(--theme-transition)`）。
