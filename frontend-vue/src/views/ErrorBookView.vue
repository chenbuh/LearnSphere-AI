<script setup>
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import {
  NAlert,
  NButton,
  NCollapse,
  NCollapseItem,
  NEmpty,
  NModal,
  NPagination,
  NPopconfirm,
  NSpin,
  useMessage,
  useNotification
} from 'naive-ui'
import confetti from 'canvas-confetti'
import {
  BookOpen,
  BrainCircuit,
  FileText,
  Headphones,
  LayoutGrid,
  Lightbulb,
  MessageCircle,
  Mic,
  PenSquare,
  RotateCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  Type
} from 'lucide-vue-next'
import { learningApi } from '@/api/learning'
import { aiApi } from '@/api/ai'

const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))

const message = useMessage()
const notification = useNotification()

const moduleConfigs = [
  {
    key: 'all',
    label: '全部错题',
    description: '汇总最近沉淀下来的所有失分点。',
    accent: '#6366f1',
    icon: LayoutGrid
  },
  {
    key: 'vocabulary',
    label: '词汇',
    description: '优先看词义辨析、搭配和记忆偏差。',
    accent: '#10b981',
    icon: Type
  },
  {
    key: 'grammar',
    label: '语法',
    description: '聚焦规则判断、结构失误和易混点。',
    accent: '#f59e0b',
    icon: FileText
  },
  {
    key: 'reading',
    label: '阅读',
    description: '回到原文依据，拆开选项陷阱。',
    accent: '#14b8a6',
    icon: BookOpen
  },
  {
    key: 'listening',
    label: '听力',
    description: '定位关键词和转折，重听易错片段。',
    accent: '#ef4444',
    icon: Headphones
  },
  {
    key: 'speaking',
    label: '口语',
    description: '重看表达组织和发音/内容反馈。',
    accent: '#ec4899',
    icon: Mic
  },
  {
    key: 'writing',
    label: '写作',
    description: '把任务回应、逻辑和句式问题收拢。',
    accent: '#8b5cf6',
    icon: PenSquare
  }
]

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: 'recent', label: '最近 30 天' },
  { key: 'choice', label: '选择题' },
  { key: 'text', label: '主观题' },
  { key: 'with-explanation', label: '有解析' }
]

const loading = ref(false)
const errors = ref([])
const activeModule = ref('all')
const searchQuery = ref('')
const activeFilter = ref('all')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const showTutor = ref(false)
const selectedErrorForTutor = ref(null)
const showAiModal = ref(false)
const aiAnalysisResult = ref(null)
const analyzingId = ref(null)

const moduleOverview = reactive(
  Object.fromEntries(
    moduleConfigs.map(module => [
      module.key,
      {
        total: 0,
        latestTime: '',
        metaLoaded: false
      }
    ])
  )
)

let fetchSerial = 0

const getModuleConfig = (moduleKey) => {
  return moduleConfigs.find(module => module.key === moduleKey) || moduleConfigs[0]
}

const currentModule = computed(() => getModuleConfig(activeModule.value))

const tutorContext = computed(() => {
  if (!selectedErrorForTutor.value) {
    return null
  }

  const err = selectedErrorForTutor.value
  return {
    type: 'error_analysis',
    contentType: err.type,
    question: err.question,
    options: err.optionItems.map(option => option.text),
    userAnswer: err.userAnswerLabel,
    correctAnswer: err.correctAnswerLabel,
    explanation: err.explanation,
    topic: '错题复盘',
    module: err.type
  }
})

const normalizeAnswerValue = (value) => {
  if (value === undefined || value === null) {
    return null
  }

  const normalized = String(value).trim()
  if (!normalized || normalized === 'undefined' || normalized === 'null') {
    return null
  }

  return normalized
}

