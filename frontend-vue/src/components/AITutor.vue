<template>
  <div class="ai-tutor-wrapper">
    <!-- 折叠状态：浮动按钮 -->
    <transition name="bounce">
      <div
        v-if="!isExpanded"
        class="ai-tutor-fab"
        @click="toggleExpand"
      >
        <n-icon :component="MessageCircle" size="24" />
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </div>
    </transition>

    <!-- 展开状态：对话窗口 -->
    <transition name="slide-up">
      <div v-if="isExpanded" class="ai-tutor-panel">
        <!-- 头部 -->
        <div class="tutor-header">
          <div class="header-left">
            <n-icon :component="Bot" size="20" color="#10b981" />
            <span class="header-title">AI 学习助手</span>
            <n-tag size="tiny" type="success" :bordered="false">在线</n-tag>
          </div>
          <div class="header-actions">
            <!-- 历史记录按钮 -->
            <n-icon
              :component="History"
              size="18"
              class="action-icon"
              title="对话历史"
              @click="showHistory = !showHistory"
            />
            <!-- 学习进度按钮 -->
            <n-icon
              :component="Target"
              size="18"
              class="action-icon"
              title="学习进度"
              @click="showProgress = !showProgress"
            />
            <n-icon
              :component="Minimize2"
              size="18"
              class="action-icon"
              title="最小化"
              @click="toggleExpand"
            />
            <n-icon
              :component="X"
              size="18"
              class="action-icon close-icon"
              title="关闭"
              @click="close"
            />
          </div>
        </div>

        <!-- 上下文提示（当前题目信息） -->
        <div v-if="context" class="context-hint">
          <n-icon :component="Info" size="14" />
          <span v-if="context.module === 'vocabulary' && context.word">
            正在学习：<strong style="color:#10b981">{{ context.word }}</strong>
            <span v-if="context.meaning" style="color:#9ca3af"> · {{ context.meaning }}</span>
          </span>
          <span v-else>正在讨论：{{ context.topic || '当前题目' }}</span>
        </div>

        <!-- 对话历史侧边栏 -->
        <transition name="slide-right">
          <div v-if="showHistory" class="history-sidebar">
            <ConversationHistory
              :messages="messages"
              @review="handleReviewMessage"
              @delete="handleDeleteMessage"
              @clear="handleClearHistory"
            />
          </div>
        </transition>

        <!-- 学习进度面板 -->
        <transition name="slide-up-panel">
          <div v-if="showProgress" class="progress-panel">
            <LearningProgress
              :goals="learningGoals"
              :progress="sessionProgress"
              :session-time="sessionTime"
              :streak="learningStreak"
              :total-x-p="totalXP"
              @complete-milestone="handleCompleteMilestone"
            />
          </div>
        </transition>

        <!-- 对话消息区域 -->
        <div
          class="chat-messages"
          :class="{ 'with-history': showHistory }"
          ref="messagesContainer"
        >
          <div v-if="messages.length === 0" class="empty-state">
            <n-icon :component="MessageSquare" size="48" color="#6b7280" />
            <p>👋 你好！我是你的 AI 学习助手</p>
            <p class="hint">有任何不理解的语法点，随时问我！</p>
          </div>

          <div
            v-for="(msg, index) in messages"
            :key="msg.id || index"
            :class="['message', msg.role, { reviewed: msg.reviewed }]"
          >
            <div class="message-avatar">
              <n-icon
                :component="msg.role === 'user' ? User : Bot"
                size="20"
                :color="msg.role === 'user' ? '#3b82f6' : '#10b981'"
              />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
              <div class="message-meta">
                <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
                <span v-if="msg.reviewed" class="review-badge">
                  <n-icon :component="CheckCircle" size="12" />
                  已回顾
                </span>
              </div>
            </div>
            <!-- 消息操作 -->
            <div class="message-actions">
              <n-button
                text
                size="tiny"
                @click="handleReviewMessage(msg, index)"
                :disabled="msg.reviewed"
              >
                <template #icon>
                  <n-icon :component="Eye" size="14" />
                </template>
              </n-button>
            </div>
          </div>

          <!-- AI 流式回复 -->
          <div v-if="isTyping && streamingContent" class="message assistant">
            <div class="message-avatar">
              <n-icon :component="Bot" size="20" color="#10b981" />
            </div>
            <div class="streaming-bubble">
              <div class="streaming-text" v-html="formatMessage(streamingContent)"></div>
              <span class="stream-cursor">|</span>
            </div>
          </div>

          <!-- AI 正在输入（加载动画） -->
          <div v-if="isTyping && !streamingContent" class="message assistant">
            <div class="message-avatar">
              <n-icon :component="Bot" size="20" color="#10b981" />
            </div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- 快捷回复 -->
        <QuickReplies
          v-if="!isTyping"
          :context="context"
          :allow-custom="true"
          @select="handleQuickReply"
        />

        <!-- 输入框 -->
        <div class="chat-input" style="display: flex; gap: 8px; align-items: flex-end;">
          <n-input
            v-model:value="userInput"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 3 }"
            placeholder="问我任何关于这道题的问题..."
            @keydown.enter.prevent="handleSend"
            style="flex: 1;"
          />
          <VoiceInput
            v-model="userInput"
            @submit="handleSend"
            size="medium"
            :icon-size="18"
            :auto-submit="false"
            :show-status="false"
          />
          <n-button
            type="primary"
            :loading="isTyping"
            :disabled="!userInput.trim()"
            @click="handleSend"
            circle
          >
            <template #icon>
              <n-icon :component="Send" />
            </template>
          </n-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { NIcon, NButton, NInput, NTag, useMessage } from 'naive-ui'
