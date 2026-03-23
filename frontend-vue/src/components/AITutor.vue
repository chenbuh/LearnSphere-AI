<template>
  <div class="ai-tutor-wrapper">
    <transition name="bounce">
      <button
        v-if="!isExpanded"
        type="button"
        class="ai-tutor-fab"
        @click="toggleExpand"
      >
        <span class="fab-mark">
          <n-icon :component="MessageCircle" size="20" />
        </span>
        <span class="fab-copy">
          <strong>AI 学习助手</strong>
          <small>{{ currentModuleLabel }}</small>
        </span>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
    </transition>

    <transition name="slide-up">
      <section v-if="isExpanded" class="ai-tutor-panel">
        <header class="tutor-header">
          <div class="header-brand">
            <span class="brand-mark">
              <n-icon :component="Bot" size="18" />
            </span>
            <div class="brand-copy">
              <div class="brand-meta">
                <strong>AI 学习助手</strong>
                <span class="assistant-state-pill" :class="{ typing: isTyping }">
                  <i></i>
                  {{ assistantState.label }}
                </span>
              </div>
              <span>{{ headerSubtitle }}</span>
            </div>
          </div>

          <div class="header-actions">
            <button
              type="button"
              class="header-tab"
              :class="{ 'is-active': showHistory }"
              @click="toggleHistoryPanel"
            >
              <History :size="14" />
              <span>对话历史</span>
            </button>

            <button
              type="button"
              class="header-tab"
              :class="{ 'is-active': showProgress }"
              @click="toggleProgressPanel"
            >
              <Target :size="14" />
              <span>任务清单</span>
            </button>

            <button
              type="button"
              class="icon-button"
              aria-label="最小化"
              @click="toggleExpand"
            >
              <Minimize2 :size="16" />
            </button>

            <button
              type="button"
              class="icon-button danger"
              aria-label="关闭"
              @click="close"
            >
              <X :size="16" />
            </button>
          </div>
        </header>

        <section class="workspace-strip">
          <div class="workspace-focus">
            <p class="section-kicker">当前上下文</p>
            <h3>{{ currentTopic }}</h3>
            <p>{{ contextSummary }}</p>
          </div>

          <div class="workspace-rail">
            <div class="workspace-progress">
              <div class="workspace-progress-copy">
                <strong>{{ currentFocus.title }}</strong>
                <small>{{ currentFocus.description }}</small>
              </div>
              <button type="button" class="text-action" @click="toggleProgressPanel">
                查看任务
              </button>
            </div>

            <div class="meter-track">
              <div class="meter-fill" :style="{ width: `${sessionProgress}%` }"></div>
            </div>
          </div>

          <div class="workspace-stats compact">
            <article
              v-for="stat in workspaceStats"
              :key="stat.label"
              class="stat-pill"
            >
              <strong>{{ stat.value }}</strong>
              <small>{{ stat.label }}</small>
            </article>
          </div>
        </section>

        <button
          v-if="overlayOpen"
          type="button"
          class="panel-scrim"
          aria-label="关闭侧层面板"
          @click="closePanels"
        ></button>

        <transition name="slide-right">
          <aside v-if="showHistory" class="history-sidebar">
            <header class="overlay-header">
              <div>
                <strong>对话历史</strong>
                <p>回看刚才的重点问答，挑一条加入回顾区。</p>
              </div>
              <div class="overlay-actions">
                <n-button
                  v-if="messages.length > 0"
                  quaternary
                  size="small"
                  @click="handleClearHistory"
                >
                  清空
                </n-button>
                <button type="button" class="icon-button" aria-label="关闭历史记录" @click="closePanels">
                  <X :size="16" />
                </button>
              </div>
            </header>
            <div class="overlay-body">
              <ConversationHistory
                :messages="messages"
                :embedded="true"
                @review="handleReviewMessage"
                @delete="handleDeleteMessage"
                @clear="handleClearHistory"
              />
            </div>
          </aside>
        </transition>

        <transition name="slide-up-panel">
          <section v-if="showProgress" class="progress-panel">
            <header class="overlay-header">
              <div>
                <strong>任务清单</strong>
                <p>按今天的学习节奏逐条推进，随时回来继续提问。</p>
              </div>
              <button type="button" class="icon-button" aria-label="关闭任务清单" @click="closePanels">
                <X :size="16" />
              </button>
            </header>
            <div class="overlay-body">
              <LearningProgress
                :goals="learningGoals"
                :progress="sessionProgress"
                :session-time="sessionTime"
                :streak="learningStreak"
                :total-x-p="totalXP"
                :embedded="true"
                @complete-milestone="handleCompleteMilestone"
              />
            </div>
          </section>
        </transition>

        <div
          class="chat-messages"
          :class="{ 'is-muted': showHistory || showProgress }"
          ref="messagesContainer"
        >
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-mark">
              <Sparkles :size="22" />
            </div>
            <h2>把当前问题直接丢给我</h2>
            <p>
              我会结合你现在的练习内容，用更易懂的方式解释错因、补例子、拆知识点。
            </p>

            <div class="starter-grid">
              <button
                v-for="prompt in starterPrompts"
                :key="prompt.title"
                type="button"
                class="starter-chip"
                @click="handleQuickReply(prompt.text)"
              >
                <strong>{{ prompt.title }}</strong>
                <span>{{ prompt.text }}</span>
              </button>
            </div>
          </div>

          <article
            v-for="(msg, index) in messages"
            :key="msg.id || index"
            :class="['message', msg.role, { reviewed: msg.reviewed }]"
          >
            <div class="message-avatar">
              <n-icon
                :component="msg.role === 'user' ? User : Bot"
                size="18"
              />
            </div>

            <div class="message-main">
              <div class="message-bubble">
                <div class="message-text" v-html="formatMessage(msg.content)"></div>
              </div>
              <div class="message-meta">
                <span>{{ msg.role === 'user' ? '我' : '助手' }}</span>
                <span>{{ formatTime(msg.timestamp) }}</span>
                <span v-if="msg.reviewed" class="review-badge">
                  <CheckCircle :size="12" />
                  已回顾
                </span>
              </div>
            </div>

            <div class="message-actions">
              <button
                type="button"
                class="message-action"
                :disabled="msg.reviewed"
                @click="handleReviewMessage(msg, index)"
              >
                <Eye :size="14" />
              </button>
            </div>
          </article>

          <div v-if="isTyping && streamingContent" class="message assistant">
            <div class="message-avatar">
              <n-icon :component="Bot" size="18" />
            </div>
            <div class="message-main">
              <div class="streaming-bubble">
                <div class="streaming-text" v-html="formatMessage(streamingContent)"></div>
                <span class="stream-cursor">|</span>
              </div>
              <div class="message-meta">
                <span>助手</span>
                <span>正在生成</span>
              </div>
            </div>
          </div>

          <div v-if="isTyping && !streamingContent" class="message assistant">
            <div class="message-avatar">
              <n-icon :component="Bot" size="18" />
            </div>
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <QuickReplies
          v-if="!isTyping && messages.length > 0"
          :context="context"
          :allow-custom="false"
          title="继续追问"
          description="需要时再展开，保持主会话区更清爽。"
          :default-expanded="false"
          :max-display="4"
          @select="handleQuickReply"
        />

        <footer class="chat-input">
          <div class="input-guide">
            <span>Shift + Enter 换行</span>
            <span>Enter 发送</span>
          </div>

          <div class="input-row">
            <n-input
              v-model:value="userInput"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              placeholder="把你的疑问、错因判断或想要的例子直接发给我…"
              @keydown="handleTextareaKeydown"
            />

            <VoiceInput
              v-model="userInput"
              @submit="handleSend"
              size="medium"
              :icon-size="18"
              :auto-submit="false"
              :show-status="false"
              :use-whisper="false"
            />

            <n-button
              type="primary"
              class="send-button"
              :loading="isTyping"
              :disabled="!userInput.trim()"
              @click="handleSend"
            >
              <template #icon>
                <n-icon :component="Send" />
              </template>
              发送
            </n-button>
          </div>
        </footer>
      </section>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { NButton, NIcon, NInput, useMessage } from 'naive-ui'
