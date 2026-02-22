# AI Tutor 智能会话助手 - 使用指南

## 🤖 功能概述

AI Tutor 是一个浮动的智能学习助手，可以实时回答用户关于题目的疑问，实现真正的**交互式学习**。

### 核心特性

✅ **上下文感知** - 知道当前正在做哪道题  
✅ **智能对话** - 基于通义千问的专业解答  
✅ **快捷提问** - 预设常见问题，一键发送  
✅ **对话历史** - 保留聊天记录，方便回顾  
✅ **浮动窗口** - 不遮挡主内容，可展开/折叠  

---

## 📋 使用场景

### 1. 语法练习中的疑问

**场景**：用户做完一道语法题，看了官方解析还是不理解。

```
题目: By the time he arrives, we ______ having dinner.
A. will finish
B. will have finished  ✓
C. are finishing
D. have finished

官方解析: 'By the time' 引导的时间状语从句通常与将来完成时连用。
```

**用户提问**：
- "为什么用 will have finished 而不是 will finish？"
- "将来完成时是什么？能再举个例子吗？"
- "怎么判断什么时候用完成时？"

**AI Tutor 回答**：
> 这道题考查的是"将来完成时"，它表示在将来某个时间点之前已经完成的动作。
> 
> **为什么用 B (will have finished)？**
> - "By the time he arrives"（在他到达之前）是一个将来的时间点
> - 我们吃晚饭这个动作会在他到达之前就结束了
> - 所以要用"将来完成时"：will have + 过去分词
> 
> **再举个例子**：
> - "By next week, I will have read three books."
> - （到下周之前，我就已经读完三本书了）
> 
> **判断技巧**：
> - 看到 "by the time", "by next...", "before..." 等词，且动作发生在将来某个时间点之前，就用将来完成时！

---

### 2. 阅读理解中的难句

**场景**：文章中有一句长难句看不懂。

**用户提问**：
- "这句话的主语是什么？"
- "为什么这里用 which 而不是 that？"

---

### 3. 写作批改后的改进

**场景**：AI 批改了作文，指出某句话有语法错误。

**用户提问**：
- "为什么我这句话是错的？"
- "应该怎么改？"
- "类似的句子应该怎么写？"

---

## 🎯 如何在视图中使用

### 在 GrammarView 中集成

```vue
<template>
  <div class="grammar-view">
    <!-- 题目内容 -->
    <div class="question-container">
      <!-- ... 题目和选项 ... -->
      
      <!-- 解析卡片 -->
      <div v-if="isAnswered" class="explanation-card">
        <p>{{ currentQuestion.explanation }}</p>
        
        <!-- 快速打开 AI Tutor 按钮 -->
        <n-button @click="openAITutor" size="small" type="primary">
          <template #icon>
            <n-icon :component="MessageCircle" />
          </template>
          还是不理解？问问 AI 助手
        </n-button>
      </div>
    </div>
    
    <!-- AI Tutor 组件 -->
    <AITutor 
      :context="tutorContext" 
      :auto-open="showTutor"
      @close="showTutor = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AITutor from '@/components/AITutor.vue'
import { MessageCircle } from 'lucide-vue-next'

const showTutor = ref(false)
const currentQuestion = ref({ /* ... */ })
const isAnswered = ref(false)
const selectedAnswer = ref(null)

// 构建 AI Tutor 上下文
const tutorContext = computed(() => {
  if (!currentQuestion.value) return null
  
  return {
    question: currentQuestion.value.text,
    options: currentQuestion.value.options,
    correctAnswer: currentQuestion.value.options[currentQuestion.value.correct],
    userAnswer: selectedAnswer.value !== null 
      ? currentQuestion.value.options[selectedAnswer.value] 
      : null,
    explanation: currentQuestion.value.explanation,
    topic: currentQuestion.value.topic || '语法'
  }
})

// 打开 AI Tutor
function openAITutor() {
  showTutor.value = true
}
</script>
```

