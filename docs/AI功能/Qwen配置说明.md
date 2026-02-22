# Qwen AI 配置完成 ✅

## 📋 配置信息

### API 配置
- **API Key**: `sk-8b5df7e3d85442fd8e4ddb7c5204da48`
- **模型**: `qwen-turbo` (快速响应，成本低)
- **配置文件**: `backend/src/main/resources/application-secret.properties`

### 模型对比

| 模型 | 特点 | 适用场景 | 成本 |
|-----|------|---------|------|
| **qwen-turbo** | 快速响应 | 日常对话、简单生成 | 💰 低 |
| **qwen-plus** | 平衡性能 | 通用场景 | 💰💰 中 |
| **qwen-max** | 最高质量 | 复杂任务、长文本 | 💰💰💰 高 |

---

## 🚀 使用示例

### 1. 在代码中调用

项目已经在以下服务中集成了 Qwen API：

#### AIGenerationServiceImpl.java
```java
@Service
public class AIGenerationServiceImpl {
    
    @Value("${ai.api-key}")
    private String apiKey;  // 自动注入：sk-8b5df7e3d85442fd8e4ddb7c5204da48
    
    @Value("${ai.model}")
    private String modelName;  // 自动注入：qwen-turbo
    
    private String callLLM(String systemPrompt, String userPrompt) {
        Generation gen = new Generation();
        Message systemMsg = Message.builder()
            .role(Role.SYSTEM.getValue())
            .content(systemPrompt)
            .build();
        Message userMsg = Message.builder()
            .role(Role.USER.getValue())
            .content(userPrompt)
            .build();

        GenerationParam param = GenerationParam.builder()
            .apiKey(apiKey)          // ← 使用你的 API Key
            .model(modelName)        // ← 使用 qwen-turbo
            .messages(Arrays.asList(systemMsg, userMsg))
            .resultFormat(GenerationParam.ResultFormat.MESSAGE)
            .build();

        GenerationResult result = gen.call(param);
        return result.getOutput().getChoices().get(0).getMessage().getContent();
    }
}
```

### 2. 前端调用 AI 功能

所有 AI 功能都已自动连接到 Qwen API：

```javascript
// 生成语法练习
await api.generateGrammar({
  topic: '时态',
  difficulty: 'medium'
})
// → 后端会调用 Qwen API 生成真实题目

// AI Tutor 对话
await api.chatWithTutor({
  question: '为什么这里用 has been？',
  context: { ... }
})
// → 后端会调用 Qwen API 回答问题
```

---

## 🔧 如何切换模型？

如果想使用不同的模型，只需修改 `application-secret.properties`：

```properties
# 使用 qwen-plus（更好的质量）
ai.model=qwen-plus

# 使用 qwen-max（最高质量，但成本更高）
ai.model=qwen-max
```

**重启后端即可生效！**

---

## ⚠️ 安全提示

1. **不要提交 API Key 到 Git**
   - `application-secret.properties` 已在 `.gitignore` 中
   - 确保不要意外提交

2. **API Key 安全**
   - 只保存在后端配置文件
   - 前端永远不会看到 API Key
   - 只有服务器可以调用 Qwen API

3. **配额监控**
   - 定期检查阿里云控制台的配额使用情况
   - 可以在代码中添加限流保护（已有 `@RateLimit` 注解）

---

## 📊 API 调用流程

```
用户操作前端
    ↓
Vue.js 发送 HTTP 请求
    ↓
Java 后端接收请求
    ↓
后端使用 API Key 调用 Qwen API
    ↓ (qwen-turbo)
通义千问返回结果
    ↓
后端处理并返回给前端
    ↓
前端展示结果
```

---

## ✅ 测试 API 是否可用

启动后端后，访问任何 AI 生成功能：

1. **语法练习** - `/grammar` 页面
2. **阅读理解** - `/reading` 页面  
3. **AI Tutor** - 点击右下角浮动按钮

如果能看到真实的 AI 生成内容（不是 Mock 数据），说明配置成功！

---

## 📝 已集成 Qwen 的服务

| 服务 | 文件 | 功能 |
|-----|------|------|
| AI 生成服务 | `AIGenerationServiceImpl.java` | 语法、阅读、写作、听力、口语生成 |
| AI Tutor | `AITutorServiceImpl.java` | 智能对话答疑 |
| 模拟考试 | `MockExamServiceImpl.java` | 考试试卷生成 |

---

**配置完成时间**: 2026-01-21 00:00  
**API 提供商**: 阿里云通义千问 (DashScope)  
**模型**: qwen-turbo  
**状态**: ✅ 已就绪