import {
  Bot,
  CheckCircle,
  Eye,
  History,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  Target,
  User,
  X
} from 'lucide-vue-next'
import { aiApi } from '@/api/ai'
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
  context: {
    type: Object,
    default: null
  },
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

const isExpanded = ref(props.autoOpen)
const showHistory = ref(false)
const showProgress = ref(false)
const userInput = ref('')
const messages = ref([])
const isTyping = ref(false)
const streamingContent = ref('')
const unreadCount = ref(0)

const vocabStore = useVocabularyStore()
const grammarStore = useGrammarStore()
const readingStore = useReadingStore()
const listeningStore = useListeningStore()
const userStore = useUserStore()

const sessionStartTime = ref(Date.now())
const sessionTime = ref(0)
const sessionTimer = ref(null)
const streamTimer = ref(null)

const learningStreak = computed(() => userStore.userInfo?.streak || 0)
const totalXP = computed(() => userStore.userInfo?.xp || 0)
const userQuestionCount = computed(() => messages.value.filter(item => item.role === 'user').length)
const reviewedCount = computed(() => messages.value.filter(item => item.reviewed).length)

const moduleLabelMap = {
  vocabulary: '词汇学习',
  grammar: '语法练习',
  reading: '阅读理解',
  listening: '听力训练',
  speaking: '口语练习',
  writing: '写作练习',
  error_analysis: '错题复盘'
}

