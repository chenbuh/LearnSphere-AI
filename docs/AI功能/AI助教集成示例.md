# AI Tutor 扩展功能集成示例

## 在 GrammarView 中集成薄弱点追踪和AI建议

本示例展示如何在语法练习页面集成新的 AI Tutor 扩展功能。

```vue
<template>
  <div class="grammar-view">
    <!-- 题目内容 -->
    <n-card class="question-card">
      <h3>{{ currentQuestion.text }}</h3>
      
      <!-- 选项 -->
      <div class="options">
        <div 
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          @click="selectOption(idx)"
          :class="['option', getOptionClass(idx)]"
        >
          {{ option }}
        </div>
      </div>
      
      <!-- 解析（答题后显示） -->
      <div v-if="isAnswered" class="explanation">
        <n-alert 
          :type="isCorrect ? 'success' : 'error'"
          :title="isCorrect ? '✅ 回答正确!' : '❌ 回答错误'"
        >
          <p>{{ currentQuestion.explanation }}</p>
        </n-alert>

        <!-- 相关知识点推荐 -->
        <div v-if="relatedTopics.length > 0" class="related-topics">
          <h4>📚 相关知识点</h4>
          <div class="topics-grid">
            <n-tag
              v-for="topic in relatedTopics"
              :key="topic.id"
              type="info"
              style="cursor: pointer"
              @click="learnTopic(topic)"
            >
              {{ topic.topic }} (难度: {{ topic.difficultyLevel }}/5)
            </n-tag>
          </div>
        </div>
        
        <!-- AI Tutor 入口 -->
        <n-button 
          @click="openAITutor" 
          type="primary"
          ghost
          style="margin-top: 16px"
        >
          <template #icon>
            <n-icon :component="MessageCircle" />
          </template>
          还有疑问？问问 AI 助手
        </n-button>
      </div>
    </n-card>
    
    <!-- 个性化学习建议卡片 -->
    <n-card 
      v-if="learningAdvice" 
      class="advice-card"
      title="💡 AI 学习建议"
    >
      <p>{{ learningAdvice }}</p>
    </n-card>

    <!-- AI Tutor 组件（带历史记录） -->
    <AITutorEnhanced
      v-model:show="showTutor"
      :context="tutorContext"
      :session-id="tutorSessionId"
      @session-created="handleSessionCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NCard, NButton, NIcon, NAlert, NTag, useMessage } from 'naive-ui'
import { MessageCircle } from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import AITutorEnhanced from '@/components/AITutorEnhanced.vue'

const message = useMessage()

// 题目状态
const currentQuestion = ref({
  text: 'By the time he arrives, we ______ having dinner.',
  options: ['will finish', 'will have finished', 'are finishing', 'have finished'],
  correct: 1,
  explanation: "'By the time' 引导的时间状语从句通常与将来完成时连用。",
  topic: '时态',
  subTopic: '将来完成时'
})

const selectedAnswer = ref(null)
const isAnswered = ref(false)
const isCorrect = ref(false)
const showTutor = ref(false)
const tutorSessionId = ref(null)
const learningAdvice = ref(null)
const relatedTopics = ref([])

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

// 选择答案
async function selectOption(idx) {
  if (isAnswered.value) return
  
  selectedAnswer.value = idx
  isAnswered.value = true
  isCorrect.value = idx === currentQuestion.value.correct

  // 🎯 核心功能1: 记录答题情况到薄弱点系统
  await recordAnswerToWeaknessSystem()

  // 🎯 核心功能2: 如果答错,获取相关知识点
  if (!isCorrect.value) {
    await loadRelatedTopics()
  }

  // 🎯 核心功能3: 如果该知识点正确率低,获取学习建议
  await checkAndLoadLearningAdvice()
}

// 记录答题到薄弱点系统
async function recordAnswerToWeaknessSystem() {
  try {
    await aiApi.recordPractice({
      topic: currentQuestion.value.subTopic || currentQuestion.value.topic,
      category: 'grammar',
      isCorrect: isCorrect.value
    })
    
    console.log(`✅ 已记录: ${currentQuestion.value.subTopic} - ${isCorrect.value ? '正确' : '错误'}`)
  } catch (error) {
    console.error('Failed to record practice:', error)
  }
}

// 加载相关知识点
async function loadRelatedTopics() {
  try {
    const res = await aiApi.getRelatedTopics(currentQuestion.value.subTopic || currentQuestion.value.topic)
    if (res.code === 200) {
      relatedTopics.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load related topics:', error)
  }
}

// 检查并加载学习建议
async function checkAndLoadLearningAdvice() {
  // 如果答对了,不需要建议
  if (isCorrect.value) return

  try {
    const res = await aiApi.getLearningAdvice(currentQuestion.value.subTopic || currentQuestion.value.topic)
    if (res.code === 200 && res.data) {
      learningAdvice.value = res.data
    }
  } catch (error) {
    console.error('Failed to load learning advice:', error)
  }
}

// 获取选项样式
function getOptionClass(idx) {
  if (!isAnswered.value) {
    return selectedAnswer.value === idx ? 'selected' : ''
  }
  
  if (idx === currentQuestion.value.correct) {
    return 'correct'
  }
  
  if (idx === selectedAnswer.value && !isCorrect.value) {
    return 'wrong'
  }
  
  return ''
}

// 打开 AI Tutor
function openAITutor() {
  showTutor.value = true
}

// 处理会话创建
function handleSessionCreated(sessionId) {
  tutorSessionId.value = sessionId
  console.log('AI Tutor session created:', sessionId)
}

// 学习某个知识点
function learnTopic(topic) {
  message.info(`正在跳转到「${topic.topic}」的学习页面...`)
  // 这里可以导航到相应的学习页面
}
</script>

<style scoped>
.grammar-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.question-card {
  margin-bottom: 20px;
}

.question-card h3 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #f9fafb;
}

.options {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.option {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #d1d5db;
}

.option:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
}

.option.selected {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.option.correct {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
  color: #10b981;
}

.option.wrong {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #ef4444;
}

.related-topics {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.related-topics h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #f9fafb;
}

.topics-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.advice-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.advice-card p {
  color: #d1d5db;
  line-height: 1.8;
  margin: 0;
}
</style>
```