const formatShortDate = (time, fallback = '暂无记录') => {
  if (!time) {
    return fallback
  }

  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatRelativeTime = (time, fallback = '暂无记录') => {
  if (!time) {
    return fallback
  }

  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  const diff = date.getTime() - Date.now()
  const absDiff = Math.abs(diff)
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  if (absDiff < hour) {
    const minutes = Math.max(1, Math.floor(absDiff / (60 * 1000)))
    return diff >= 0 ? `${minutes} 分钟后` : `${minutes} 分钟前`
  }

  if (absDiff < day) {
    const hours = Math.max(1, Math.floor(absDiff / hour))
    return diff >= 0 ? `${hours} 小时后` : `${hours} 小时前`
  }

  if (absDiff < day * 30) {
    const days = Math.max(1, Math.floor(absDiff / day))
    return diff >= 0 ? `${days} 天后` : `${days} 天前`
  }

  return formatShortDate(time, fallback)
}

const truncateText = (text, max = 170) => {
  if (!text) {
    return ''
  }

  const normalized = String(text).replace(/\s+/g, ' ').trim()
  if (normalized.length <= max) {
    return normalized
  }

  return `${normalized.slice(0, max).trim()}…`
}

const normalizeOptionText = (option) => {
  if (option === undefined || option === null) {
    return ''
  }

  if (typeof option === 'string' || typeof option === 'number') {
    return String(option).trim()
  }

  if (typeof option === 'object') {
    return String(
      option.text ??
        option.content ??
        option.label ??
        option.value ??
        option.option ??
        ''
    ).trim()
  }

  return ''
}

const normalizeOptions = (options) => {
  if (!options) {
    return []
  }

  const source = Array.isArray(options) ? options : Object.values(options)
  return source.map(normalizeOptionText).filter(Boolean)
}

const resolveOptionIndex = (answer, options = []) => {
  const normalizedAnswer = normalizeAnswerValue(answer)
  if (!normalizedAnswer || !options.length) {
    return -1
  }

  const numericIndex = Number(normalizedAnswer)
  if (!Number.isNaN(numericIndex) && numericIndex >= 0 && numericIndex < options.length) {
    return numericIndex
  }

  const upperAnswer = normalizedAnswer.toUpperCase()
  if (/^[A-Z]$/.test(upperAnswer)) {
    const alphaIndex = upperAnswer.charCodeAt(0) - 65
    if (alphaIndex >= 0 && alphaIndex < options.length) {
      return alphaIndex
    }
  }

  return options.findIndex(option => normalizeAnswerValue(option) === normalizedAnswer)
}

const formatAnswerDisplay = (answer, options = []) => {
  const normalizedAnswer = normalizeAnswerValue(answer)
  if (!normalizedAnswer) {
    return '未作答'
  }

  const optionIndex = resolveOptionIndex(normalizedAnswer, options)
  if (optionIndex >= 0) {
    return `${String.fromCharCode(65 + optionIndex)} · ${options[optionIndex]}`
  }

  return normalizedAnswer
}

const extractContextText = (details, questionText = '') => {
  const sources = [
    details.title,
    details.content,
    details.passage,
    details.article,
    details.material,
    details.dialogue,
    details.transcript,
    details.reference,
    details.sampleAnswer,
    details.scene
  ]
    .filter(Boolean)
    .map(item => String(item).trim())

  const uniqueSources = [...new Set(sources)]
  return uniqueSources
    .filter(item => item && item !== questionText)
    .join('\n\n')
}

const extractQuestionPayload = (details, record) => {
  const nestedQuestion =
    details.question && typeof details.question === 'object' && !Array.isArray(details.question)
      ? details.question
      : null

  const text =
    nestedQuestion?.question ||
    nestedQuestion?.text ||
    nestedQuestion?.title ||
    (typeof details.question === 'string' ? details.question : '') ||
    details.text ||
    details.prompt ||
    details.topic ||
    record.question ||
    details.title ||
    '未命名错题'

  const options = normalizeOptions(
    nestedQuestion?.options || details.options || details.choices || details.answers
  )

  const explanation =
    nestedQuestion?.explanation ||
    details.explanation ||
    details.analysis ||
    details.feedback ||
    details.reason ||
    ''

  const embeddedCorrect =
    nestedQuestion?.correct ??
    nestedQuestion?.correctAnswer ??
    details.correctAnswer ??
    details.answer ??
    null

  return {
    text: String(text).trim(),
    options,
    explanation: String(explanation || '').trim(),
    embeddedCorrect,
    title: details.title || details.topic || nestedQuestion?.title || ''
  }
}

const buildReviewHint = (type) => {
  const hintMap = {
    vocabulary: '先回看词义辨析和固定搭配。',
    grammar: '回到语法点本身，再看触发条件。',
    reading: '先找原文依据，再拆错误选项。',
    listening: '重听定位句，特别注意转折词。',
    speaking: '重录一遍，先把表达结构说顺。',
    writing: '先检查任务回应，再修逻辑和句式。'
  }

  return hintMap[type] || '先快速复盘一遍，再决定是否重练。'
}

const getKindMeta = (type, options = []) => {
  if (options.length > 0) {
    return {
      kind: 'choice',
      label: '选择题'
    }
  }

  if (type === 'speaking') {
    return {
      kind: 'text',
      label: '口语表达'
    }
  }

  if (type === 'writing') {
    return {
      kind: 'text',
      label: '写作输出'
    }
  }

  return {
    kind: 'text',
    label: '文本题'
  }
}

const parseOriginalContent = (record) => {
  if (!record?.originalContent) {
    return {}
  }

  try {
    return JSON.parse(record.originalContent)
  } catch (error) {
    console.error('Failed to parse originalContent:', error)
    return {}
  }
}

const processRecord = (record) => {
  const details = parseOriginalContent(record)
  const payload = extractQuestionPayload(details, record)
  const moduleConfig = getModuleConfig(record.contentType)
  const options = payload.options
  const userAnswer = normalizeAnswerValue(record.answer)
  const correctAnswerRaw = normalizeAnswerValue(record.correctAnswer ?? payload.embeddedCorrect)
  const userAnswerIndex = resolveOptionIndex(userAnswer, options)
  const correctAnswerIndex = resolveOptionIndex(correctAnswerRaw, options)
  const explanation = payload.explanation || '暂无解析'
  const contextFull = extractContextText(details, payload.text)
  const kindMeta = getKindMeta(record.contentType, options)
  const scoreValue = Number(record.score || 0)
  const masteryValue = Number(record.masteryLevel || 0)

  return {
    id: record.id,
    type: record.contentType || 'all',
    typeLabel: moduleConfig.label,
    icon: moduleConfig.icon,
    accent: moduleConfig.accent,
    sourceTitle: payload.title,
    question: payload.text,
    options,
    hasOptions: options.length > 0,
    optionItems: options.map((option, index) => ({
      label: String.fromCharCode(65 + index),
      text: option,
      isCorrect: index === correctAnswerIndex,
      isUser: index === userAnswerIndex,
      isWrong: index === userAnswerIndex && userAnswerIndex !== correctAnswerIndex
    })),
    userAnswer,
    userAnswerLabel: formatAnswerDisplay(userAnswer, options),
    correctAnswerRaw,
    correctAnswerLabel: formatAnswerDisplay(correctAnswerRaw, options),
    explanation,
    hasExplanation: explanation !== '暂无解析',
    contextFull,
    contextPreview: truncateText(contextFull),
    score: scoreValue,
    scoreLabel: Number.isFinite(scoreValue) ? `得分 ${Math.round(scoreValue)}%` : '未记录得分',
    reviewCount: Number(record.reviewCount || 0),
    lastReviewTime: record.lastReviewTime || '',
    lastReviewText: formatRelativeTime(record.lastReviewTime, '还没复盘'),
    nextReviewTime: record.nextReviewTime || '',
    nextReviewText: formatRelativeTime(record.nextReviewTime, '待安排'),
    masteryLevel: masteryValue,
    masteryLabel: `掌握度 ${masteryValue}/5`,
    reviewHint: buildReviewHint(record.contentType),
    kind: kindMeta.kind,
    kindLabel: kindMeta.label,
    dateText: formatShortDate(record.createTime, '时间未知'),
    createTime: record.createTime || ''
  }
}

const syncModuleOverview = (moduleKey, payload) => {
  const records = payload?.records || []
  moduleOverview[moduleKey].total = payload?.total || 0
  moduleOverview[moduleKey].latestTime =
    records[0]?.createTime || records[0]?.lastReviewTime || moduleOverview[moduleKey].latestTime
  moduleOverview[moduleKey].metaLoaded = true
}

const fetchModuleOverview = async (moduleKey) => {
  try {
    const params = {
      page: 1,
      pageSize: 1,
      isCorrect: 0
    }

    if (moduleKey !== 'all') {
      params.contentType = moduleKey
    }

    const res = await learningApi.getRecords(params)
    if (res.code === 200) {
      syncModuleOverview(moduleKey, res.data)
    }
  } catch (error) {
    console.error(`Failed to fetch overview for ${moduleKey}:`, error)
  }
}

const fetchErrors = async ({ silent = false } = {}) => {
  const currentSerial = ++fetchSerial

  if (!silent) {
    loading.value = true
  }

  try {
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      isCorrect: 0
    }

    if (activeModule.value !== 'all') {
      params.contentType = activeModule.value
    }

    const res = await learningApi.getRecords(params)
    if (currentSerial !== fetchSerial) {
      return
    }

    if (res.code === 200) {
      errors.value = (res.data.records || []).map(processRecord)
      total.value = res.data.total || 0
      syncModuleOverview(activeModule.value, res.data)
      return
    }

    message.error(res.message || '加载错题本失败')
  } catch (error) {
    console.error('Failed to load error book:', error)
    if (currentSerial === fetchSerial && !silent) {
      message.error('加载错题本失败')
    }
  } finally {
    if (!silent && currentSerial === fetchSerial) {
      loading.value = false
    }
  }
}