const currentModuleLabel = computed(() => {
  return moduleLabelMap[props.context?.module] || '即时学习辅导'
})

const currentTopic = computed(() => {
  if (props.context?.word) {
    return props.context.word
  }

  if (props.context?.topic) {
    return props.context.topic
  }

  if (props.context?.question) {
    return truncateText(props.context.question, 46)
  }

  return '当前学习问题'
})

const contextSummary = computed(() => {
  if (!props.context) {
    return '没有限定模块时也可以直接提问，比如让 AI 帮你解释知识点、分析错误原因或给出例子。'
  }

  if (props.context?.module === 'vocabulary' && props.context?.meaning) {
    return `当前单词释义：${props.context.meaning}`
  }

  if (props.context?.explanation) {
    return truncateText(props.context.explanation, 78)
  }

  return '我会优先结合当前题目、答案和模块上下文来回答。'
})

const headerSubtitle = computed(() => {
  return `${currentModuleLabel.value} · ${props.enableHistory ? '保留对话历史' : '即时辅导'}`
})

const overlayOpen = computed(() => showHistory.value || showProgress.value)

const assistantState = computed(() => {
  if (isTyping.value) {
    return {
      label: '正在整理回答',
      description: '我正在结合当前上下文组织更完整的答案。'
    }
  }

  if (!messages.value.length) {
    return {
      label: '待命中',
      description: '你一开口，我就会直接进入当前学习上下文。'
    }
  }

  if (reviewedCount.value > 0) {
    return {
      label: '已进入复盘',
      description: `已经整理了 ${reviewedCount.value} 条重点回答，可以继续收尾。`
    }
  }

  return {
    label: '对话进行中',
    description: `已完成 ${userQuestionCount.value} 次追问，继续把问题问透。`
  }
})

const moduleGoal = computed(() => {
  if (props.context?.module === 'grammar') {
    return {
      id: 'grammar-module',
      title: '完成一组语法练习',
      description: grammarStore.isSubmitted ? '本轮语法练习已提交完成' : '提交一次语法专题练习，便于 AI 继续讲错因',
      completed: grammarStore.isSubmitted,
      progress: grammarStore.isSubmitted ? 100 : 0,
      reward: { xp: 50 }
    }
  }

  if (props.context?.module === 'reading') {
    return {
      id: 'reading-module',
      title: '完成一篇阅读理解',
      description: readingStore.isSubmitted ? '本轮阅读记录已经提交' : '完成当前阅读练习，再回到这里追问错因',
      completed: readingStore.isSubmitted,
      progress: readingStore.isSubmitted ? 100 : 0,
      reward: { xp: 60 }
    }
  }

  if (props.context?.module === 'listening') {
    return {
      id: 'listening-module',
      title: '完成一次听力训练',
      description: listeningStore.isSubmitted ? '听力作答已完成，可继续复盘' : '先完成听力提交，再让 AI 帮你定位失分点',
      completed: listeningStore.isSubmitted,
      progress: listeningStore.isSubmitted ? 100 : 0,
      reward: { xp: 40 }
    }
  }

  if (props.context?.module === 'speaking') {
    return {
      id: 'speaking-module',
      title: '完成当前口语复盘',
      description: userQuestionCount.value >= 1 ? '已经开始围绕表达问题和 AI 追问' : '先问一次表达、结构或发音反馈',
      completed: userQuestionCount.value >= 1,
      progress: Math.min(userQuestionCount.value * 100, 100),
      reward: { xp: 30 }
    }
  }

  if (props.context?.module === 'writing') {
    return {
      id: 'writing-module',
      title: '完成当前写作复盘',
      description: userQuestionCount.value >= 1 ? '已经开始围绕写作问题追问' : '先让 AI 帮你指出任务回应、逻辑或语言问题',
      completed: userQuestionCount.value >= 1,
      progress: Math.min(userQuestionCount.value * 100, 100),
      reward: { xp: 30 }
    }
  }

  return {
    id: 'general-module',
    title: '推进一个训练模块',
    description:
      grammarStore.isSubmitted || readingStore.isSubmitted || listeningStore.isSubmitted
        ? '今天已经完成至少一个训练模块'
        : '先完成任意一个训练模块，再结合 AI 做复盘',
    completed: grammarStore.isSubmitted || readingStore.isSubmitted || listeningStore.isSubmitted,
    progress:
      grammarStore.isSubmitted || readingStore.isSubmitted || listeningStore.isSubmitted ? 100 : 0,
    reward: { xp: 40 }
  }
})