import {
  MessageCircle, Bot, User, Send, X, Minimize2,
  Info, MessageSquare, History, Target, Eye, CheckCircle
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
import StreamingResponse from './StreamingResponse.vue'
import ConversationHistory from './ConversationHistory.vue'
import LearningProgress from './LearningProgress.vue'
import QuickReplies from './QuickReplies.vue'
import VoiceInput from './VoiceInput.vue'
import { useVocabularyStore } from '@/stores/vocabulary'
import { useGrammarStore } from '@/stores/grammar'
import { useReadingStore } from '@/stores/reading'
import { useListeningStore } from '@/stores/listening'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  // 当前题目上下文
  context: {
    type: Object,
    default: null
  },
  // 自动展开
  autoOpen: {
    type: Boolean,
    default: false
  },
  enableHistory: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'message-sent'])

const message = useMessage()
const messagesContainer = ref(null)

// UI 状态
const isExpanded = ref(props.autoOpen)
const showHistory = ref(false)
const showProgress = ref(false)
const userInput = ref('')
const messages = ref([])
const isTyping = ref(false)
const streamingContent = ref('')
const unreadCount = ref(0)

// 学习进度相关
const vocabStore = useVocabularyStore()
const grammarStore = useGrammarStore()
const readingStore = useReadingStore()
const listeningStore = useListeningStore()
const userStore = useUserStore()

const sessionStartTime = ref(Date.now())
const sessionTime = ref(0)
const learningStreak = computed(() => userStore.userInfo?.streak || 0)
const totalXP = computed(() => userStore.userInfo?.xp || 0)

// 基础值缓存（由于某些 store 只存当前 session，我们需要知道进入时的状态）
const initialVocabCount = ref(vocabStore.stats.todayCount)
const sessionProgress = computed(() => {
  const completed = learningGoals.value.filter(g => g.completed).length
  return Math.floor((completed / learningGoals.value.length) * 100)
})

// 学习目标系统 - 完全动态计算
const learningGoals = computed(() => [
  {
    id: 1,
    title: '完成今日份词汇学习',
    description: `已学习: ${vocabStore.stats.todayCount} / 10 个单词`,
    completed: vocabStore.stats.todayCount >= 10,
    progress: Math.min((vocabStore.stats.todayCount / 10) * 100, 100),
    reward: { xp: 30 }
  },
  {
    id: 2,
    title: '攻克一套语法练习',
    description: '提交一次语法专题测试',
    completed: grammarStore.isSubmitted,
    progress: grammarStore.isSubmitted ? 100 : 0,
    reward: { xp: 50 }
  },
  {
    id: 3,
    title: '磨练英语听力',
    description: '完整收听并提交听力练习',
    completed: listeningStore.isSubmitted,
    progress: listeningStore.isSubmitted ? 100 : 0,
    reward: { xp: 40 }
  },
  {
    id: 4,
    title: '深度阅读研习',
    description: '阅读一篇文章并完成题目',
    completed: readingStore.isSubmitted,
    progress: readingStore.isSubmitted ? 100 : 0,
    reward: { xp: 60 }
  }
])

// 会话计时器
let sessionTimer = null

onMounted(() => {
  startSessionTimer()
})

// 响应父组件传入的 autoOpen 变化，实现外部触发展开
watch(() => props.autoOpen, (val) => {
  if (val && !isExpanded.value) {
    isExpanded.value = true
    unreadCount.value = 0
  }
})

onUnmounted(() => {
  if (sessionTimer) {
    clearInterval(sessionTimer)
  }
})