const isRecentRecord = (time, days = 30) => {
  if (!time) {
    return false
  }

  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000
}

const loadedSpecificModules = computed(() => {
  return moduleConfigs.filter(module => module.key !== 'all' && moduleOverview[module.key].metaLoaded)
})

const overallTotal = computed(() => {
  if (moduleOverview.all.metaLoaded) {
    return moduleOverview.all.total
  }

  if (!loadedSpecificModules.value.length) {
    return null
  }

  return loadedSpecificModules.value.reduce(
    (sum, module) => sum + (moduleOverview[module.key].total || 0),
    0
  )
})

const hottestModule = computed(() => {
  if (!loadedSpecificModules.value.length) {
    return null
  }

  return loadedSpecificModules.value.reduce((topModule, module) => {
    if (!topModule) {
      return module
    }

    return moduleOverview[module.key].total > moduleOverview[topModule.key].total
      ? module
      : topModule
  }, null)
})

const filteredErrors = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  let records = [...errors.value]

  if (keyword) {
    records = records.filter(record => {
      const source = [
        record.question,
        record.sourceTitle,
        record.contextFull,
        record.explanation,
        record.userAnswerLabel,
        record.correctAnswerLabel
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return source.includes(keyword)
    })
  }

  switch (activeFilter.value) {
    case 'recent':
      records = records.filter(record => isRecentRecord(record.createTime, 30))
      break
    case 'choice':
      records = records.filter(record => record.kind === 'choice')
      break
    case 'text':
      records = records.filter(record => record.kind === 'text')
      break
    case 'with-explanation':
      records = records.filter(record => record.hasExplanation)
      break
    default:
      break
  }

  return records
})

const hasLocalFilters = computed(() => {
  return Boolean(searchQuery.value.trim()) || activeFilter.value !== 'all'
})

const overviewStats = computed(() => [
  {
    label: '累计错题',
    value: overallTotal.value ?? '加载中',
    caption: moduleOverview.all.metaLoaded ? '全部错题实时汇总' : '模块概览正在后台补齐'
  },
  {
    label: '高频模块',
    value: hottestModule.value ? hottestModule.value.label : '统计中',
    caption: hottestModule.value
      ? `${moduleOverview[hottestModule.value.key].total} 条待回看`
      : '等更多模块数据加载完成'
  },
  {
    label: '当前聚焦',
    value: currentModule.value.label,
    caption: `${total.value} 条错题位于当前模块`
  }
])

const currentModuleStats = computed(() => [
  {
    label: '模块总量',
    value: `${total.value}`,
    caption: '服务端总数，含未展示页'
  },
  {
    label: '当前可见',
    value: `${filteredErrors.value.length}`,
    caption: hasLocalFilters.value ? '筛选后的当前页结果' : '当前已加载页面数量'
  },
  {
    label: '带解析题',
    value: `${errors.value.filter(record => record.hasExplanation).length}`,
    caption: '当前页已有可直接复盘的解析'
  },
  {
    label: '最近 30 天',
    value: `${errors.value.filter(record => isRecentRecord(record.createTime, 30)).length}`,
    caption: '当前页近期新增的错题'
  }
])

