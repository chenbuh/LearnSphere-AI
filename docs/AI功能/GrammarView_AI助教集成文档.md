# GrammarView 功能集成文档

## 功能描述
在语法特训页面 (`GrammarView.vue`) 中，集成了增强版 AI Tutor (`AITutorEnhanced`) 以及薄弱点跟踪、相关知识点推荐和学习建议功能。这些功能旨在帮助用户在练习结束后获得更个性化、更有针对性的辅导体验。

## 主要更新内容

### 1. 增强版 AI Tutor 组件 (`AITutorEnhanced.vue`)
- **功能**:  在原有 `AITutor` 的基础上，增加了会话 ID（`sessionId`）的管理，支持维持有上下文和历史记录的对话。
- **改动**: 新建了 `src/components/AITutorEnhanced.vue`。实现了外部组件通过 `v-model:show` 控制显隐，通过 `@session-created` 接收会话 ID。

### 2. 语法测试页智能反馈 (`GrammarView.vue`)
- **答题记录**: 用户提交语法练习后，会自动调用 `aiApi.recordPractice` 将练习主题和结果（正确率 >= 60% 算作掌握）记录在用户的薄弱点系统中。
- **推荐知识点**: 在练习正确率低于 80% 时，利用 `aiApi.getRelatedTopics` 获取该主题的相关知识条目并予以展示。
- **学习建议**: 练习正确率不足时，同时会通过 `aiApi.getLearningAdvice` 获得 AI 针对当前知识点的学习建议。
- **AI 助手对话**: 将结果反馈给用户时，用户可通过“需要进一步讲解？问问 AI 助手”入口唤起 `AITutorEnhanced`。AI 助手将在带有测试题目的上下文中回答用户的疑问。

## 代码结构说明

- **AITutorEnhanced.vue (UI/逻辑增强)**
  - `show` props 的控制及 emit 发送
  - 会话数据更新监听 (`update:show`, `session-created`)
- **GrammarView.vue (业务层集成)**
  - 变量声明: `tutorSessionId`, `learningAdvice`, `relatedTopics`
  - 拦截判断逻辑: `percentage < 0.8` 显示推荐及建议
  - 持久化清理防冲突: 恢复了对持久化数据的正确清除机制。

## 适用场景
本更新旨在实现用户在每次测验后的“学-练-测-评”完整闭环，后续其它模块也可借鉴该模式直接引入智能建议及知识补漏功能。