const learningGoals = computed(() => [
  {
    id: 'clarify-question',
    title: props.context ? `问清当前${currentModuleLabel.value}疑点` : '提出一个明确问题',
    description:
      userQuestionCount.value >= 2
        ? '你已经在持续追问关键点了'
        : '至少向 AI 提 2 个问题，把困惑具体说出来',
    completed: userQuestionCount.value >= 2,
    progress: Math.min((userQuestionCount.value / 2) * 100, 100),
    reward: { xp: 20 }
  },
  moduleGoal.value,
  {
    id: 'review-answer',
    title: '整理一条可回看的回答',
    description:
      reviewedCount.value > 0
        ? `已标记 ${reviewedCount.value} 条重点回答`
        : '把最有帮助的回答标记为已回顾，方便之后复盘',
    completed: reviewedCount.value > 0,
    progress: Math.min(reviewedCount.value * 100, 100),
    reward: { xp: 15 }
  },
  {
    id: 'daily-vocab',
    title: '完成今日词汇积累',
    description: `今日已学 ${vocabStore.stats.todayCount} / 10 个单词`,
    completed: vocabStore.stats.todayCount >= 10,
    progress: Math.min((vocabStore.stats.todayCount / 10) * 100, 100),
    reward: { xp: 30 }
  }
])

const completedGoalCount = computed(() => {
  return learningGoals.value.filter(goal => goal.completed).length
})

const sessionProgress = computed(() => {
  if (!learningGoals.value.length) {
    return 0
  }

  return Math.floor((completedGoalCount.value / learningGoals.value.length) * 100)
})

const workspaceStats = computed(() => [
  {
    label: '任务推进',
    value: `${completedGoalCount.value}/${learningGoals.value.length}`,
    caption:
      completedGoalCount.value === learningGoals.value.length ? '今天的任务都完成了' : '继续推进当前学习'
  },
  {
    label: '本次学习',
    value: formatDurationShort(sessionTime.value),
    caption: `连续 ${learningStreak.value} 天学习`
  },
  {
    label: '已整理回答',
    value: `${reviewedCount.value}`,
    caption: reviewedCount.value ? '重点回答已进入回顾区' : '先标记一条值得复看的回答'
  }
])

const currentFocus = computed(() => {
  if (isTyping.value) {
    return {
      title: '我正在组织答案',
      description: '这次会尽量把结论、理由和下一步动作一起整理出来。',
      text: ''
    }
  }

  if (!messages.value.length) {
    return {
      title: '先把困惑说具体一点',
      description: '可以直接问错因、规则、例子，或者让我按步骤拆解当前题目。',
      text: starterPrompts.value[0]?.text || '请先用更简单的中文解释一下这个问题。'
    }
  }

  if (userQuestionCount.value < 2) {
    return {
      title: '继续深挖这次出错的原因',
      description: '别只停在答案对错，继续追问依据、规则和常见误区。',
      text: '请继续帮我把这次出错的原因、判断依据和容易混淆的点讲清楚。'
    }
  }

  if (reviewedCount.value === 0) {
    return {
      title: '把最有用的一条回答整理出来',
      description: '先让 AI 帮你压成 3 个复习要点，再标记为回顾内容。',
      text: '请把刚才最关键的内容整理成 3 条复习要点，方便我回顾。'
    }
  }

  if (sessionProgress.value >= 75) {
    return {
      title: '准备把这一轮学习收尾',
      description: '现在适合产出一个小结，带着明确动作去下一题或下一模块。',
      text: '请根据我们刚才的对话，帮我生成一个简短的复盘清单和下一步练习建议。'
    }
  }

  return {
    title: '把当前模块再推进一步',
    description: '继续让助手围绕当前练习出题点、错因和技巧给出针对性帮助。',
    text: '请结合当前模块，再告诉我一个最值得马上改进的点和练习方法。'
  }
})