---

### 在 ReadingView 中集成

```vue
<template>
  <div class="reading-view">
    <!-- 文章和题目 -->
    <div class="article-content">{{ article.content }}</div>
    
    <!-- AI Tutor -->
    <AITutor 
      :context="{
        article: article.content,
        question: currentQuestion.text,
        correctAnswer: currentQuestion.correctAnswer,
        userAnswer: userAnswer,
        explanation: currentQuestion.explanation
      }"
    />
  </div>
</template>
```

---

## 🎨 UI 交互流程

```
1. 用户做题 → 看解析 → 不理解
         ↓
2. 点击右下角浮动按钮 (绿色圆形，带 💬 图标)
         ↓
3. 弹出对话窗口
         ↓
4. 看到快捷提问按钮：
   - "为什么我的答案是错的？"
   - "请详细解释一下正确答案"
   - "这个语法点还有其他例句吗？"
   - "如何避免再犯类似的错误？"
         ↓
5. 点击快捷提问 或 输入自己的问题
         ↓
6. AI 实时回复（带打字机效果）
         ↓
7. 可以继续追问，形成对话
```

---

## 🔧 技术实现细节

### 前端组件架构

```
AITutor.vue
├── 浮动按钮 (FAB)
│   ├── 未读消息角标
│   └── 点击展开窗口
│
├── 对话窗口 (Panel)
│   ├── 头部 (Header)
│   │   ├── AI 头像 + 在线状态
│   │   ├── 最小化/关闭按钮
│   │   └── 当前上下文提示
│   │
│   ├── 消息区域 (Messages)
│   │   ├── 欢迎消息
│   │   ├── 用户消息（蓝色气泡）
│   │   ├── AI 消息（绿色气泡）
│   │   └── 正在输入提示
│   │
│   ├── 快捷提问（Chips）
│   │   └── 根据上下文动态生成
│   │
│   └── 输入框 (Input)
│       ├── 多行文本框
│       ├── 发送按钮
│       └── Enter 发送快捷键
```

### 后端 API

**请求**:
```json
POST /api/ai/tutor/chat
{
  "question": "为什么这里用 has been 而不是 was？",
  "context": {
    "question": "The project ______ completed for two weeks.",
    "options": ["has been", "was", "is", "will be"],
    "correctAnswer": "has been",
    "userAnswer": "was",
    "explanation": "现在完成时表示从过去持续到现在",
    "topic": "时态"
  }
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "answer": "这道题要用 has been 是因为...",
    "timestamp": 1705766400000
  }
}
```

### AI Prompt 工程

系统会构建一个包含完整上下文的提示词：

```
你是一个专业的英语学习助手，擅长用通俗易懂的方式解释语法知识。

当前题目信息：
题目：The project ______ completed for two weeks.
选项：["has been", "was", "is", "will be"]
学生的答案：was
正确答案：has been
官方解析：现在完成时表示从过去持续到现在
语法点：时态

回答要求：
1. 用简单易懂的语言解释，避免过于学术化的术语
2. 结合具体例句说明
3. 如果学生答错了，解释为什么错误答案是错的
4. 提供记忆技巧或规律总结
5. 回答要简洁，控制在 200 字以内
6. 使用友好、鼓励的语气
```

---

## 🎯 快捷提问自动生成

根据不同场景，AI Tutor 会推荐不同的快捷问题：

### 答错题时
```javascript
[
  "为什么我的答案是错的？",
  "正确答案为什么是对的？",
  "如何避免再犯类似的错误？"
]
```

### 答对题时
```javascript
[
  "这个语法点还有其他例句吗？",
  "有没有类似的易错点？",
  "请总结一下这个知识点"
]
```

### 阅读理解
```javascript
[
  "这句话的主干是什么？",
  "这个词在这里是什么意思？",
  "文章的逻辑结构是怎样的？"
]
```

---

