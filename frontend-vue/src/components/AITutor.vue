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
            <n-icon 
              :component="Minimize2" 
              size="18" 
              class="action-icon"
              @click="toggleExpand"
            />
            <n-icon 
              :component="X" 
              size="18" 
              class="action-icon"
              @click="close"
            />
          </div>
        </div>

        <!-- 上下文提示（当前题目信息） -->
        <div v-if="context" class="context-hint">
          <n-icon :component="Info" size="14" />
          <span>正在讨论：{{ context.topic || '当前题目' }}</span>
        </div>

        <!-- 对话历史 -->
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <n-icon :component="MessageSquare" size="48" color="#6b7280" />
            <p>👋 你好！我是你的 AI 学习助手</p>
            <p class="hint">有任何不理解的语法点，随时问我！</p>
          </div>

          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            :class="['message', msg.role]"
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
              <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
            </div>
          </div>

          <!-- AI 正在输入 -->
          <div v-if="isTyping" class="message assistant">
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

        <!-- 快捷提问按钮 -->
        <div v-if="!userInput && quickQuestions.length > 0" class="quick-questions">
          <div 
            v-for="(q, index) in quickQuestions" 
            :key="index"
            class="quick-question-btn"
            @click="askQuestion(q)"
          >
            {{ q }}
          </div>
        </div>

        <!-- 输入框 -->
        <div class="chat-input">
          <n-input
            v-model:value="userInput"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 3 }"
            placeholder="问我任何关于这道题的问题..."
            @keydown.enter.prevent="handleSend"
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
import { ref, computed, watch, nextTick } from 'vue'
import { NIcon, NButton, NInput, NTag, useMessage } from 'naive-ui'
import { 
  MessageCircle, Bot, User, Send, X, Minimize2, 
  Info, MessageSquare 
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'

const props = defineProps({
  // 当前题目上下文
  context: {
    type: Object,
    default: null
    // 示例: { question: '...', correctAnswer: 'B', userAnswer: 'A', explanation: '...' }
  },
  // 自动展开
  autoOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const message = useMessage()
const messagesContainer = ref(null)

const isExpanded = ref(props.autoOpen)
const userInput = ref('')
const messages = ref([])
const isTyping = ref(false)
const unreadCount = ref(0)

// 快捷提问（根据上下文动态生成）
const quickQuestions = computed(() => {
  if (!props.context) return []
  
  return [
    '为什么我的答案是错的？',
    '请详细解释一下正确答案',
    '这个语法点还有其他例句吗？',
    '如何避免再犯类似的错误？'
  ]
})

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
  emit('close')
}

// 快捷提问
function askQuestion(question) {
  userInput.value = question
  handleSend()
}

// 发送消息
async function handleSend() {
  if (!userInput.value.trim() || isTyping.value) return

  const question = userInput.value.trim()
  userInput.value = ''

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: question,
    timestamp: Date.now()
  })

  scrollToBottom()

  // 调用 AI
  isTyping.value = true

  try {
    const response = await aiApi.chatWithTutor({
      question,
      context: props.context
    })

    if (response.code === 200) {
      messages.value.push({
        role: 'assistant',
        content: response.data.answer || '抱歉，我暂时无法回答这个问题。',
        timestamp: Date.now()
      })
    } else {
      throw new Error(response.message)
    }
  } catch (error) {
    console.error('AI Tutor error:', error)
    messages.value.push({
      role: 'assistant',
      content: '抱歉，我遇到了一些问题。请稍后再试。',
      timestamp: Date.now()
    })
    message.error('AI 助手暂时不可用')
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
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

// 监听上下文变化（切换题目时自动提示）
watch(() => props.context, (newContext) => {
  if (newContext && messages.value.length === 0) {
    messages.value.push({
      role: 'assistant',
      content: '我看到你正在做这道题。如果有任何疑问，随时问我！',
      timestamp: Date.now()
    })
  }
})

// 如果窗口折叠时收到新消息，增加未读数
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
  width: 380px;
  height: 600px;
  background: #1f2937;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 头部 */
.tutor-header {
  padding: 16px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  gap: 8px;
}

.action-icon {
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
}

.action-icon:hover {
  color: #f9fafb;
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

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #111827;
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
}

.message.user {
  flex-direction: row-reverse;
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
  max-width: 70%;
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
}

.message-time {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
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

/* 快捷提问 */
.quick-questions {
  padding: 0 16px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: #111827;
}

.quick-question-btn {
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-question-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
}

/* 输入框 */
.chat-input {
  padding: 16px;
  background: #1f2937;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
  align-items: flex-end;
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
}
</style>