// 开始会话计时
function startSessionTimer() {
  sessionTimer = setInterval(() => {
    sessionTime.value = Math.floor((Date.now() - sessionStartTime.value) / 1000)
  }, 1000)
}

// 计时器等逻辑保留，updateSessionProgress 变为 computed 故可移除

// 切换展开/折叠
function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    unreadCount.value = 0
    scrollToBottom()
  }
}

// 关闭
function close() {
  isExpanded.value = false
  showHistory.value = false
  showProgress.value = false
  emit('close')
}

// 快捷回复
function handleQuickReply(text) {
  userInput.value = text
  handleSend()
}

// 回顾消息
function handleReviewMessage(msg, index) {
  if (messages.value[index]) {
    messages.value[index].reviewed = true
    message.success('已标记为已回顾')
  }
}

// 删除消息
function handleDeleteMessage(index) {
  messages.value.splice(index, 1)
  message.info('消息已删除')
}

// 清空对话历史
function handleClearHistory() {
  messages.value = []
  message.info('对话历史已清空')
}

// 里程碑处理保留在父组件，通过 watch computed 触发
watch(() => sessionProgress.value, (newVal) => {
  if (newVal >= 100) {
    // 可以在这里触发全局提示或后端 XP 更新
  }
})

// 完成里程碑
function handleCompleteMilestone(data) {
  message.success(data.description)
}

// 发送消息
async function handleSend() {
  if (!userInput.value.trim() || isTyping.value) return

  const question = userInput.value.trim()
  userInput.value = ''

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: question,
    timestamp: Date.now(),
    reviewed: false
  })

  scrollToBottom()

  // 重置流式内容
  streamingContent.value = ''

  // 调用 AI
  isTyping.value = true

  try {
    // 词汇模式：将单词信息注入 question，确保 AI 知道当前学习的是哪个单词
    let apiQuestion = question
    if (props.context?.module === 'vocabulary' && props.context?.word) {
      apiQuestion = `《当前学习单词: "${props.context.word}"${props.context.meaning ? `，释义: ${props.context.meaning}` : ''}》${question}`
    }

    const payload = {
      question: apiQuestion,
      context: props.context
    }
    const response = props.enableHistory
      ? await aiApi.chatWithHistory({ ...payload, sessionId: props.sessionId })
      : await aiApi.chatWithTutor(payload)

    if (response.code === 200) {
      if (response.data?.sessionId) {
        emit('message-sent', { sessionId: response.data.sessionId })
      }
      const answer = response.data.answer || '抱歉，我暂时无法回答这个问题。'
      simulateStreamResponse(answer)
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('AI Tutor error:', error)

    const rawMessage = typeof error?.message === 'string' ? error.message : ''
    const displayMsg = rawMessage.includes('核心价值观') || rawMessage.includes('敏感')
      ? `🚨内容合规提示：${rawMessage}`
      : (rawMessage || '抱歉，我遇到了一些问题。请稍后再试。')

    streamingContent.value = ''
    isTyping.value = false
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: displayMsg,
      timestamp: Date.now(),
      reviewed: false
    })
    scrollToBottom()
  }
}

// 模拟流式回复效果
function simulateStreamResponse(text) {
  let index = 0
  const speed = 30

  const streamInterval = setInterval(() => {
    if (index < text.length) {
      streamingContent.value += text[index]
      index++
      // 仅当用户未主动向上滚动时才自动滚到底部
      const el = messagesContainer.value
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
        el.scrollTop = el.scrollHeight
      }
    } else {
      clearInterval(streamInterval)
      setTimeout(() => {
        messages.value.push({
          id: Date.now(),
          role: 'assistant',
          content: streamingContent.value,
          timestamp: Date.now(),
          reviewed: false
        })
        streamingContent.value = ''
        isTyping.value = false
        scrollToBottom()
      }, 500)
    }
  }, speed)
}

// 流式回复完成
function handleStreamingComplete() {
  // 可以在这里添加完成后的逻辑
}

// 格式化消息（支持 Markdown）
function formatMessage(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听上下文变化
watch(() => props.context, (newContext) => {
  if (newContext && messages.value.length === 0) {
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: '我看到你正在做这道题。如果有任何疑问，随时问我！',
      timestamp: Date.now(),
      reviewed: false
    })
  }
})

// 监听消息变化，更新未读数
watch(messages, (newMessages) => {
  if (!isExpanded.value && newMessages.length > 0) {
    const lastMsg = newMessages[newMessages.length - 1]
    if (lastMsg.role === 'assistant') {
      unreadCount.value++
    }
  }
})
</script>

<style scoped>
.ai-tutor-wrapper {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}

