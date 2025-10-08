# AI Tutor 扩展功能实现指南

## 🎉 新功能总览

本次更新为 AI Tutor 智能助手添加了以下扩展功能:

### ✅ 已实现功能

1. **多轮对话优化**
   - ✅ 保存对话历史到数据库
   - ✅ 跨题目的对话上下文
   - ✅ 会话管理(通过 sessionId)

2. **个性化助手**
   - ✅ 记录用户薄弱点
   - ✅ 智能统计正确率
   - ✅ AI 生成个性化学习建议
   - ✅ 针对性推荐复习内容

3. **知识图谱**
   - ✅ 关联知识点推荐
   - ✅ 前置/后续知识点链接
   - ✅ 难度分级体系

### 🚧 待实现功能(未来)

4. **语音交互**
   - ⏳ 语音提问(Speech to Text)
   - ⏳ AI 朗读回答(Text to Speech)

---

## 📊 数据库表结构

### 1. ai_tutor_conversation - 对话历史表

保存所有 AI Tutor 的对话记录。

```sql
CREATE TABLE `ai_tutor_conversation` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `session_id` VARCHAR(64) NOT NULL,  -- 会话ID
  `role` VARCHAR(20) NOT NULL,         -- user/assistant
  `content` TEXT NOT NULL,             -- 消息内容
  `context_info` TEXT,                 -- 题目上下文(JSON)
  `topic` VARCHAR(100),                -- 关联知识点
  `resolved` TINYINT(1) DEFAULT 0,     -- 是否已解决
  `feedback` VARCHAR(20),              -- 用户反馈
  `create_time` DATETIME,
  `update_time` DATETIME,
  `deleted` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_session_id` (`session_id`)
);
```

### 2. user_weakness - 用户薄弱知识点表

记录用户在各知识点的掌握情况。

```sql
CREATE TABLE `user_weakness` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `topic` VARCHAR(100) NOT NULL,       -- 知识点名称
  `category` VARCHAR(50) NOT NULL,     -- 类别(grammar/reading等)
  `error_count` INT DEFAULT 0,         -- 错误次数
  `total_count` INT DEFAULT 0,         -- 总练习次数
  `accuracy` DECIMAL(5,2) DEFAULT 0,   -- 正确率(%)
  `last_practice_time` DATETIME,       -- 最近练习时间
  `needs_review` TINYINT(1) DEFAULT 0, -- 是否需要复习
  `review_priority` INT DEFAULT 0,     -- 复习优先级(1-10)
  `ai_suggestion` TEXT,                -- AI学习建议
  `create_time` DATETIME,
  `update_time` DATETIME,
  `deleted` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_topic` (`user_id`, `topic`, `deleted`)
);
```

### 3. knowledge_graph - 知识图谱表

构建知识点之间的关联关系。

```sql
CREATE TABLE `knowledge_graph` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `topic` VARCHAR(100) NOT NULL,       -- 知识点名称
  `category` VARCHAR(50) NOT NULL,     -- 类别
  `related_topics` TEXT,               -- 关联知识点(JSON数组)
  `prerequisite_topics` TEXT,          -- 前置知识点(JSON数组)
  `next_topics` TEXT,                  -- 后续知识点(JSON数组)
  `difficulty_level` INT DEFAULT 1,    -- 难度级别(1-5)
  `description` TEXT,                  -- 知识点描述
  `common_mistakes` TEXT,              -- 常见易错点(JSON数组)
  `recommended_resources` TEXT,        -- 推荐资源(JSON数组)
  `create_time` DATETIME,
  `update_time` DATETIME,
  `deleted` INT DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_topic` (`topic`, `deleted`)
);
```

---

## 🔌 后端 API 接口

### 1. 对话相关

#### POST /api/ai/tutor/chat/history
带历史记录的对话接口

**请求体:**
```json
{
  "sessionId": "uuid-string",  // 可选,不传则自动生成
  "question": "为什么这里用现在完成时?",
  "context": {
    "question": "题目文本",
    "topic": "时态",
    "correctAnswer": "has been",
    "userAnswer": "was"
  }
}
```

**响应:**
```json
{
  "code": 200,
  "data": {
    "answer": "AI 的回答内容",
    "sessionId": "uuid-string",
    "timestamp": 1705766400000
  }
}
```

#### GET /api/ai/tutor/history/{sessionId}
获取对话历史

**响应:**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "role": "user",
      "content": "用户的问题",
      "topic": "时态",
      "createTime": "2024-01-21 10:00:00"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "AI 的回答",
      "topic": "时态",
      "createTime": "2024-01-21 10:00:05"
    }
  ]
}
```

### 2. 薄弱点分析

#### GET /api/ai/tutor/weaknesses
获取用户薄弱知识点

**参数:**
- `needsReview` (可选): true/false,是否只获取需要复习的

