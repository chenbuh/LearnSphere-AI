# AI 内容反馈与审计系统 (AI Content Feedback & Audit System)

## 1. 系统概述
本系统旨在建立一个 AI 内容生成质量的闭环监控机制。用户可以对 AI 生成的内容（如写作评估、口语纠错等）进行评价，管理员可以审核这些反馈并进行人工订正，这些数据最终将用于优化 AI 提示词或微调模型。

## 2. 核心功能
### 2.1 用户端 (User Side)
- **实时评分**：在 AI 生成结果页提供点赞/点踩功能。
- **详细反馈**：用户可以输入详细的改进建议。
- **自动关联**：系统自动记录产生该内容的 AI 生成日志 ID (`log_id`)。

### 2.2 管理端 (Admin Side)
- **反馈列表**：分页查看所有用户提交的反馈，支持按状态和评分筛选。
- **深度透视**：点击详情可查看该次 AI 调用的完整上下文（系统提示词、用户提示词、原始响应）。
- **人工审计**：
  - 更新审核状态（已处理/已忽略）。
  - 提供人工修正后的内容 (`corrected_content`)。
  - 维护管理员备注。

## 3. 技术实现方案
### 3.1 数据库结构
- **表名**：`ai_content_feedback`
- **关键字段**：
  - `log_id`: 关联 `ai_generation_log.id`
  - `rating`: 1 (满意) / 0 (不满意)
  - `feedback_text`: 用户补充说明
  - `corrected_content`: 管理员修正内容
  - `status`: 0 (待处理) / 1 (已处理) / 2 (已忽略)

### 3.2 后端实现
- **接口增强**：所有 AI 生成类接口（Reading, Writing, Grammar, Speaking, Recommendation, Tutor）均已整合 `logId` 返回。
- **安全性**：响应数据经过 `ContentSecurityUtil` 加密，确保传输安全。
- **Service 层集成**：`AIGenerationServiceImpl` 提供了 `getLastLogId()` 方法，通过同步记录日志后实时返回。
- **API 接口**：
  - `POST /api/ai/feedback/submit`: 提交反馈。
  - `GET /api/admin/ai/feedback/list`: 管理员查询。
  - `POST /api/admin/ai/feedback/audit`: 管理员审核。

### 3.3 前端组件
- `AIFeedback.vue`: 通用反馈组件，支持极简（点赞点踩）和详细反馈。
- **集成位置**：
  - **写作评估**：结果页评分右侧。
  - **口语练习**：评估结果页。
  - **语法练习**：练习完成后的结果反馈。
  - **阅读理解**：生成文章后的结果页。
  - **仪表盘**：AI 智能建议卡片左下角。

## 4. 当前完成进度 (Build 2026.02.09)
- [x] 后端 `AIGenerationController` 全接口整合 `logId`。
- [x] 后端 `RecommendationController` AI 建议接口整合 `logId`。
- [x] 前端 `AIFeedback` 组件开发与逻辑联调。
- [x] 全模块 UI 集成 (Writing, Speaking, Reading, Grammar, Dashboard)。
- [x] 反馈提交加密与 Sa-Token 鉴权保护。

## 5. 后续规划
- **数据导出**：支持导出已修正的数据集，格式适配 Qwen/OpenAI 微调格式。
- **自动预警**：当某个提示词版本（ActionType）的差评率超过阈值时，自动向管理员发送系统通知。
