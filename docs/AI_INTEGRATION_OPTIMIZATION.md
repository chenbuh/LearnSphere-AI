# AI 功能深度结合与优化 (AI Integration & Optimization)

本文档详细说明了 LearnSphere 项目在 2.8.0 版本中进行的 AI 核心功能结合与架构优化。

## 1. 核心特性：Prompt 编排中心 (Prompt Orchestration Center)

为了提高 AI 生成内容的稳定性和可维护性，我们实现了 **Prompt 编排中心**。

- **核心组件**: `ISystemPromptService` & `SystemPromptServiceImpl`
- **实现原理**: 
  - 所有硬编码在 Java 代码中的 AI 系统提示词 (System Prompt) 和用户提示词模板 (User Prompt Template) 全部迁移至 `system_prompt` 数据库表。
  - 通过 `getPromptTemplate(key, defaultVal, description)` 方法获取提示词，如果物理库不存在则自动初始化默认值。
  - **优势**: 允许管理员在不重启服务器的情况下，通过数据库实时调整 AI 的语气、逻辑和输出格式。

## 2. 智能助教：深度上下文感知 (Context-Aware AI Tutor)

原有的 AI 助教在对话时缺乏记忆，本版本实现了**基于历史对话的上下文感知**。

- **逻辑增强**: 
  - `AITutorServiceImpl` 现在会在对话时自动检索该 `sessionId` 下的最近 5-10 轮历史记录。
  - 历史记录会被注入到 LLM 的消息列表中，使其具备短期记忆。
  - 助教现在可以针对用户的连续提问进行连贯的回答（如：“刚才那个例句我不懂，能再解释下吗？”）。

## 3. 个性化能力增强 (Personalized Intelligence)

### 3.1 AI 词汇深度解析 (Deep Vocab Insight)
- **功能**: 除了基本的音标和释义，新增 **词源故事 (Etymology)** 和 **趣味助记法 (Mnemonics)**。
- **价值**: 通过逻辑联系和联想记忆，极大提高用户背单词的效率。

### 3.2 错题深度 RAG 解析 (Error Book RAG)
- **逻辑**: 结合用户的错误选项、正确答案、题目解析，由 AI 进行“心理学诊断”，分析用户为何选错（如：混淆了虚拟语气的倒装）。

### 3.3 实时智能建议引擎 (Live Recommendation Engine)
- **逻辑**: 基于 Dashboard 实时计算的能力值雷达图，AI 动态生成 2 条学习路径建议，直接引导用户去最薄弱的模块练习。

## 4. 技术栈支持

- **LLM SDK**: Alibaba DashScope (通义千问 qwen-plus/qwen-turbo)
- **缓存层**: Caffeine L2 Cache (缓存常用 Prompt)
- **监控端点**: Spring Boot Actuator (监控 AI 调用成功率和 Token 消耗)

## 5. 提示词 Key 列表

| Key | 描述 | 应用场景 |
|-----|------|----------|
| `AI_TUTOR_SYSTEM` | AI 助教系统人格 | 全局对话 |
| `AI_TUTOR_ADVICE_RULES` | 回答规范规范 | 全局对话 |
| `VOCAB_DETAIL_USER` | 词汇深度解析模板 | 单词详情页 |
| `REC_ENGINE_USER` | 推荐引擎逻辑 | 首页建议卡片 |
| `READING_GEN_SYSTEM` | 阅读生成专家设置 | 内容生成 |

---
**LearnSphere Team**  
*Empowering Learning with Infinite Intelligence*