**响应:**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "topic": "虚拟语气",
      "category": "grammar",
      "accuracy": 45.5,
      "errorCount": 6,
      "totalCount": 11,
      "needsReview": true,
      "reviewPriority": 8,
      "aiSuggestion": "你在虚拟语气上的掌握还需要加强..."
    }
  ]
}
```

#### GET /api/ai/tutor/review-suggestions
获取个性化复习建议

**参数:**
- `limit`: 建议数量(默认5)

#### POST /api/ai/tutor/record-practice
记录答题情况

**请求体:**
```json
{
  "topic": "时态",
  "category": "grammar",
  "isCorrect": false
}
```

### 3. 知识图谱

#### GET /api/ai/tutor/related-topics
获取相关知识点推荐

**参数:**
- `topic`: 当前知识点名称

**响应:**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "topic": "现在完成时",
      "category": "grammar",
      "difficultyLevel": 3,
      "description": "表示过去发生的动作对现在造成的影响",
      "relatedTopics": "[\"过去完成时\", \"时态\"]",
      "prerequisiteTopics": "[\"时态\", \"过去分词\"]"
    }
  ]
}
```

#### GET /api/ai/tutor/learning-advice
为用户生成 AI 学习建议

**参数:**
- `topic`: 知识点名称

---

## 💻 前端使用示例

### 1. 在 GrammarView 中自动记录答题情况

```vue
<script setup>
import { aiApi } from '@/api/ai'

async function checkAnswer(selectedAnswer) {
  const isCorrect = selectedAnswer === currentQuestion.value.correct
  
  // 记录答题情况到薄弱点系统
  try {
    await aiApi.recordPractice({
      topic: currentQuestion.value.topic || '语法',
      category: 'grammar',
      isCorrect
    })
  } catch (error) {
    console.error('Failed to record practice:', error)
  }
  
  // ... 其他逻辑
}
</script>
```

### 2. 使用带历史的对话功能

```vue
<script setup>
import { ref } from 'vue'
import { aiApi } from '@/api/ai'

const sessionId = ref(null)

async function askQuestion(question) {
  const response = await aiApi.chatWithHistory({
    sessionId: sessionId.value,  // 首次为 null,后续使用返回的 sessionId
    question,
    context: tutorContext.value
  })
  
  if (response.code === 200) {
    sessionId.value = response.data.sessionId  // 保存 sessionId 用于后续对话
    return response.data.answer
  }
}

// 查看历史对话
async function viewHistory() {
  if (!sessionId.value) return
  
  const history = await aiApi.getConversationHistory(sessionId.value)
  console.log(history.data)
}
</script>
```

### 3. 显示薄弱点分析

使用新创建的 `WeaknessAnalysis.vue` 组件:

```vue
<!-- 在路由中添加 -->
{
  path: '/weakness-analysis',
  name: 'WeaknessAnalysis',
  component:() => import('@/views/WeaknessAnalysis.vue')
}
```

---

## 🎯 使用场景

### 场景 1: 语法练习中自动分析薄弱点

用户每做一道语法题,系统自动:
1. 记录答题情况(`recordPractice`)
2. 更新正确率统计
3. 当正确率 < 60% 时,自动生成 AI 学习建议
4. 标记为"需要复习"

### 场景 2: 查看个性化复习建议

用户进入"学习分析"页面:
1. 显示优先级最高的 5 个薄弱知识点
2. 每个知识点显示 AI 生成的学习建议
3. 可以查看相关知识点推荐
4. 点击"AI 建议"获取更详细的指导

### 场景 3: 知识图谱导航

用户学习"虚拟语气"遇到困难:
1. 系统推荐前置知识点:"条件句"、"时态"
2. 显示相关知识点:"混合虚拟语气"
3. 推荐后续学习内容
4. 帮助用户构建完整的知识体系

---

## 📦 部署步骤

### 1. 数据库迁移

执行 SQL 脚本创建新表:

```bash
mysql -u root -p learnsphere_ai < backend/src/main/resources/sql/ai_tutor_enhancement.sql
```

### 2. 重新编译后端

```bash
cd backend
mvn clean package -DskipTests
```

### 3. 重启服务

```bash
java -jar target/learnsphere-ai-backend-1.0.0.jar
```

### 4. 前端无需额外操作

新的 API 已自动集成到 `src/api/ai.js`

---

## ⚡ 性能优化建议

1. **对话历史定期清理**
   - 建议保留最近 30 天的对话记录
   - 可通过定时任务清理过期数据

2. **知识图谱缓存**
   - knowledge_graph 表数据相对固定
   - 可使用 Redis 缓存提高查询速度

3. **薄弱点统计异步化**
   - `recordPractice` 操作可异步执行
   - 避免影响答题流程的响应速度

---

## 🔮 未来扩展方向

### 语音交互(计划中)

1. **前端语音识别**
   - 集成 Web Speech API
   - 用户可以说出问题

2. **AI 语音回复**
   - 调用文字转语音 API
   - 播放 AI 的回答

3. **实现示例**
```javascript
// Speech to Text
const recognition = new webkitSpeechRecognition()
recognition.onresult = (event) => {
  const question = event.results[0][0].transcript
  askQuestion(question)
}

// Text to Speech
const utterance = new SpeechSynthesisUtterance(aiAnswer)
speechSynthesis.speak(utterance)
```

---

## 📝 总结

本次更新实现了 AI Tutor 的三大核心扩展功能:

✅ **多轮对话优化** - 完整的对话历史管理  
✅ **个性化助手** - 智能分析薄弱点并给出建议  
✅ **知识图谱** - 构建知识点关联网络

这些功能将 LearnSphere AI 从"单向学习"真正升级为"智能化个性化学习系统"！

---

**实现时间**: 2026-01-21  
**版本**: v3.0.0  
**作者**: LearnSphere Team