const filterHint = computed(() => {
  if (hasLocalFilters.value) {
    return `当前命中 ${filteredErrors.value.length} 条错题。搜索和筛选只作用于当前已加载页面，翻页后会继续保留。`
  }

  return '先用模块切换定范围，再用本页筛选快速抓出要复盘的题；如果刚做完练习，点刷新就能同步。'
})

const emptyState = computed(() => {
  if (hasLocalFilters.value) {
    return {
      description: '当前筛选没有命中错题',
      hint: '换个关键词，或者清空筛选看这一页的全部记录。'
    }
  }

  return {
    description: `${currentModule.value.label} 暂无错题`,
    hint: '后续做题出错会自动沉淀到这里，方便统一复盘。'
  }
})

const formatModuleTotal = (moduleKey) => {
  if (!moduleOverview[moduleKey].metaLoaded) {
    return '载入中'
  }

  return `${moduleOverview[moduleKey].total} 条`
}

const formatModuleLatest = (moduleKey) => {
  if (!moduleOverview[moduleKey].metaLoaded) {
    return '正在同步'
  }

  return formatRelativeTime(moduleOverview[moduleKey].latestTime, '暂无记录')
}

const clearLocalFilters = () => {
  searchQuery.value = ''
  activeFilter.value = 'all'
}

const handleModuleSelect = (moduleKey) => {
  if (activeModule.value === moduleKey) {
    return
  }

  activeModule.value = moduleKey
  page.value = 1
  clearLocalFilters()
  void fetchErrors()
}

const handlePageChange = (nextPage) => {
  page.value = nextPage
  void fetchErrors()
}

const handlePageSizeChange = (nextPageSize) => {
  pageSize.value = nextPageSize
  page.value = 1
  void fetchErrors()
}

const refreshCurrentModule = () => {
  void fetchErrors()
}

const openAITutor = (error) => {
  selectedErrorForTutor.value = error
  showTutor.value = true
}

const handleTutorClose = () => {
  showTutor.value = false
  selectedErrorForTutor.value = null
}

const handleAiAnalyze = async (record) => {
  analyzingId.value = record.id
  aiAnalysisResult.value = null

  try {
    const res = await aiApi.deepAnalyzeError(record.id)
    if (res.code === 200) {
      aiAnalysisResult.value = res.data
      showAiModal.value = true

      if (Array.isArray(res.data.newAchievements) && res.data.newAchievements.length) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#fbbf24']
        })

        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { x: 0.3, y: 0.7 }
          })
        }, 180)

        res.data.newAchievements.forEach(achievement => {
          notification.success({
            title: '✨ 荣获新成就！',
            content: `恭喜！您已点亮勋章：【${achievement.name}】。${achievement.description}`,
            duration: 8000,
            meta: new Date().toLocaleString()
          })
        })
      }

      return
    }

    message.error(res.message || 'AI 分析失败，请稍后再试')
  } catch (error) {
    console.error('AI analysis failed:', error)
    message.error('AI 分析失败，请检查 API 权益或稍后重试')
  } finally {
    analyzingId.value = null
  }
}

const removeError = async (record) => {
  try {
    const res = await learningApi.deleteRecord(record.id)
    if (res.code !== 200) {
      message.error(res.message || '移除失败')
      return
    }

    message.success('已移出错题本')

    if (errors.value.length === 1 && page.value > 1) {
      page.value -= 1
    }

    await fetchErrors()
    void fetchModuleOverview('all')

    if (record.type && record.type !== 'all') {
      void fetchModuleOverview(record.type)
    }
  } catch (error) {
    console.error('Failed to remove error record:', error)
    message.error('移除失败，请稍后重试')
  }
}

onMounted(async () => {
  await fetchErrors()

  moduleConfigs
    .filter(module => module.key !== activeModule.value)
    .forEach(module => {
      void fetchModuleOverview(module.key)
    })
})
</script>

