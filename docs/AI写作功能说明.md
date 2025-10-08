# 写作智能批改功能 - 技术文档

## 功能概述
本功能实现了完整的"AI 写作批改"流程，包括：
1. **题目生成**：根据考试类型（CET-4/6, IELTS, TOEFL）和写作题型生成合适的写作题目
2. **在线写作**：提供可视化编辑器，支持字数统计和限时训练
3. **AI 批改**：自动评分并提供语法、词汇、逻辑等多维度反馈

## AI 集成方式

### 后端实现
使用**通义千问（Qwen）**作为 LLM 引擎，通过 OpenAI 兼容接口调用。

#### 核心代码位置
- `AIGenerationServiceImpl.java` - 第 237-365 行

#### 关键方法

**1. 通用 LLM 调用方法**
```java
private String callLLM(String systemPrompt, String userPrompt)
```
- 模型：`qwen-plus`（可配置）
- 超时：60秒
- 温度：0.7

**2. 写作题目生成**
```java
private Map<String, Object> callOpenAIForWriting(String examType, String mode)
```
返回结构：
```json
{
  "title": "题目标题",
  "prompt": "详细写作提示",
  "minWords": 150,
  "tips": ["提示1", "提示2"]
}
```

**3. 作文批改**
```java
private Map<String, Object> callOpenAIForEvaluation(String topic, String content)
```
返回结构：
```json
{
  "score": 6.5,
  "feedback": [
    {
      "type": "grammar | vocab | general",
      "text": "具体建议",
      "severity": "error | warning | success"
    }
  ]
}
```

### 前端实现

#### 路由
- `/writing` - 写作训练页面

#### 核心组件
- `WritingView.vue` - 主页面
- `api/ai.js` - API 调用封装

#### 用户流程
1. **选择配置**
   - 考试类型（CET-4/6, IELTS, TOEFL）
   - 写作模式（议论文、图表作文、书信）
   - 限时设置（不限时/30/45/60分钟）

2. **生成题目**
   - 点击"生成题目"调用 `/api/ai/generate/writing`
   - 实时显示题目、要求和写作提示

3. **在线写作**
   - 实时字数统计
   - 倒计时提醒
   - 草稿保存（可选）

4. **提交批改**
   - 调用 `/api/ai/evaluate/writing`
   - 显示评分和详细反馈

## 配置说明

### application.properties
```properties
# 通义千问 API 配置
openai.api-key=sk-your-qwen-api-key
openai.api-url=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions

# 如果使用 OpenAI
# openai.api-url=https://api.openai.com/v1/chat/completions
```

### Fallback 机制
当 API 密钥未配置或调用失败时，系统自动降级到本地 Mock 数据，保证功能可用。

## API 端点

### 1. 生成写作题目
```
POST /api/ai/generate/writing
Request Body:
{
  "examType": "cet4 | cet6 | ielts | toefl",
  "mode": "essay | chart | letter"
}
```

### 2. 批改作文
```
POST /api/ai/evaluate/writing
Request Body:
{
  "topic": "题目标题",
  "content": "作文内容"
}
```

## 特性亮点

1. **真实 AI 能力**：集成通义千问，提供专业的内容生成和评估
2. **兼容性设计**：支持 OpenAI 和国产大模型，只需切换配置
3. **优雅降级**：AI 不可用时自动使用 Mock 数据
4. **完整闭环**：从题目生成到批改反馈的全流程自动化

## 未来优化方向

1. 支持多轮批改和修改建议
2. 添加范文参考和对比分析
3. 实现写作历史记录和进步曲线
4. 支持更多考试类型和题型