## 📊 用户体验优化

### 1. 视觉反馈
- ✅ 浮动按钮：绿色渐变，hover 放大
- ✅ 未读消息：红色角标提示
- ✅ 正在输入：三点跳动动画
- ✅ 消息气泡：用户蓝色 / AI 绿色

### 2. 交互优化
- ✅ 自动滚动：新消息自动滚到底部
- ✅ Enter 发送：支持快捷键
- ✅ 可拖拽：窗口位置可调整（未来）
- ✅ 历史记录：刷新页面保留对话

### 3. 移动端适配
- ✅ 响应式布局
- ✅ 浮动按钮位置调整
- ✅ 全屏对话窗口（小屏幕）

---

## 🚀 扩展功能（未来）

### 1. 语音交互
- 语音提问（Speech to Text）
- AI 朗读回答（Text to Speech）

### 2. 知识图谱
- 关联知识点推荐
- 构建个人错题知识库

### 3. 多轮对话优化
- 保存对话历史到数据库
- 跨题目的对话上下文

### 4. 个性化助手
- 记录用户薄弱点
- 针对性推荐复习内容

---

## 📝 代码示例

### 完整集成示例（GrammarView）

```vue
<template>
  <div class="grammar-view">
    <!-- 题目区域 -->
    <n-card class="question-card">
      <h3>{{ currentQuestion.text }}</h3>
      
      <!-- 选项 -->
      <div class="options">
        <div 
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          @click="selectOption(idx)"
        >
          {{ option }}
        </div>
      </div>
      
      <!-- 解析（答题后显示） -->
      <div v-if="isAnswered" class="explanation">
        <p>{{ currentQuestion.explanation }}</p>
        
        <!-- AI Tutor 入口 -->
        <n-button 
          @click="openAITutor" 
          type="primary"
          ghost
        >
          <template #icon>
            <n-icon :component="MessageCircle" />
          </template>
          还有疑问？问问 AI 助手
        </n-button>
      </div>
    </n-card>
    
    <!-- AI Tutor 组件 -->
    <AITutor 
      :context="tutorContext"
      :auto-open="showTutor"
      @close="showTutor = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { NCard, NButton, NIcon } from 'naive-ui'
import { MessageCircle } from 'lucide-vue-next'
import AITutor from '@/components/AITutor.vue'

// 状态
const currentQuestion = ref({
  text: 'By the time he arrives, we ______ having dinner.',
  options: ['will finish', 'will have finished', 'are finishing', 'have finished'],
  correct: 1,
  explanation: "'By the time' 引导的时间状语从句通常与将来完成时连用。",
  topic: '时态'
})

const selectedAnswer = ref(null)
const isAnswered = ref(false)
const showTutor = ref(false)

// AI Tutor 上下文
const tutorContext = computed(() => ({
  question: currentQuestion.value.text,
  options: currentQuestion.value.options,
  correctAnswer: currentQuestion.value.options[currentQuestion.value.correct],
  userAnswer: selectedAnswer.value !== null 
    ? currentQuestion.value.options[selectedAnswer.value]
    : null,
  explanation: currentQuestion.value.explanation,
  topic: currentQuestion.value.topic
}))

// 方法
function selectOption(idx) {
  selectedAnswer.value = idx
  isAnswered.value = true
}

function openAITutor() {
  showTutor.value = true
}
</script>
```

---

## 🎉 总结

AI Tutor 将 LearnSphere AI 从"单向学习"升级为"交互式学习"：

**Before**:
```
做题 → 看解析 → 不懂 → 只能放弃或自己查 ❌
```

**After**:
```
做题 → 看解析 → 不懂 → 问 AI Tutor → 理解 ✅
                         ↓
                      继续追问直到完全理解 ✅
```

这是真正的**智能化学习体验**！🚀

---

**功能完成时间**: 2026-01-20  
**版本**: v2.5.0  
**作者**: LearnSphere Team