<template>
  <div class="error-book-view">
    <section class="error-hero">
      <div class="error-hero__copy">
        <div class="hero-kicker">
          <ShieldAlert :size="15" />
          <span>错题复盘工作台</span>
        </div>
        <div class="hero-title-row">
          <div class="hero-mark">
            <Target :size="24" />
          </div>
          <div class="hero-title-copy">
            <h1>错题本</h1>
            <p>
              把散落的失分点收回到一个稳定的复盘面板里，按模块筛出高频问题、看清答案差异，再决定要不要交给 AI 深挖。
            </p>
          </div>
        </div>
      </div>

      <div class="error-hero__stats">
        <article v-for="item in overviewStats" :key="item.label" class="hero-stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.caption }}</small>
        </article>
      </div>
    </section>

    <section class="module-strip" aria-label="错题模块切换">
      <button
        v-for="module in moduleConfigs"
        :key="module.key"
        type="button"
        class="module-chip"
        :class="{ 'is-active': activeModule === module.key }"
        @click="handleModuleSelect(module.key)"
      >
        <span class="module-chip__icon" :style="{ '--chip-accent': module.accent }">
          <component :is="module.icon" :size="18" />
        </span>

        <span class="module-chip__body">
          <strong>{{ module.label }}</strong>
          <span>{{ module.description }}</span>
        </span>

        <span class="module-chip__meta">
          <strong>{{ formatModuleTotal(module.key) }}</strong>
          <small>{{ formatModuleLatest(module.key) }}</small>
        </span>
      </button>
    </section>

    <section class="error-stage">
      <header class="stage-head">
        <div class="stage-head__copy">
          <p class="stage-kicker">当前模块</p>
          <div class="stage-title-row">
            <span class="stage-icon" :style="{ '--chip-accent': currentModule.accent }">
              <component :is="currentModule.icon" :size="20" />
            </span>
            <div>
              <h2>{{ currentModule.label }}</h2>
              <p>{{ currentModule.description }}</p>
            </div>
          </div>
        </div>

        <div class="stage-actions">
          <label class="search-shell">
            <Search :size="16" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索题目、上下文或答案关键词"
            />
          </label>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading"
            @click="refreshCurrentModule"
          >
            <RotateCw :size="16" :class="{ 'is-spinning': loading }" />
            <span>刷新</span>
          </button>
        </div>
      </header>

      <div class="filter-row">
        <div class="filter-pills">
          <button
            v-for="filter in filterOptions"
            :key="filter.key"
            type="button"
            class="filter-pill"
            :class="{ 'is-active': activeFilter === filter.key }"
            @click="activeFilter = filter.key"
          >
            {{ filter.label }}
          </button>
        </div>

        <button
          v-if="hasLocalFilters"
          type="button"
          class="clear-filter-button"
          @click="clearLocalFilters"
        >
          清空筛选
        </button>
      </div>

      <p class="filter-hint">{{ filterHint }}</p>

      <div class="stage-stats">
        <article v-for="item in currentModuleStats" :key="item.label" class="stage-stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.caption }}</small>
        </article>
      </div>

      <n-spin :show="loading">
        <div v-if="filteredErrors.length" class="error-feed">
          <article v-for="err in filteredErrors" :key="err.id" class="error-entry">
            <div class="entry-head">
              <div class="entry-meta">
                <span class="entry-type" :style="{ '--entry-accent': err.accent }">
                  {{ err.typeLabel }}
                </span>
                <span class="entry-kind">{{ err.kindLabel }}</span>
                <span class="entry-time">记录于 {{ err.dateText }}</span>
                <span class="entry-time">复盘 {{ err.reviewCount }} 次</span>
              </div>

              <div class="entry-actions">
                <n-button
                  size="small"
                  secondary
                  type="primary"
                  round
                  :loading="analyzingId === err.id"
                  @click="handleAiAnalyze(err)"
                >
                  <template #icon>
                    <Sparkles :size="14" />
                  </template>
                  AI 深挖
                </n-button>

                <n-button size="small" quaternary round @click="openAITutor(err)">
                  <template #icon>
                    <MessageCircle :size="14" />
                  </template>
                  问问 AI
                </n-button>

                <n-popconfirm @positive-click="removeError(err)">
                  <template #trigger>
                    <n-button size="small" quaternary circle type="error" aria-label="移出错题本">
                      <Trash2 :size="14" />
                    </n-button>
                  </template>
                  移出错题本？
                </n-popconfirm>
              </div>
            </div>

            <div class="entry-body">
              <div class="entry-main">
                <div class="entry-title-row">
                  <span class="entry-title-badge" :style="{ '--entry-accent': err.accent }">
                    <component :is="err.icon" :size="16" />
                  </span>
                  <div>
                    <h3>{{ err.question }}</h3>
                    <p v-if="err.sourceTitle" class="entry-subtitle">{{ err.sourceTitle }}</p>
                  </div>
                </div>

                <p v-if="err.contextPreview" class="entry-context">
                  {{ err.contextPreview }}
                </p>

                <div v-if="err.hasOptions" class="option-stack">
                  <div
                    v-for="option in err.optionItems"
                    :key="`${err.id}-${option.label}`"
                    class="option-row"
                    :class="{
                      'is-correct': option.isCorrect,
                      'is-user': option.isUser,
                      'is-wrong': option.isWrong
                    }"
                  >
                    <span class="option-index">{{ option.label }}</span>
                    <span class="option-text">{{ option.text }}</span>
                    <span v-if="option.isCorrect" class="option-flag success">正确答案</span>
                    <span v-else-if="option.isUser" class="option-flag danger">你的选择</span>
                  </div>
                </div>
              </div>

              <aside class="entry-side">
                <div class="glance-grid">
                  <div class="glance-block danger">
                    <span>你的答案</span>
                    <strong>{{ err.userAnswerLabel }}</strong>
                    <small>{{ err.scoreLabel }}</small>
                  </div>

                  <div class="glance-block success">
                    <span>正确答案</span>
                    <strong>{{ err.correctAnswerLabel }}</strong>
                    <small>{{ err.kindLabel }}</small>
                  </div>

                  <div class="glance-block neutral">
                    <span>复盘提醒</span>
                    <strong>{{ err.reviewHint }}</strong>
                    <small>下次复习 {{ err.nextReviewText }}</small>
                  </div>

                  <div class="glance-block neutral">
                    <span>最近复盘</span>
                    <strong>{{ err.lastReviewText }}</strong>
                    <small>{{ err.masteryLabel }}</small>
                  </div>
                </div>
              </aside>
            </div>

            <div class="entry-footer">
              <n-collapse arrow-placement="right">
                <n-collapse-item title="查看解析与题目上下文" name="insight">
                  <div class="detail-stack">
                    <n-alert v-if="err.hasExplanation" type="info" :show-icon="false" class="detail-alert">
                      {{ err.explanation }}
                    </n-alert>
                    <div v-else class="detail-empty">
                      这道题还没有现成解析，可以点上方的 “AI 深挖” 先补齐错因。
                    </div>

                    <div v-if="err.contextFull" class="detail-context">
                      <span class="detail-label">题目上下文</span>
                      <p>{{ err.contextFull }}</p>
                    </div>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </div>
          </article>

          <div class="pagination-shell">
            <n-pagination
              :page="page"
              :page-size="pageSize"
              :item-count="total"
              show-size-picker
              :page-sizes="[10, 20, 30, 50]"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </div>

        <div v-else class="empty-shell">
          <n-empty :description="emptyState.description" size="large">
            <template #extra>
              <div class="empty-extra">
                <span>{{ emptyState.hint }}</span>
                <n-button tertiary type="primary" @click="refreshCurrentModule">
                  重新拉取
                </n-button>
              </div>
            </template>
          </n-empty>
        </div>
      </n-spin>
    </section>

    <n-modal
      v-model:show="showAiModal"
      preset="card"
      style="width: min(760px, calc(100vw - 24px)); border-radius: 28px;"
      :bordered="false"
      class="ai-analysis-modal"
    >
      <template #header>
        <div class="ai-modal-header">
          <div class="title-main">
            <BrainCircuit :size="22" />
            <span>AI 错因深挖</span>
          </div>
          <div class="modal-status-badge">
            <span class="pulse-dot"></span>
            ANALYSIS READY
          </div>
        </div>
      </template>

      <div v-if="aiAnalysisResult" class="ai-analysis-container">
        <section class="analysis-segment">
          <div class="segment-label">
            <Lightbulb :size="14" />
            错因判断
          </div>
          <div class="analysis-box">
            <p class="analysis-text">{{ aiAnalysisResult.analysis }}</p>
          </div>
        </section>

        <section class="analysis-segment">
          <div class="segment-label amber">
            <BookOpen :size="14" />
            知识补强
          </div>
          <div class="analysis-box warm">
            <p class="analysis-text warm-text">{{ aiAnalysisResult.knowledgeShield }}</p>
          </div>
        </section>

        <section v-if="aiAnalysisResult.challengeQuestion?.text" class="analysis-segment">
          <div class="segment-label emerald">
            <BrainCircuit :size="14" />
            即时追问
          </div>
          <div class="challenge-shell">
            <h4>{{ aiAnalysisResult.challengeQuestion.text }}</h4>
            <div v-if="aiAnalysisResult.challengeQuestion.options?.length" class="challenge-options">
              <div
                v-for="(option, index) in aiAnalysisResult.challengeQuestion.options"
                :key="`challenge-${index}`"
                class="challenge-option"
              >
                <span>{{ String.fromCharCode(65 + index) }}</span>
                <p>{{ option }}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="ai-modal-footer">
          <div v-if="aiAnalysisResult?.points" class="points-earned">
            奖励积分 <strong>+{{ aiAnalysisResult.points }}</strong>
          </div>
          <n-button type="primary" round @click="showAiModal = false">
            收下分析，继续复盘
          </n-button>
        </div>
      </template>
    </n-modal>

    <AITutor :context="tutorContext" :auto-open="showTutor" @close="handleTutorClose" />
  </div>