## AITutorEnhanced 组件（带历史记录版）

创建一个增强版的 AI Tutor 组件,支持对话历史:

```vue
<template>
  <div class="ai-tutor-enhanced" v-show="show">
    <AITutor
      :context="context"
      :auto-open="show"
      :enable-history="true"
      :session-id="sessionId"
      @close="handleClose"
      @message-sent="handleMessageSent"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import AITutor from './AITutor.vue'

const props = defineProps({
  show: Boolean,
  context: Object,
  sessionId: String
})

const emit = defineEmits(['update:show', 'session-created'])

const internalSessionId = ref(props.sessionId)

function handleClose() {
  emit('update:show', false)
}

function handleMessageSent(data) {
  // 如果服务器返回了新的 sessionId,保存它
  if (data.sessionId && !internalSessionId.value) {
    internalSessionId.value = data.sessionId
    emit('session-created', data.sessionId)
  }
}

watch(() => props.sessionId, (newVal) => {
  internalSessionId.value = newVal
})
</script>
```

---

## 集成效果

### 答对题目时:
```
✅ 回答正确!
官方解析: 'By the time' 引导的时间状语从句...

[还有疑问？问问 AI 助手]
```

### 答错题目时:
```
❌ 回答错误
官方解析: 'By the time' 引导的时间状语从句...

📚 相关知识点
[现在完成时 (难度3/5)] [过去完成时 (难度4/5)]

💡 AI 学习建议
你在"将来完成时"这个知识点上的正确率较低（当前45%）。
建议重点复习 by the time 等时间标志词的用法...

[还有疑问？问问 AI 助手]
```

---

## 数据流程

```
用户答题
   ↓
recordPractice() → 后端更新统计
   ↓
检查正确率 < 60%?
   ↓ Yes
生成 AI 学习建议 → 显示给用户
   ↓
用户点击"问 AI"
   ↓
打开 AI Tutor (带历史记录)
   ↓
所有对话保存到数据库
```

---

这样,每次用户做题都会:
1. ✅ 自动记录到薄弱点系统
2. ✅ 实时更新正确率
3. ✅ 提供个性化学习建议
4. ✅ 推荐相关知识点
5. ✅ 支持完整的对话历史

真正实现了**智能化、个性化**的学习体验!🎉