const starterPrompts = computed(() => {
  if (props.context?.module === 'vocabulary') {
    return [
      { title: '解释词义', text: '请用更简单的中文解释这个单词的意思。' },
      { title: '给我例句', text: '请给我两个常见例句，并说明怎么用。' },
      { title: '记忆方法', text: '请给我一个容易记住这个单词的方法。' }
    ]
  }

  if (props.context?.module === 'grammar') {
    return [
      { title: '语法规则', text: '请把这条语法规则讲清楚一点。' },
      { title: '为什么会错', text: '请告诉我这题最容易错在哪里。' },
      { title: '再举例子', text: '请给我两个相似例句帮助我理解。' }
    ]
  }

  if (props.context?.module === 'reading' || props.context?.module === 'listening') {
    return [
      { title: '定位依据', text: '请告诉我答案依据在原文哪里。' },
      { title: '错因分析', text: '请解释我为什么会选错。' },
      { title: '总结技巧', text: '请总结这类题的做题技巧。' }
    ]
  }

  return [
    { title: '先解释一下', text: '请先用更简单的中文解释一下这个问题。' },
    { title: '帮我找错因', text: '请告诉我我最容易错在哪里。' },
    { title: '给我一个例子', text: '请给我一个很短的例子帮助理解。' }
  ]
})

watch(
  () => props.autoOpen,
  (value) => {
    if (value && !isExpanded.value) {
      isExpanded.value = true
      unreadCount.value = 0
      scrollToBottom()
    }
  }
)

watch(
  () => messages.value.length,
  (newLength, oldLength = 0) => {
    if (!isExpanded.value && newLength > oldLength && newLength > 0) {
      const lastMessage = messages.value[newLength - 1]
      if (lastMessage.role === 'assistant') {
        unreadCount.value += 1
      }
    }
  },
  { deep: true }
)

watch(
  () => props.context,
  (newContext) => {
    if (!newContext || messages.value.length > 0) {
      return
    }

    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: '我已经接入当前练习上下文了。你可以直接问我错因、规则、例子，或者让我帮你总结重点。',
      timestamp: Date.now(),
      reviewed: false
    })
  },
  { immediate: true, deep: true }
)

function startSessionTimer() {
  clearInterval(sessionTimer.value)
  sessionTimer.value = setInterval(() => {
    sessionTime.value = Math.floor((Date.now() - sessionStartTime.value) / 1000)
  }, 1000)
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    unreadCount.value = 0
    scrollToBottom()
  }
}

function toggleHistoryPanel() {
  showHistory.value = !showHistory.value
  if (showHistory.value) {
    showProgress.value = false
  }
}

function toggleProgressPanel() {
  showProgress.value = !showProgress.value
  if (showProgress.value) {
    showHistory.value = false
  }
}

function closePanels() {
  showHistory.value = false
  showProgress.value = false
}

function close() {
  isExpanded.value = false
  closePanels()
  emit('close')
}

function handleQuickReply(text) {
  userInput.value = text
  void handleSend()
}

function handleReviewMessage(payload, fallbackIndex = null) {
  const index =
    typeof payload === 'object' && payload !== null && Object.hasOwn(payload, 'index')
      ? payload.index
      : fallbackIndex

  if (typeof index !== 'number' || !messages.value[index] || messages.value[index].reviewed) {
    return
  }

  messages.value[index].reviewed = true
  message.success('已加入回顾标记')
}

function handleDeleteMessage(payload) {
  const index =
    typeof payload === 'object' && payload !== null && Object.hasOwn(payload, 'index')
      ? payload.index
      : payload

  if (typeof index !== 'number') {
    return
  }

  messages.value.splice(index, 1)
  message.info('消息已删除')
}

function handleClearHistory() {
  messages.value = []
  message.info('对话历史已清空')
}

function handleCompleteMilestone(data) {
  message.success(data.description)
}

function handleTextareaKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    void handleSend()
  }
}

function handleWindowKeydown(event) {
  if (event.key !== 'Escape') {
    return
  }

  if (overlayOpen.value) {
    closePanels()
    return
  }

  if (isExpanded.value) {
    close()
  }
}