</template>

<style scoped>
.error-book-view {
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  color: var(--text-color);
  --error-panel-bg: rgba(255, 255, 255, 0.72);
  --error-panel-strong: rgba(255, 255, 255, 0.9);
  --error-panel-border: rgba(148, 163, 184, 0.18);
  --error-panel-shadow: 0 30px 60px -42px rgba(15, 23, 42, 0.28);
  --error-muted: rgba(71, 85, 105, 0.92);
  --error-soft: rgba(99, 102, 241, 0.09);
  --error-entry-bg: rgba(255, 255, 255, 0.58);
}

:global(html[data-theme='dark'] .error-book-view) {
  --error-panel-bg: rgba(15, 23, 42, 0.72);
  --error-panel-strong: rgba(15, 23, 42, 0.92);
  --error-panel-border: rgba(148, 163, 184, 0.16);
  --error-panel-shadow: 0 34px 56px -40px rgba(2, 6, 23, 0.72);
  --error-muted: rgba(148, 163, 184, 0.92);
  --error-soft: rgba(99, 102, 241, 0.14);
  --error-entry-bg: rgba(15, 23, 42, 0.48);
}

.error-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: 18px;
  align-items: stretch;
  margin-bottom: 20px;
}

.error-hero__copy,
.error-hero__stats,
.error-stage,
.error-entry {
  border: 1px solid var(--error-panel-border);
  background: linear-gradient(180deg, var(--error-panel-strong), var(--error-panel-bg));
  box-shadow: var(--error-panel-shadow);
  backdrop-filter: blur(20px);
}

.error-hero__copy {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 24px 26px;
}

.error-hero__copy::after {
  content: '';
  position: absolute;
  inset: auto -48px -60px auto;
  width: 240px;
  height: 240px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.16), transparent 72%);
  pointer-events: none;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--error-soft);
  color: var(--secondary-text);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero-title-row,
.stage-title-row,
.entry-title-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.hero-title-row {
  margin-top: 18px;
}

.hero-mark,
.stage-icon {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chip-accent, #6366f1);
  background: color-mix(in srgb, var(--chip-accent, #6366f1) 14%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--chip-accent, #6366f1) 22%, transparent);
}

.hero-title-copy h1,
.stage-title-row h2 {
  margin: 0;
  font-size: clamp(28px, 3.2vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.hero-title-copy p,
.stage-title-row p {
  margin: 10px 0 0;
  max-width: 700px;
  line-height: 1.72;
  color: var(--error-muted);
  font-size: 14px;
}

.error-hero__stats {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 28px;
}

.hero-stat,
.stage-stat {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

:global(html[data-theme='dark'] .hero-stat),
:global(html[data-theme='dark'] .stage-stat) {
  background: rgba(15, 23, 42, 0.4);
  border-color: rgba(148, 163, 184, 0.12);
}

.hero-stat span,
.stage-stat span {
  font-size: 12px;
  color: var(--secondary-text);
  letter-spacing: 0.03em;
}

.hero-stat strong,
.stage-stat strong {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.hero-stat small,
.stage-stat small {
  color: var(--error-muted);
  line-height: 1.5;
}

.module-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.module-chip {
  padding: 14px;
  border: 1px solid var(--error-panel-border);
  border-radius: 22px;
  background: linear-gradient(180deg, var(--error-panel-strong), var(--error-panel-bg));
  color: inherit;
  box-shadow: var(--error-panel-shadow);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    background 0.22s ease;
}

.module-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.28);
}

.module-chip.is-active {
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 26px 42px -34px rgba(99, 102, 241, 0.42);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 247, 255, 0.92));
}

:global(html[data-theme='dark'] .module-chip.is-active) {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.94));
}

