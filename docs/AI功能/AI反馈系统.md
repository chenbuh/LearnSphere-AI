# AI 内容反馈与审计系统 (AI Content Feedback & Audit System)

## 1. 系统概述
本系统旨在建立一个 AI 内容生成质量的闭环监控机制。用户可以对 AI 生成的内容（如写作评估、口语纠错等）进行评价，管理员可以审核这些反馈并进行人工订正，这些数据最终将用于优化 AI 提示词或微调模型。

## 2. 核心功能
### 2.1 用户端 (User Side)
- **实时评分**：在 AI 生成结果页提供点赞/点踩功能。
- **详细反馈**：用户可以输入详细的改进建议。
- **自动关联**：系统自动记录产生该内容的 AI 生成日志 ID (`log_id`)。

### 2.2 管理端 (Admin Side)
- **反馈列表**：分页查看所有用户提交的反馈，支持按状态 (待处理/已处理/已忽略) 和评分 (正向/负向) 筛选。
- **深度透视**：点击详情可查看该次 AI 调用的完整上下文（系统提示词、用户提示词、原始响应）。
- **人工审计**：
  - 更新审核状态。
  - 提供人工修正后的内容 (`corrected_content`)，用于未来的模型微调或 Few-Shot 示例库。
  - 维护管理员备注。
- **智能归因分析**：
  - 支持对负面反馈进行 AI 自动归因分析，识别是 Prompt 问题还是模型幻觉。

## 3. 技术实现方案
### 3.1 数据库结构
- **表名**：`ai_content_feedback`
- **关键字段**：
  - `log_id`: 关联 `ai_generation_log.id`
  - `user_id`: 提交反馈的用户
  - `rating`: 1 (满意) / -1 (不满意)
  - `feedback_text`: 用户补充说明
  - `original_content`: 原始生成内容快照
  - `corrected_content`: 管理员修正内容
  - `status`: 0 (待处理) / 1 (已处理) / 2 (已忽略)
  - `admin_notes`: 管理员备注
  - `analysis_result`: AI 自动分析结果 (New!)

### 3.2 后端实现 (Updated 2026.02.11)
- **接口增强**：所有 AI 生成类接口（Reading, Writing, Grammar, Speaking, Recommendation, Tutor）均已整合 `logId` 返回。
- **Service 层集成**：`AIGenerationServiceImpl` 提供了 `getLastLogId()` 方法，通过同步记录日志后实时返回。
- **Admin Controller (New!)**：
  - `GET /api/admin/ai/feedback/list`: 管理员查询反馈列表，支持分页与多维度筛选。
  - `POST /api/admin/ai/feedback/audit`: 提交审核结果与修正内容。
  - `POST /api/admin/ai/feedback/{id}/analyze`: 触发 AI 对负面反馈的深度归因分析。
- **自动种子数据**：在 `DatabaseInitializer` 中增加了检测逻辑，若反馈表为空，会自动生成 5 条包含正/负向评价的演示数据，确保系统初始化后即有数据展示。

### 3.3 前端组件
- **Admin Vue**：
  - `AIFeedbackAudit.vue`: 完整的反馈审核面板，集成数据统计卡片 (待处理数/正向反馈率)。
- **User Vue**:
  - `AIFeedback.vue`: 通用反馈组件，支持极简（点赞点踩）和详细反馈。

## 4. 当前完成进度 (Build 2026.02.11)
- [x] 后端 `AIGenerationController` 全接口整合 `logId`。
- [x] 后端 `AdminAIController` 实现反馈列表与审核接口。
- [x] 数据库 `ai_content_feedback` 表结构升级，增加 `analysis_result`。
- [x] 系统初始化时自动生成演示数据 (Seed Data)。
- [x] 前端 `AIFeedback` 组件开发与逻辑联调。
- [x] 管理端 `AI 内容反馈审核池` 页面对接真实 API。

## 5. 后续规划
- **数据导出**：支持导出已修正的数据集，格式适配 Qwen/OpenAI 微调格式。
- **自动预警**：当某个提示词版本（ActionType）的差评率超过阈值时，自动向管理员发送系统通知。