async function handleSend() {
  if (!userInput.value.trim() || isTyping.value) {
    return
  }

  const question = userInput.value.trim()
  userInput.value = ''

  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: question,
    timestamp: Date.now(),
    reviewed: false
  })

  scrollToBottom()
  streamingContent.value = ''
  isTyping.value = true

  try {
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

    if (response.code !== 200) {
      throw new Error(response.message)
    }

    if (response.data?.sessionId) {
      emit('message-sent', { sessionId: response.data.sessionId })
    }

    simulateStreamResponse(response.data.answer || '抱歉，我暂时无法回答这个问题。')
  } catch (error) {
    console.error('AI Tutor error:', error)

    const rawMessage = typeof error?.message === 'string' ? error.message : ''
    const displayMessage =
      rawMessage.includes('核心价值观') || rawMessage.includes('敏感')
        ? `内容合规提示：${rawMessage}`
        : rawMessage || '抱歉，我遇到了一些问题。请稍后再试。'

    streamingContent.value = ''
    isTyping.value = false
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: displayMessage,
      timestamp: Date.now(),
      reviewed: false
    })
    scrollToBottom()
  }
}

function simulateStreamResponse(text) {
  clearInterval(streamTimer.value)

  let index = 0
  const speed = 26

  streamTimer.value = setInterval(() => {
    if (index < text.length) {
      streamingContent.value += text[index]
      index += 1

      const container = messagesContainer.value
      if (container && container.scrollHeight - container.scrollTop - container.clientHeight < 100) {
        container.scrollTop = container.scrollHeight
      }
      return
    }

    clearInterval(streamTimer.value)
    streamTimer.value = null

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
    }, 280)
  }, speed)
}