.module-chip__icon,
.entry-title-badge {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chip-accent, var(--entry-accent, #6366f1));
  background: color-mix(
    in srgb,
    var(--chip-accent, var(--entry-accent, #6366f1)) 14%,
    transparent
  );
}

.module-chip__body,
.module-chip__meta {
  display: grid;
  gap: 4px;
}

.module-chip__body strong,
.module-chip__meta strong {
  font-size: 14px;
  font-weight: 700;
}

.module-chip__body span,
.module-chip__meta small {
  font-size: 12px;
  line-height: 1.45;
  color: var(--error-muted);
}

.module-chip__meta {
  justify-items: end;
}

.error-stage {
  border-radius: 30px;
  padding: 22px;
}

.stage-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.stage-kicker {
  margin: 0 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--secondary-text);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stage-title-row h2 {
  font-size: 26px;
}

.stage-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-shell {
  width: min(360px, 42vw);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  min-height: 46px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
  background: rgba(255, 255, 255, 0.68);
  color: var(--secondary-text);
}

:global(html[data-theme='dark'] .search-shell) {
  background: rgba(15, 23, 42, 0.66);
}

.search-shell input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: 14px;
}

.search-shell input::placeholder {
  color: var(--secondary-text);
}

.refresh-button,
.clear-filter-button,
.filter-pill {
  border: 0;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;
}

.refresh-button {
  min-height: 46px;
  padding: 0 16px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 18px 28px -20px rgba(99, 102, 241, 0.6);
}

.refresh-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.filter-row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-pill,
.clear-filter-button {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  color: var(--secondary-text);
  background: var(--error-soft);
}

.filter-pill.is-active {
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 16px 24px -18px rgba(99, 102, 241, 0.54);
}

.clear-filter-button {
  background: rgba(148, 163, 184, 0.12);
}

.filter-hint {
  margin: 12px 0 0;
  color: var(--error-muted);
  font-size: 13px;
  line-height: 1.6;
}

.stage-stats {
  margin: 18px 0 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.error-feed {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.error-entry {
  border-radius: 28px;
  padding: 20px;
}

.entry-head,
.entry-actions,
.entry-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.entry-head {
  justify-content: space-between;
}

.entry-type,
.entry-kind,
.entry-time {
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
}

.entry-type {
  color: var(--entry-accent, #6366f1);
  background: color-mix(in srgb, var(--entry-accent, #6366f1) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--entry-accent, #6366f1) 22%, transparent);
}

.entry-kind,
.entry-time {
  color: var(--secondary-text);
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.entry-body {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 18px;
  align-items: start;
}

.entry-main h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.55;
}

.entry-subtitle {
  margin: 6px 0 0;
  color: var(--secondary-text);
  font-size: 13px;
}

.entry-context {
  margin: 16px 0 0;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.12);
  line-height: 1.72;
  color: var(--error-muted);
}

.option-stack {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.option-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.38);
}

:global(html[data-theme='dark'] .option-row) {
  background: rgba(15, 23, 42, 0.38);
}

.option-row.is-correct {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.22);
}

.option-row.is-user:not(.is-correct),
.option-row.is-wrong {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.22);
}

.option-index {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--secondary-text);
  background: rgba(148, 163, 184, 0.12);
}

.option-text {
  line-height: 1.6;
}

.option-flag {
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
}

.option-flag.success {
  color: #059669;
  background: rgba(16, 185, 129, 0.14);
}

.option-flag.danger {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.12);
}

.glance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.glance-block {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: var(--error-entry-bg);
}

.glance-block span {
  font-size: 12px;
  color: var(--secondary-text);
}

.glance-block strong {
  font-size: 15px;
  line-height: 1.55;
}

.glance-block small {
  color: var(--error-muted);
  line-height: 1.45;
}

.glance-block.danger {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.18);
}

.glance-block.danger strong {
  color: #dc2626;
}

.glance-block.success {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.18);
}

.glance-block.success strong {
  color: #059669;
}

.entry-footer {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

:deep(.entry-footer .n-collapse) {
  background: transparent;
}

:deep(.entry-footer .n-collapse-item__header-main) {
  font-weight: 600;
}

.detail-stack {
  display: grid;
  gap: 12px;
  padding: 8px 0 4px;
}

.detail-alert {
  border-radius: 18px;
}

.detail-empty {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(148, 163, 184, 0.08);
  color: var(--error-muted);
}

.detail-context {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

:global(html[data-theme='dark'] .detail-context) {
  background: rgba(15, 23, 42, 0.42);
}

.detail-label {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--secondary-text);
  letter-spacing: 0.03em;
}

.detail-context p {
  margin: 0;
  white-space: pre-line;
  line-height: 1.74;
}

.pagination-shell {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.empty-shell {
  padding: 42px 0 14px;
}

.empty-extra {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--error-muted);
}

:deep(.ai-analysis-modal .n-card) {
  background: linear-gradient(180deg, var(--error-panel-strong), var(--error-panel-bg)) !important;
  box-shadow: var(--error-panel-shadow) !important;
  backdrop-filter: blur(22px) !important;
}

.ai-modal-header,
.ai-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.title-main {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
}

.modal-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #6366f1;
  letter-spacing: 0.08em;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #6366f1;
  animation: pulse-radar 2s infinite;
}