/* 浮动按钮 */
.ai-tutor-fab {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.ai-tutor-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
}

/* 对话面板 */
.ai-tutor-panel {
  width: 420px;
  height: 650px;
  background: #1f2937;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;  /* 火要米：保留 overflow:hidden 使圆角裁剪生效 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

/* 头部 */
.tutor-header {
  padding: 16px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  color: #f9fafb;
  font-weight: 600;
  font-size: 15px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-icon {
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px;
  border-radius: 6px;
}

.action-icon:hover {
  color: #f9fafb;
  background: rgba(255, 255, 255, 0.1);
}

.action-icon:active {
  transform: scale(0.95);
}

.close-icon:hover {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

/* 上下文提示 */
.context-hint {
  padding: 8px 16px;
  background: rgba(59, 130, 246, 0.1);
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  align-items: center;
  gap: 6px;
  color: #60a5fa;
  font-size: 13px;
}

/* 历史记录侧边栏 - 改为避开头部且不挤压聊天区的纯浮层 */
.history-sidebar {
  position: absolute;
  top: 56px;           /* 避开 tutor-header 的高度 */
  left: 0;
  width: 300px;
  bottom: 0;           /* 撑满底部 */
  background: rgba(17, 24, 39, 0.98);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 20;         /* 确保在消息区域之上 */
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

/* 学习进度面板 */
.progress-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 60%;
  z-index: 5;
  /* 未展开时不拦截鼠标事件 - 由 v-if 控制 */
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  min-height: 0;          /* 关键：允许 flex 子项收缩并触发滚动 */
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  background: #111827;
  transition: all 0.3s;
  overscroll-behavior: contain;
}

/* 移除之前的 margin-left 挤压逻辑，改为不再改变宽度 */
.chat-messages.with-history {
  /* 侧边栏现在是浮层，不再改变主区域宽度 */
  filter: brightness(0.5); /* 增加遮罩感 */
  pointer-events: none;    /* 打开历史时，主区域不可交互 */
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state p {
  margin: 12px 0 0;
  font-size: 14px;
}

.empty-state .hint {
  font-size: 12px;
  color: #6b7280;
}

/* 消息 */
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.message.user {
  flex-direction: row-reverse;
}

.message.reviewed {
  opacity: 0.8;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;       /* 必须：防止 flex 子项宽度超出容器 */
  max-width: 70%;
  overflow: hidden;   /* 裁剪内容防止文字外泄 */
}

.message.user .message-content {
  align-items: flex-end;
}

.message-text {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  color: #f9fafb;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.message.user .message-text {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  margin-left: auto;
}

.message-text :deep(strong) {
  color: #10b981;
  font-weight: 600;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #fbbf24;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  color: #6b7280;
}

.review-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #10b981;
}

.message-actions {
  opacity: 0;
  transition: opacity 0.2s;
  position: absolute;
  right: 0;
  top: 0;
}

.message:hover .message-actions {
  opacity: 1;
}

/* 输入指示器 */
.typing-indicator {
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

/* 输入框 */
.chat-input {
  padding: 16px;
  background: #1f2937;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
  align-items: flex-end;
  z-index: 10;
}

.chat-input :deep(.n-input) {
  flex: 1;
}

/* 动画 */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-out 0.3s;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(-100%);
}

.slide-up-panel-enter-active,
.slide-up-panel-leave-active {
  transition: all 0.3s ease;
}

.slide-up-panel-enter-from,
.slide-up-panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .ai-tutor-panel {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    max-height: 600px;
  }

  .ai-tutor-fab {
    bottom: 80px;
  }

  .history-sidebar {
    width: 100%;
  }

  .chat-messages.with-history {
    margin-left: 0;
  }
}

/* 流式回复气泡 */
.streaming-bubble {
  flex: 1;
  min-width: 0;          /* 关键：防止 flex 元素宽度溢出 */
  max-width: 70%;
  background: rgba(16, 185, 129, 0.05);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.streaming-text {
  color: #f9fafb;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: break-word;
}

.streaming-text :deep(strong) {
  color: #10b981;
  font-weight: 600;
}

.streaming-text :deep(em) {
  color: #a7f3d0;
  font-style: italic;
}

.streaming-text :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  color: #fbbf24;
}

.stream-cursor {
  display: inline-block;
  color: #10b981;
  font-weight: bold;
  animation: cursorBlink 1s infinite;
  margin-left: 2px;
}

@keyframes cursorBlink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 旧精列样式保留兼容 */
.message-content.streaming {
  display: none; /* 已替换为 streaming-bubble */
}

.cursor {
  display: none; /* 不再使用 */
}
</style>