function formatMessage(content) {
  return String(content || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDurationShort(seconds) {
  if (seconds < 60) {
    return `${seconds} 秒`
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} 分钟`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours} 小时 ${minutes} 分`
}

function truncateText(text, maxLength = 72) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trim()}…`
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

onMounted(() => {
  startSessionTimer()
  window.addEventListener('keydown', handleWindowKeydown)
})

onUnmounted(() => {
  clearInterval(sessionTimer.value)
  clearInterval(streamTimer.value)
  window.removeEventListener('keydown', handleWindowKeydown)
})
</script>

<style scoped>
.ai-tutor-wrapper {
  --tutor-shell: rgba(9, 15, 28, 0.94);
  --tutor-surface: rgba(15, 23, 42, 0.9);
  --tutor-surface-strong: rgba(15, 23, 42, 0.98);
  --tutor-border: rgba(148, 163, 184, 0.16);
  --tutor-text: #f8fafc;
  --tutor-muted: rgba(148, 163, 184, 0.92);
  --tutor-soft: rgba(99, 102, 241, 0.12);
  --tutor-bubble: rgba(255, 255, 255, 0.05);
  --tutor-avatar: rgba(99, 102, 241, 0.14);
  --tutor-code: rgba(15, 23, 42, 0.66);
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
}

:global(html[data-theme='light'] .ai-tutor-wrapper) {
  --tutor-shell: rgba(255, 255, 255, 0.96);
  --tutor-surface: rgba(248, 250, 252, 0.94);
  --tutor-surface-strong: rgba(255, 255, 255, 0.98);
  --tutor-border: rgba(148, 163, 184, 0.22);
  --tutor-text: #182132;
  --tutor-muted: #64748b;
  --tutor-soft: rgba(99, 102, 241, 0.08);
  --tutor-bubble: rgba(226, 232, 240, 0.72);
  --tutor-avatar: rgba(99, 102, 241, 0.08);
  --tutor-code: rgba(15, 23, 42, 0.06);
}

.ai-tutor-fab {
  position: relative;
  min-width: 172px;
  min-height: 60px;
  padding: 0 18px 0 12px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 18px 42px -22px rgba(99, 102, 241, 0.68);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.ai-tutor-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 46px -22px rgba(99, 102, 241, 0.78);
}

.fab-mark {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
}

.fab-copy {
  display: grid;
  gap: 2px;
  text-align: left;
}

.fab-copy strong {
  font-size: 14px;
  line-height: 1;
}

.fab-copy small {
  font-size: 12px;
  opacity: 0.86;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

.ai-tutor-panel {
  width: min(500px, calc(100vw - 32px));
  height: min(760px, calc(100vh - 48px));
  border-radius: 28px;
  border: 1px solid var(--tutor-border);
  background: linear-gradient(180deg, var(--tutor-shell), var(--tutor-surface));
  box-shadow: 0 36px 80px -44px rgba(15, 23, 42, 0.56);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.tutor-header {
  padding: 18px 18px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--tutor-border);
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.1), transparent);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 16px 28px -18px rgba(99, 102, 241, 0.72);
}

.brand-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.brand-copy strong {
  color: var(--tutor-text);
  font-size: 16px;
  line-height: 1;
}

.brand-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.assistant-state-pill {
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--tutor-muted);
  background: rgba(148, 163, 184, 0.12);
  white-space: nowrap;
}

.assistant-state-pill i {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  display: inline-block;
  background: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.assistant-state-pill.typing i {
  background: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
  animation: pulseDot 1.3s infinite;
}

.brand-copy span {
  color: var(--tutor-muted);
  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-tab,
.icon-button,
.starter-chip,
.message-action {
  border: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-tab {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--tutor-muted);
  background: rgba(148, 163, 184, 0.12);
}

.header-tab.is-active {
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.icon-button {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tutor-muted);
  background: transparent;
}

.icon-button:hover,
.message-action:hover {
  color: var(--tutor-text);
  background: var(--tutor-bubble);
}

.icon-button.danger:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.workspace-strip {
  padding: 16px 18px;
  display: grid;
  gap: 12px;
  border-bottom: 1px solid var(--tutor-border);
  background: rgba(255, 255, 255, 0.02);
}

.section-kicker {
  margin: 0 0 8px;
  color: var(--tutor-muted);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-focus h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  color: var(--tutor-text);
}

.workspace-focus p:last-child {
  margin: 8px 0 0;
  color: var(--tutor-muted);
  line-height: 1.6;
  font-size: 13px;
}

.workspace-rail {
  padding: 12px 14px;
  border-radius: 18px;
  display: grid;
  gap: 10px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

:global(html[data-theme='light'] .workspace-rail) {
  background: rgba(255, 255, 255, 0.74);
}

.workspace-progress {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.workspace-progress-copy {
  display: grid;
  gap: 4px;
}

.workspace-progress-copy strong {
  color: var(--tutor-text);
  font-size: 14px;
  line-height: 1.3;
}

.workspace-progress-copy small {
  color: var(--tutor-muted);
  font-size: 12px;
  line-height: 1.55;
}

.meter-track {
  height: 6px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(148, 163, 184, 0.18);
}

.meter-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  transition: width 0.28s ease;
}

.text-action {
  padding: 0;
  border: 0;
  background: transparent;
  color: #818cf8;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.workspace-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.workspace-stats.compact .stat-pill {
  padding: 10px 12px;
  border-radius: 16px;
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.12);
  display: grid;
  gap: 4px;
}

.stat-pill strong {
  font-size: 16px;
  line-height: 1.1;
  color: var(--tutor-text);
}

.stat-pill small {
  color: var(--tutor-muted);
  line-height: 1.4;
  font-size: 11px;
}

.panel-scrim {
  position: absolute;
  inset: 0;
  z-index: 15;
  border: 0;
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(4px);
}

.history-sidebar,
.progress-panel {
  position: absolute;
  left: 16px;
  right: 16px;
  z-index: 20;
  border: 1px solid var(--tutor-border);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 28px 60px -38px rgba(15, 23, 42, 0.7);
  background: var(--tutor-surface-strong);
  display: grid;
  grid-template-rows: auto 1fr;
}

.history-sidebar {
  top: 206px;
  bottom: 112px;
}

.progress-panel {
  top: 206px;
  bottom: 112px;
  background: var(--tutor-surface-strong);
}

.overlay-header {
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--tutor-border);
  background: rgba(255, 255, 255, 0.02);
}

.overlay-header strong {
  color: var(--tutor-text);
  font-size: 15px;
}

.overlay-header p {
  margin: 6px 0 0;
  color: var(--tutor-muted);
  font-size: 12px;
  line-height: 1.5;
}

.overlay-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.overlay-body {
  min-height: 0;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: rgba(255, 255, 255, 0.01);
  transition: filter 0.25s ease, transform 0.25s ease;
}

.chat-messages.is-muted {
  filter: blur(2px) saturate(0.9);
  transform: scale(0.985);
  pointer-events: none;
}

.empty-state {
  margin: auto 0;
  padding: 12px 0;
  display: grid;
  gap: 16px;
}

.empty-mark {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 20px 34px -22px rgba(99, 102, 241, 0.68);
}

.empty-state h2 {
  margin: 0;
  font-size: 24px;
  color: var(--tutor-text);
}

.empty-state p {
  margin: 0;
  color: var(--tutor-muted);
  line-height: 1.7;
}

.starter-grid {
  display: grid;
  gap: 10px;
}

.starter-chip {
  padding: 14px 16px;
  border-radius: 18px;
  display: grid;
  gap: 6px;
  text-align: left;
  color: var(--tutor-text);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.starter-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(99, 102, 241, 0.34);
  background: rgba(99, 102, 241, 0.08);
}

.starter-chip strong {
  font-size: 14px;
}

.starter-chip span {
  color: var(--tutor-muted);
  line-height: 1.55;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.message.reviewed {
  opacity: 0.85;
}

.message-avatar {
  width: 34px;
  height: 34px;
  border-radius: 14px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tutor-text);
  background: var(--tutor-avatar);
}

.message.user .message-avatar {
  background: rgba(59, 130, 246, 0.16);
}

.message-main {
  max-width: min(76%, 360px);
  display: grid;
  gap: 6px;
}

.message.user .message-main {
  justify-items: end;
}

.message-bubble,
.streaming-bubble {
  padding: 13px 16px;
  border-radius: 18px;
  color: var(--tutor-text);
  background: var(--tutor-bubble);
  border: 1px solid rgba(148, 163, 184, 0.12);
  line-height: 1.7;
}

.message.user .message-bubble {
  color: #ffffff;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: transparent;
}

.message-text,
.streaming-text {
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.message-text :deep(strong),
.streaming-text :deep(strong) {
  color: #10b981;
}

.message-text :deep(code),
.streaming-text :deep(code) {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--tutor-code);
  color: #fbbf24;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.message.user .message-text :deep(strong) {
  color: #dbeafe;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--tutor-muted);
}

.review-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #10b981;
}

.message-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message:hover .message-actions {
  opacity: 1;
}

.message-action {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tutor-muted);
  background: transparent;
}

.message-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.typing-indicator {
  padding: 12px 16px;
  border-radius: 18px;
  display: inline-flex;
  gap: 6px;
  background: var(--tutor-bubble);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--tutor-muted);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.streaming-bubble {
  border-color: rgba(99, 102, 241, 0.18);
  background: rgba(99, 102, 241, 0.06);
}

.stream-cursor {
  display: inline-block;
  margin-left: 2px;
  color: #10b981;
  font-weight: 700;
  animation: cursorBlink 1s infinite;
}

.chat-input {
  padding: 12px 18px 18px;
  display: grid;
  gap: 10px;
  border-top: 1px solid var(--tutor-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
}

.input-guide {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: var(--tutor-muted);
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-row :deep(.n-input) {
  flex: 1;
}

.send-button {
  min-width: 86px;
  height: 42px;
  border-radius: 14px;
}

.bounce-enter-active {
  animation: bounce-in 0.45s;
}

.bounce-leave-active {
  animation: bounce-out 0.25s;
}

.slide-up-enter-active,
.slide-up-leave-active,
.slide-right-enter-active,
.slide-right-leave-active,
.slide-up-panel-enter-active,
.slide-up-panel-leave-active {
  transition: all 0.28s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.98);
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.slide-up-panel-enter-from,
.slide-up-panel-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.88);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

@keyframes cursorBlink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

@keyframes pulseDot {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.75;
  }
}

@media (max-width: 768px) {
  .ai-tutor-wrapper {
    right: 16px;
    bottom: 16px;
  }

  .ai-tutor-panel {
    width: calc(100vw - 20px);
    height: calc(100vh - 32px);
    border-radius: 24px;
  }

  .tutor-header,
  .workspace-strip,
  .chat-messages,
  .chat-input {
    padding-left: 14px;
    padding-right: 14px;
  }

  .tutor-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions,
  .workspace-stats,
  .input-row,
  .input-guide {
    width: 100%;
  }

  .header-actions,
  .input-row,
  .workspace-progress {
    flex-wrap: wrap;
  }

  .workspace-stats {
    grid-template-columns: 1fr;
  }

  .message-main {
    max-width: calc(100% - 46px);
  }

  .history-sidebar,
  .progress-panel {
    left: 12px;
    right: 12px;
  }

  .history-sidebar {
    top: 248px;
    bottom: 106px;
  }

  .progress-panel {
    top: 248px;
    bottom: 106px;
  }

  .assistant-state-pill {
    max-width: 100%;
  }

  .brand-meta,
  .workspace-progress,
  .overlay-header {
    align-items: flex-start;
  }

  .workspace-progress,
  .overlay-header {
    flex-direction: column;
  }

  .overlay-actions {
    width: 100%;
    justify-content: space-between;
  }

  .send-button {
    width: 100%;
  }
}
</style>