.ai-analysis-container {
  display: grid;
  gap: 14px;
}

.analysis-segment {
  display: grid;
  gap: 10px;
}

.segment-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  color: #6366f1;
  letter-spacing: 0.08em;
}

.segment-label.amber {
  color: #d97706;
}

.segment-label.emerald {
  color: #059669;
}

.analysis-box {
  padding: 18px 20px;
  border-radius: 20px;
  background: var(--error-entry-bg);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.analysis-box.warm {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.28));
  border-color: rgba(245, 158, 11, 0.18);
}

:global(html[data-theme='dark'] .analysis-box.warm) {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), rgba(15, 23, 42, 0.44));
}

.analysis-text {
  margin: 0;
  color: var(--text-color);
  line-height: 1.8;
  white-space: pre-line;
}

.challenge-shell {
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.16);
}

.challenge-shell h4 {
  margin: 0 0 14px;
  font-size: 16px;
  line-height: 1.7;
}

.challenge-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.challenge-option {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--error-entry-bg);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.challenge-option span {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  font-weight: 700;
}

.challenge-option p {
  margin: 0;
  line-height: 1.6;
}

.points-earned {
  color: var(--error-muted);
  font-size: 13px;
}

.points-earned strong {
  color: #d97706;
}

.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-radar {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.35;
    transform: scale(1.55);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 1200px) {
  .error-hero {
    grid-template-columns: 1fr;
  }

  .module-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .stage-head,
  .entry-body {
    grid-template-columns: 1fr;
  }

  .stage-head {
    flex-direction: column;
  }

  .stage-actions {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .search-shell {
    width: 100%;
  }

  .stage-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .module-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .error-book-view {
    padding: 12px 8px 24px;
  }

  .error-hero__copy,
  .error-hero__stats,
  .error-stage,
  .error-entry {
    border-radius: 24px;
  }

  .error-hero__copy,
  .error-stage,
  .error-entry {
    padding: 18px 16px;
  }

  .hero-title-row,
  .stage-title-row,
  .entry-title-row {
    gap: 12px;
  }

  .hero-mark,
  .stage-icon {
    width: 46px;
    height: 46px;
    border-radius: 15px;
  }

  .hero-title-copy h1,
  .stage-title-row h2 {
    font-size: 24px;
  }

  .filter-row,
  .entry-head,
  .ai-modal-header,
  .ai-modal-footer,
  .empty-extra {
    flex-direction: column;
    align-items: flex-start;
  }

  .entry-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .stage-stats,
  .glance-grid,
  .challenge-options {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .module-strip {
    grid-template-columns: 1fr;
  }

  .module-chip {
    grid-template-columns: auto 1fr;
  }

  .module-chip__meta {
    grid-column: 2 / 3;
    justify-items: start;
  }

  .option-row {
    grid-template-columns: auto 1fr;
    align-items: start;
  }

  .option-flag {
    grid-column: 2 / 3;
    justify-self: start;
  }
}

@media (max-width: 480px) {
  .error-book-view {
    padding: 10px 6px 20px;
  }

  .error-hero__copy,
  .error-hero__stats,
  .error-stage,
  .error-entry {
    border-radius: 20px;
  }

  .error-hero__copy,
  .error-stage,
  .error-entry {
    padding: 16px 14px;
  }

  .error-hero__stats {
    padding: 12px;
  }

  .hero-mark,
  .stage-icon,
  .module-chip__icon,
  .entry-title-badge {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .hero-title-copy h1,
  .stage-title-row h2,
  .entry-main h3 {
    font-size: 20px;
  }

  .hero-stat,
  .stage-stat,
  .glance-block {
    padding: 12px;
  }

  .hero-stat strong,
  .stage-stat strong {
    font-size: 20px;
  }

  .module-chip {
    padding: 12px;
    gap: 10px;
    border-radius: 18px;
  }

  .module-chip__body strong,
  .module-chip__meta strong {
    font-size: 13px;
  }

  .module-chip__body span,
  .module-chip__meta small {
    font-size: 11px;
  }

  .stage-actions,
  .filter-row,
  .entry-actions,
  .ai-modal-header,
  .ai-modal-footer,
  .empty-extra {
    gap: 10px;
  }

  .stage-actions > *,
  .filter-row > *,
  .entry-actions > * {
    width: 100%;
  }

  .search-shell {
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
  }

  .entry-head {
    align-items: flex-start;
  }

  .entry-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .option-row {
    padding: 10px 12px;
    gap: 10px;
  }

  .option-flag {
    min-height: 24px;
    padding: 0 8px;
  }

  .entry-context,
  .detail-context {
    padding: 14px;
  }
}

@media (max-width: 360px) {
  .hero-title-copy h1,
  .stage-title-row h2,
  .entry-main h3 {
    font-size: 18px;
  }

  .module-chip {
    grid-template-columns: auto 1fr;
  }

  .module-chip__meta {
    grid-column: 1 / -1;
    justify-items: start;
    padding-top: 2px;
  }

  .entry-type,
  .entry-kind,
  .entry-time,
  .filter-pill,
  .clear-filter-button {
    width: 100%;
    justify-content: center;
  }

  .glance-block small,
  .detail-context p {
    font-size: 12px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .error-book-view {
    padding-bottom: 16px;
  }

  .error-stage,
  .error-entry {
    padding-top: 16px;
    padding-bottom: 16px;
  }
}
</style>
