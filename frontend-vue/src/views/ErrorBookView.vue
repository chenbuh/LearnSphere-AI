<script setup>
import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NAlert,
  NButton,
  NCollapse,
  NCollapseItem,
  NPagination,
  NPopconfirm,
  NSpin,
  useMessage,
  useNotification
} from 'naive-ui'
import confetti from 'canvas-confetti'
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Headphones,
  LayoutGrid,
  MessageCircle,
  Mic,
  PenSquare,
  RotateCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Type,
  Zap
} from 'lucide-vue-next'
import { learningApi } from '@/api/learning'
import { aiApi } from '@/api/ai'

const router = useRouter()
const AITutor = defineAsyncComponent(() => import('@/components/AITutor.vue'))
// 低频弹窗：仅在点击「AI 深挖」后加载
const ErrorBookAiAnalysisModal = defineAsyncComponent(
  () => import('@/components/errorbook/ErrorBookAiAnalysisModal.vue')
)

const message = useMessage()
const notification = useNotification()

const moduleConfigs = [
  {
    key: 'all',
    label: '全部错题',
    description: '汇总最近沉淀下来的所有失分点。',
    accent: 'var(--tone-emerald)',
    icon: LayoutGrid
  },
  {
    key: 'vocabulary',
    label: '词汇',
    description: '优先看词义辨析、搭配和记忆偏差。',
    accent: 'var(--tone-emerald)',
    icon: Type
  },
  {
    key: 'grammar',
    label: '语法',
    description: '聚焦规则判断、结构失误和易混点。',
    accent: 'var(--tone-amber)',
    icon: FileText
  },
  {
    key: 'reading',
    label: '阅读',
    description: '回到原文依据，拆开选项陷阱。',
    accent: 'var(--tone-cyan)',
    icon: BookOpen
  },
  {
    key: 'listening',
    label: '听力',
    description: '定位关键词和转折，重听易错片段。',
    accent: 'var(--tone-red)',
    icon: Headphones
  },
  {
    key: 'speaking',
    label: '口语',
    description: '重看表达组织和发音/内容反馈。',
    accent: 'var(--tone-orange)',
    icon: Mic
  },
  {
    key: 'writing',
    label: '写作',
    description: '把任务回应、逻辑和句式问题收拢。',
    accent: 'var(--tone-emerald)',
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

const getModuleConfig = moduleKey => {
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

const normalizeAnswerValue = value => {
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

const normalizeOptionText = option => {
  if (option === undefined || option === null) {
    return ''
  }

  if (typeof option === 'string' || typeof option === 'number') {
    return String(option).trim()
  }

  if (typeof option === 'object') {
    return String(
      option.text ?? option.content ?? option.label ?? option.value ?? option.option ?? ''
    ).trim()
  }

  return ''
}

const normalizeOptions = options => {
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
  return uniqueSources.filter(item => item && item !== questionText).join('\n\n')
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

const buildReviewHint = type => {
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

const parseOriginalContent = record => {
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

const processRecord = record => {
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

const fetchModuleOverview = async moduleKey => {
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
  return moduleConfigs.filter(
    module => module.key !== 'all' && moduleOverview[module.key].metaLoaded
  )
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

const masteryStatus = computed(() => {
  const tot = overallTotal.value ?? 0
  if (tot === 0) {
    return {
      isClean: true,
      title: '错题池已完全清零 · 表现卓越',
      subtitle: '当前暂无积压的失分点，继续保持高质量训练，向更高阶能力发起冲刺！',
      badge: '全科零缺陷',
      tone: 'emerald'
    }
  }
  return {
    isClean: false,
    title: `当前共收录 ${tot} 道待复盘错题`,
    subtitle: `重点攻坚高频模块【${hottestModule.value?.label || '失分项'}】，及时消化避免同类错误重现。`,
    badge: '待消化攻坚',
    tone: 'rose'
  }
})

const overviewStats = computed(() => {
  const tot = overallTotal.value ?? 0
  const isZero = tot === 0
  return [
    {
      key: 'total',
      label: '累计错题',
      value: overallTotal.value ?? '加载中',
      badge: isZero ? '零积压' : '待消化',
      tone: isZero ? 'emerald' : 'rose',
      icon: ShieldAlert,
      caption: moduleOverview.all.metaLoaded ? '全科目错题实时汇总' : '模块概览同步中'
    },
    {
      key: 'hot',
      label: '高频模块',
      value: hottestModule.value ? hottestModule.value.label : '暂无',
      badge:
        hottestModule.value && moduleOverview[hottestModule.value.key].total > 0
          ? '重点攻坚'
          : '状态平稳',
      tone: 'amber',
      icon: Zap,
      caption: hottestModule.value
        ? `${moduleOverview[hottestModule.value.key].total} 条待复盘`
        : '暂无集中失分点'
    },
    {
      key: 'focus',
      label: '当前聚焦',
      value: currentModule.value.label,
      badge: `${total.value} 题在池`,
      tone: 'indigo',
      icon: Target,
      caption: `${total.value} 条位于当前模块`
    }
  ]
})

const goToPractice = () => {
  const map = {
    vocabulary: '/vocabulary',
    reading: '/reading',
    listening: '/listening',
    speaking: '/speaking',
    writing: '/writing',
    grammar: '/grammar'
  }
  const target = map[activeModule.value] || '/learning-hub'
  router.push(target)
}

const openGeneralAiTutor = () => {
  if (filteredErrors.value.length > 0) {
    openAITutor(filteredErrors.value[0])
  } else {
    selectedErrorForTutor.value = {
      type: currentModule.value.key,
      question: '错题本阶段性总结与巩固建议',
      optionItems: [],
      userAnswerLabel: '无',
      correctAnswerLabel: '无',
      explanation: '当前错题池无积压题目，请为我制定下一阶段巩固规划。'
    }
    showTutor.value = true
  }
}

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

const formatModuleTotal = moduleKey => {
  if (!moduleOverview[moduleKey].metaLoaded) {
    return '载入中'
  }

  return `${moduleOverview[moduleKey].total} 条`
}

const formatModuleLatest = moduleKey => {
  if (!moduleOverview[moduleKey].metaLoaded) {
    return '正在同步'
  }

  return formatRelativeTime(moduleOverview[moduleKey].latestTime, '暂无记录')
}

const clearLocalFilters = () => {
  searchQuery.value = ''
  activeFilter.value = 'all'
}

const handleModuleSelect = moduleKey => {
  if (activeModule.value === moduleKey) {
    return
  }

  activeModule.value = moduleKey
  page.value = 1
  clearLocalFilters()
  void fetchErrors()
}

const handlePageChange = nextPage => {
  page.value = nextPage
  void fetchErrors()
}

const handlePageSizeChange = nextPageSize => {
  pageSize.value = nextPageSize
  page.value = 1
  void fetchErrors()
}

const refreshCurrentModule = () => {
  void fetchErrors()
}

const openAITutor = error => {
  selectedErrorForTutor.value = error
  showTutor.value = true
}

const handleTutorClose = () => {
  showTutor.value = false
  selectedErrorForTutor.value = null
}

const handleAiAnalyze = async record => {
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
          colors: ['#1e6b52', '#2b7a60', '#fbbf24']
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

const removeError = async record => {
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
    <!-- 顶部全真复盘控制台 -->
    <section class="error-hero">
      <div class="error-hero__copy">
        <div class="hero-ambient-glow"></div>

        <div class="hero-topline">
          <div class="hero-kicker">
            <span class="kicker-dot"></span>
            <ShieldAlert :size="15" />
            <span>全真错题复盘工作台</span>
          </div>
          <div class="hero-status-pill" :class="`hero-status-pill--${masteryStatus.tone}`">
            <component :is="masteryStatus.isClean ? CheckCircle2 : AlertCircle" :size="14" />
            <span>{{ masteryStatus.badge }}</span>
          </div>
        </div>

        <div class="hero-title-row">
          <div class="hero-mark">
            <Target :size="26" />
          </div>
          <div class="hero-title-copy">
            <h1>错题本</h1>
            <p>
              把散落的失分点收回到统一的智能诊断桌面，按模块筛查高频错因、拆解答案差异，让每一次失误都转化为提分跳板。
            </p>
          </div>
        </div>

        <!-- 错题掌控度态势与快捷行动跳板（彻底消除死黑空洞） -->
        <div class="hero-mastery-strip">
          <div class="mastery-summary">
            <div class="mastery-icon-box" :class="`mastery-icon-box--${masteryStatus.tone}`">
              <component :is="masteryStatus.isClean ? Trophy : ShieldAlert" :size="20" />
            </div>
            <div class="mastery-text">
              <strong>{{ masteryStatus.title }}</strong>
              <span>{{ masteryStatus.subtitle }}</span>
            </div>
          </div>

          <div class="mastery-actions">
            <button
              type="button"
              class="hero-action-btn hero-action-btn--primary"
              @click="goToPractice"
            >
              <span>前往练习巩固</span>
              <ArrowRight :size="15" />
            </button>
            <button
              type="button"
              class="hero-action-btn hero-action-btn--secondary"
              @click="openGeneralAiTutor"
            >
              <Sparkles :size="15" />
              <span>AI 诊断咨询</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧 3 大 Bento 微光晶体卡片 -->
      <div class="error-hero__stats">
        <article
          v-for="item in overviewStats"
          :key="item.label"
          class="hero-bento-card"
          :class="`hero-bento-card--${item.tone}`"
        >
          <div class="bento-header">
            <div class="bento-icon-box">
              <component :is="item.icon" :size="18" />
            </div>
            <span class="bento-badge">{{ item.badge }}</span>
          </div>

          <div class="bento-body">
            <span class="bento-label">{{ item.label }}</span>
            <strong class="bento-value">{{ item.value }}</strong>
            <small class="bento-caption">{{ item.caption }}</small>
          </div>
        </article>
      </div>
    </section>

    <!-- 7 模块等宽优雅对称网格 -->
    <section class="module-strip" aria-label="错题模块切换">
      <button
        v-for="module in moduleConfigs"
        :key="module.key"
        type="button"
        class="module-chip"
        :class="{
          'is-active': activeModule === module.key,
          'module-chip--all': module.key === 'all'
        }"
        @click="handleModuleSelect(module.key)"
      >
        <span class="module-chip__icon" :style="{ '--chip-accent': module.accent }">
          <component :is="module.icon" :size="19" />
        </span>

        <span class="module-chip__body">
          <div class="module-chip__title-row">
            <strong>{{ module.label }}</strong>
            <span class="module-count-tag" :style="{ '--chip-accent': module.accent }">
              {{ formatModuleTotal(module.key) }}
            </span>
          </div>
          <span class="module-chip__desc">{{ module.description }}</span>
        </span>

        <span class="module-chip__meta">
          <small>{{ formatModuleLatest(module.key) }}</small>
        </span>
      </button>
    </section>

    <section class="error-stage">
      <header class="stage-head">
        <div class="stage-head__copy">
          <p class="stage-kicker">当前聚焦模块</p>
          <div class="stage-title-row">
            <span class="stage-icon" :style="{ '--chip-accent': currentModule.accent }">
              <component :is="currentModule.icon" :size="22" />
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
              placeholder="搜索题目、上下文或答案关键词..."
            />
          </label>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading"
            @click="refreshCurrentModule"
          >
            <RotateCw :size="16" :class="{ 'is-spinning': loading }" />
            <span>刷新同步</span>
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
                    <n-alert
                      v-if="err.hasExplanation"
                      type="info"
                      :show-icon="false"
                      class="detail-alert"
                    >
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

        <!-- 极客微光零缺陷勋章舱（优雅空状态） -->
        <div v-else class="empty-shell">
          <div class="zero-defect-card">
            <div class="zero-defect-icon-chamber">
              <Trophy :size="48" class="trophy-icon" />
              <div class="trophy-glow-halo"></div>
            </div>
            <h3 class="zero-defect-title">{{ emptyState.description }}</h3>
            <p class="zero-defect-subtitle">{{ emptyState.hint }}</p>
            <div class="zero-defect-actions">
              <button
                type="button"
                class="zero-action-btn zero-action-btn--primary"
                @click="goToPractice"
              >
                <span>前往练习刷题</span>
                <ArrowRight :size="15" />
              </button>
              <button
                type="button"
                class="zero-action-btn zero-action-btn--secondary"
                @click="refreshCurrentModule"
              >
                <RotateCw :size="15" :class="{ 'is-spinning': loading }" />
                <span>刷新同步记录</span>
              </button>
            </div>
          </div>
        </div>
      </n-spin>
    </section>

    <ErrorBookAiAnalysisModal v-model:show="showAiModal" :result="aiAnalysisResult" />

    <AITutor :context="tutorContext" :auto-open="showTutor" @close="handleTutorClose" />
  </div>
</template>

<style scoped>
.error-book-view {
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  color: var(--text-color);
  /* 默认深色极客 Obsidian & Slate 变量基底 */
  --error-panel-bg: rgba(17, 24, 39, 0.75);
  --error-panel-strong: rgba(15, 23, 42, 0.9);
  --error-panel-border: rgba(255, 255, 255, 0.08);
  --error-panel-shadow: 0 24px 60px -12px rgba(2, 6, 23, 0.55);
  --error-muted: #94a3b8;
  --error-soft: rgba(30, 107, 82, 0.12);
  --error-entry-bg: rgba(17, 24, 39, 0.62);
  --error-glow-primary: rgba(30, 107, 82, 0.18);
  --error-glow-secondary: rgba(16, 185, 129, 0.14);
}

:global(html[data-theme='light'] .error-book-view) {
  --error-panel-bg: rgba(255, 255, 255, 0.85);
  --error-panel-strong: rgba(255, 255, 255, 0.95);
  --error-panel-border: rgba(203, 213, 225, 0.6);
  --error-panel-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.08);
  --error-muted: #64748b;
  --error-soft: rgba(30, 107, 82, 0.08);
  --error-entry-bg: rgba(248, 250, 252, 0.88);
  --error-glow-primary: rgba(30, 107, 82, 0.08);
  --error-glow-secondary: rgba(16, 185, 129, 0.06);
}

.error-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(330px, 0.85fr);
  gap: 20px;
  align-items: stretch;
  margin-bottom: 22px;
}

.error-hero__copy,
.error-hero__stats,
.error-stage,
.error-entry {
  border: 1px solid var(--error-panel-border);
  background: var(--card-bg);
}

.error-hero__copy {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  padding: 26px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hero-ambient-glow {
  position: absolute;
  top: -90px;
  right: -90px;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: transparent;
  pointer-events: none;
}

.hero-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.26);
  color: var(--tone-amber);
  font-size: 0.76rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  width: fit-content;
}

.kicker-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #fbbf24;
  animation: kicker-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes kicker-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.85);
  }
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.hero-status-pill--emerald {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.hero-status-pill--rose {
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.hero-title-row {
  margin-top: 14px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.hero-mark {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tone-emerald);
  background: var(--tone-emerald-soft);
  box-shadow:
    0 0 20px rgba(30, 107, 82, 0.2),
    inset 0 0 0 1px rgba(30, 107, 82, 0.3);
}

.hero-title-copy h1 {
  margin: 0;
  font-size: clamp(26px, 3vw, 34px);
  line-height: 1.1;
  font-weight: 850;
  letter-spacing: -0.03em;
  background: none;
  color: inherit;
}

:global(html[data-theme='light'] .hero-title-copy h1) {
  background: none;
  color: inherit;
}

.hero-title-copy p {
  margin: 8px 0 0;
  max-width: 680px;
  line-height: 1.65;
  color: var(--error-muted);
  font-size: 13.5px;
}

/* 错题掌控度态势小舱（彻底根除死黑空洞） */
.hero-mastery-strip {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

:global(html[data-theme='light'] .hero-mastery-strip) {
  border-color: rgba(226, 232, 240, 0.85);
  background: rgba(248, 250, 252, 0.95);
}

.mastery-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.mastery-icon-box {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mastery-icon-box--emerald {
  color: var(--tone-emerald);
  background: var(--tone-emerald-soft);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.mastery-icon-box--rose {
  color: var(--tone-red);
  background: var(--tone-red-soft);
  border: 1px solid rgba(248, 113, 113, 0.3);
}

.mastery-text {
  display: grid;
  gap: 2px;
}

.mastery-text strong {
  font-size: 14px;
  font-weight: 750;
  color: var(--text-color);
}

:global(html[data-theme='light'] .mastery-text strong) {
  color: var(--text-color);
}

.mastery-text span {
  font-size: 12px;
  color: var(--error-muted);
  line-height: 1.45;
}

.mastery-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.hero-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hero-action-btn--primary {
  color: var(--brand-ink);
  background: var(--brand);
}

.hero-action-btn--primary:hover {
  transform: translateY(-2px);
}

.hero-action-btn--secondary {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(95, 168, 139, 0.25);
}

.hero-action-btn--secondary:hover {
  transform: translateY(-2px);
  background: rgba(30, 107, 82, 0.2);
  color: var(--text-color);
}

:global(html[data-theme='light'] .hero-action-btn--secondary) {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.08);
  border-color: rgba(30, 107, 82, 0.2);
}

/* ==========================================================================
   右侧 3 大 Bento 独立微光晶体卡片
   ========================================================================== */
.error-hero__stats {
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius-lg);
}

.hero-bento-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  transition:
    transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.hero-bento-card:hover {
  transform: translateY(-2px);
}

:global(html[data-theme='light'] .hero-bento-card) {
  border-color: rgba(226, 232, 240, 0.9);
}

.bento-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bento-icon-box {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-bento-card--emerald .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.26);
}

.hero-bento-card--rose .bento-icon-box {
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(248, 113, 113, 0.26);
}

.hero-bento-card--amber .bento-icon-box {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(251, 191, 36, 0.26);
}

.hero-bento-card--indigo .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.14);
  border: 1px solid rgba(95, 168, 139, 0.26);
}

.bento-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: var(--surface-muted);
  color: var(--secondary-text);
}

.hero-bento-card--emerald .bento-badge {
  color: var(--tone-emerald);
  border-color: rgba(52, 211, 153, 0.26);
  background: rgba(16, 185, 129, 0.1);
}

.hero-bento-card--rose .bento-badge {
  color: var(--tone-red);
  border-color: rgba(248, 113, 113, 0.26);
  background: rgba(239, 68, 68, 0.1);
}

.hero-bento-card--amber .bento-badge {
  color: var(--tone-amber);
  border-color: rgba(251, 191, 36, 0.26);
  background: rgba(245, 158, 11, 0.1);
}

.hero-bento-card--indigo .bento-badge {
  color: var(--tone-emerald);
  border-color: rgba(95, 168, 139, 0.26);
  background: rgba(30, 107, 82, 0.1);
}

.bento-body {
  display: grid;
  gap: 2px;
  margin-top: 6px;
}

.bento-label {
  font-size: 11.5px;
  color: var(--secondary-text);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.bento-value {
  font-size: 24px;
  font-weight: 850;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--text-color);
}

:global(html[data-theme='light'] .bento-value) {
  color: var(--text-color);
}

.bento-caption {
  color: var(--error-muted);
  font-size: 11.5px;
  line-height: 1.4;
}

/* ==========================================================================
   7 模块等宽优雅对称网格（消灭缺角）
   ========================================================================== */
.module-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 22px;
}

.module-chip {
  padding: 14px 12px;
  border: 1px solid var(--error-panel-border);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  min-height: 118px;
}

.module-chip:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.35);
}

.module-chip.is-active {
  border-color: color-mix(in srgb, var(--chip-accent, #1e6b52) 60%, transparent);
  background: var(--brand);
  color: var(--brand-ink);
}

/* 实心品牌底上的标题/说明/时间统一用品牌 ink，避免主题正文色压亮底 */
/* 实心品牌底（is-active）上的文字统一用品牌前景色。
   原来这段被写成了残缺选择器，且未真正上色，导致 .module-chip__desc
   用 --error-muted 压品牌绿底，两套主题都只有 1.06~1.10:1。 */
.module-chip.is-active .module-chip__title-row strong,
.module-chip.is-active .module-chip__desc,
.module-chip.is-active .module-chip__meta small,
.module-chip.is-active .module-chip__count {
  color: var(--brand-ink);
}

.module-chip.is-active .module-chip__icon {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.24);
  color: var(--brand-ink);
}

:global(html[data-theme='light'] .module-chip) {
  border-color: rgba(226, 232, 240, 0.9);
}

:global(html[data-theme='light'] .module-chip.is-active) {
  border-color: color-mix(in srgb, var(--chip-accent, #1e6b52) 50%, transparent);
}

.module-chip__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chip-accent, var(--tone-emerald));
  background: color-mix(in srgb, var(--chip-accent, #1e6b52) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--chip-accent, #1e6b52) 28%, transparent);
  transition: transform 0.22s ease;
}

.module-chip:hover .module-chip__icon {
  transform: scale(1.08);
}

.module-chip__body {
  display: grid;
  gap: 4px;
}

.module-chip__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.module-chip__title-row strong {
  font-size: 14px;
  font-weight: 750;
  color: var(--text-color);
}

:global(html[data-theme='light'] .module-chip__title-row strong) {
  color: var(--text-color);
}

.module-count-tag {
  font-size: 11px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
  /* 半透明 accent 底会随父容器合成出不稳定的中性色，
     这里用不透明的主题浅底 + 正文色，保证两套主题都达标。 */
  color: var(--text-color);
  background: var(--surface-muted);
  border: 1px solid color-mix(in srgb, var(--chip-accent, #1e6b52) 30%, transparent);
  font-variant-numeric: tabular-nums;
}

.module-chip__desc {
  font-size: 11px;
  line-height: 1.4;
  color: var(--error-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.module-chip__meta small {
  font-size: 10.5px;
  color: var(--error-muted);
}

/* ==========================================================================
   零缺陷勋章舱（优雅空状态）
   ========================================================================== */
.empty-shell {
  padding: 36px 0 20px;
  display: flex;
  justify-content: center;
}

.zero-defect-card {
  max-width: 520px;
  width: 100%;
  padding: 38px 28px;
  text-align: center;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

:global(html[data-theme='light'] .zero-defect-card) {
  border-color: rgba(226, 232, 240, 0.9);
}

.zero-defect-icon-chamber {
  position: relative;
  width: 76px;
  height: 76px;
  border-radius: var(--radius-lg);
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.trophy-icon {
  color: var(--tone-emerald);
}

.trophy-glow-halo {
  position: absolute;
  inset: -6px;
  border-radius: inherit;
  background: transparent;
  animation: pulse-halo 2.5s infinite;
  pointer-events: none;
}

@keyframes pulse-halo {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.15);
  }
}

.zero-defect-title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-color);
}

:global(html[data-theme='light'] .zero-defect-title) {
  color: var(--text-color);
}

.zero-defect-subtitle {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--error-muted);
  max-width: 420px;
}

.zero-defect-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.zero-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zero-action-btn--primary {
  color: #04321f;
  background: #10b981;
}

.zero-action-btn--primary:hover {
  transform: translateY(-2px);
}

.zero-action-btn--secondary {
  color: var(--text-color);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.zero-action-btn--secondary:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-color);
}

:global(html[data-theme='light'] .zero-action-btn--secondary) {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.85);
}

/* ==========================================================================
   工作台容器与统计项
   ========================================================================== */
.error-stage {
  border-radius: var(--radius-lg);
  padding: 26px 28px;
}

.stage-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.stage-kicker {
  margin: 0 0 8px;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--tone-emerald);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stage-title-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stage-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chip-accent, var(--tone-emerald));
  background: color-mix(in srgb, var(--chip-accent, #1e6b52) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--chip-accent, #1e6b52) 28%, transparent);
}

.stage-title-row h2 {
  font-size: 24px;
  margin: 0;
  font-weight: 850;
  color: var(--text-color);
}

:global(html[data-theme='light'] .stage-title-row h2) {
  color: var(--text-color);
}

.stage-title-row p {
  margin: 4px 0 0;
  color: var(--error-muted);
  font-size: 13px;
}

.stage-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-shell {
  width: min(340px, 38vw);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  min-height: 44px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: rgba(15, 23, 42, 0.6);
  color: var(--secondary-text);
  transition: all 0.22s ease;
}

:global(html[data-theme='light'] .search-shell) {
  border-color: rgba(203, 213, 225, 0.85);
  background: rgba(255, 255, 255, 0.9);
}

.search-shell:focus-within {
  border-color: rgba(30, 107, 82, 0.6);
  box-shadow: 0 0 0 3px rgba(30, 107, 82, 0.2);
  background: rgba(15, 23, 42, 0.85);
}

:global(html[data-theme='light'] .search-shell:focus-within) {
  background: #ffffff;
}

.search-shell input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: 13.5px;
}

.search-shell input::placeholder {
  color: var(--secondary-text);
}

.refresh-button {
  min-height: 44px;
  padding: 0 18px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 13.5px;
  color: var(--brand-ink);
  border: none;
  cursor: pointer;
  background: var(--brand);
  transition: all 0.2s ease;
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
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
  gap: 8px;
}

.filter-pill,
.clear-filter-button {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--secondary-text);
  transition: all 0.2s ease;
}

:global(html[data-theme='light'] .filter-pill),
:global(html[data-theme='light'] .clear-filter-button) {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.85);
}

.filter-pill:hover,
.clear-filter-button:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(30, 107, 82, 0.35);
  color: var(--text-color);
}

:global(html[data-theme='light'] .filter-pill:hover),
:global(html[data-theme='light'] .clear-filter-button:hover) {
  color: var(--tone-red);
}

.filter-pill.is-active {
  color: var(--brand-ink);
  background: var(--brand);
  border-color: rgba(30, 107, 82, 0.5);
}

.clear-filter-button {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
  color: var(--tone-red);
}

.clear-filter-button:hover {
  background: var(--tone-red-soft);
  border-color: rgba(239, 68, 68, 0.4);
  color: var(--tone-red);
}

.filter-hint {
  margin: 10px 0 0;
  color: var(--error-muted);
  font-size: 12.5px;
  line-height: 1.55;
}

.stage-stats {
  margin: 18px 0 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stage-stat {
  display: grid;
  gap: 4px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

:global(html[data-theme='light'] .stage-stat) {
  background: rgba(248, 250, 252, 0.9);
  border-color: rgba(226, 232, 240, 0.85);
}

.stage-stat span {
  font-size: 11.5px;
  color: var(--secondary-text);
  font-weight: 650;
  letter-spacing: 0.04em;
}

.stage-stat strong {
  font-size: 22px;
  font-weight: 850;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--text-color);
}

:global(html[data-theme='light'] .stage-stat strong) {
  color: var(--text-color);
}

.stage-stat small {
  color: var(--error-muted);
  font-size: 11px;
}

.error-feed {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.error-entry {
  border-radius: var(--radius-lg);
  padding: 24px 26px;
  position: relative;
  overflow: hidden;
}

.error-entry::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--brand);
  opacity: 0.9;
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
  padding: 0 12px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
}

.entry-type {
  color: var(--entry-accent, var(--tone-emerald));
  background: color-mix(in srgb, var(--entry-accent, #1e6b52) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--entry-accent, #1e6b52) 28%, transparent);
}

.entry-kind,
.entry-time {
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

:global(html[data-theme='light'] .entry-kind),
:global(html[data-theme='light'] .entry-time) {
  background: rgba(241, 245, 249, 0.85);
  border-color: rgba(203, 213, 225, 0.8);
}

.entry-body {
  margin-top: 20px;
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 22px;
  align-items: start;
}

.entry-main h3 {
  margin: 0;
  font-size: 20px;
  line-height: 1.55;
  font-weight: 750;
  color: var(--text-color);
}

:global(html[data-theme='light'] .entry-main h3) {
  color: var(--text-color);
}

.entry-subtitle {
  margin: 6px 0 0;
  color: var(--secondary-text);
  font-size: 13px;
}

.entry-context {
  margin: 16px 0 0;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  line-height: 1.72;
  color: var(--error-muted);
}

:global(html[data-theme='light'] .entry-context) {
  background: rgba(248, 250, 252, 0.8);
  border-color: rgba(226, 232, 240, 0.8);
}

.option-stack {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.option-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 13px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
}

:global(html[data-theme='light'] .option-row) {
  border-color: rgba(226, 232, 240, 0.85);
  background: rgba(248, 250, 252, 0.9);
}

.option-row.is-correct {
  background: rgba(16, 185, 129, 0.14);
  border-color: rgba(52, 211, 153, 0.38);
}

.option-row.is-correct .option-text {
  color: var(--text-color);
  font-weight: 600;
}

:global(html[data-theme='light'] .option-row.is-correct .option-text) {
  color: var(--tone-emerald);
}

.option-row.is-user:not(.is-correct),
.option-row.is-wrong {
  background: rgba(239, 68, 68, 0.13);
  border-color: rgba(248, 113, 113, 0.38);
}

.option-row.is-user:not(.is-correct) .option-text,
.option-row.is-wrong .option-text {
  color: var(--text-color);
  font-weight: 600;
}

:global(html[data-theme='light'] .option-row.is-user:not(.is-correct) .option-text),
:global(html[data-theme='light'] .option-row.is-wrong .option-text) {
  color: var(--tone-red);
}

.option-index {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
  color: var(--secondary-text);
  background: rgba(255, 255, 255, 0.08);
}

:global(html[data-theme='light'] .option-index) {
  background: rgba(226, 232, 240, 0.8);
}

.option-row.is-correct .option-index {
  background: var(--tone-emerald-soft);
  color: var(--tone-emerald);
}

.option-row.is-user:not(.is-correct) .option-index,
.option-row.is-wrong .option-index {
  background: var(--tone-red-soft);
  color: var(--tone-red);
}

.option-text {
  line-height: 1.6;
  font-size: 14.5px;
}

.option-flag {
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.option-flag.success {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

:global(html[data-theme='light'] .option-flag.success) {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.25);
}

.option-flag.danger {
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(248, 113, 113, 0.3);
}

:global(html[data-theme='light'] .option-flag.danger) {
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.25);
}

.glance-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.glance-block {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
}

:global(html[data-theme='light'] .glance-block) {
  border-color: rgba(226, 232, 240, 0.8);
  background: rgba(248, 250, 252, 0.9);
}

.glance-block span {
  font-size: 12px;
  font-weight: 600;
  color: var(--secondary-text);
  letter-spacing: 0.02em;
}

.glance-block strong {
  font-size: 15.5px;
  font-weight: 750;
  line-height: 1.5;
  color: var(--text-color);
}

:global(html[data-theme='light'] .glance-block strong) {
  color: var(--text-color);
}

.glance-block small {
  color: var(--error-muted);
  font-size: 12px;
  line-height: 1.45;
}

.glance-block.danger {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(248, 113, 113, 0.24);
}

.glance-block.danger strong {
  color: var(--tone-red);
}

:global(html[data-theme='light'] .glance-block.danger strong) {
  color: var(--tone-red);
}

.glance-block.success {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(52, 211, 153, 0.24);
}

.glance-block.success strong {
  color: var(--tone-emerald);
}

:global(html[data-theme='light'] .glance-block.success strong) {
  color: var(--tone-emerald);
}

.entry-footer {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

:global(html[data-theme='light'] .entry-footer) {
  border-top-color: rgba(226, 232, 240, 0.8);
}

:deep(.entry-footer .n-collapse) {
  background: transparent;
}

:deep(.entry-footer .n-collapse-item__header-main) {
  font-weight: 650;
  color: var(--tone-emerald);
}

.detail-stack {
  display: grid;
  gap: 14px;
  padding: 10px 0 6px;
}

.detail-alert {
  border-radius: var(--radius-lg);
  background: rgba(30, 107, 82, 0.1) !important;
  border: 1px solid rgba(30, 107, 82, 0.24) !important;
  color: var(--tone-emerald) !important;
}

:global(html[data-theme='light'] .detail-alert) {
  background: rgba(30, 107, 82, 0.08) !important;
  border-color: rgba(30, 107, 82, 0.2) !important;
  color: var(--tone-emerald) !important;
}

.detail-empty {
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  color: var(--error-muted);
  font-size: 13.5px;
}

.detail-context {
  padding: 20px;
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

:global(html[data-theme='light'] .detail-context) {
  background: rgba(248, 250, 252, 0.9);
  border-color: rgba(226, 232, 240, 0.8);
}

.detail-label {
  display: block;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--tone-emerald);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.detail-context p {
  margin: 0;
  white-space: pre-line;
  line-height: 1.74;
  color: var(--text-color);
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
  background: var(--card-bg) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:global(html[data-theme='light'] .ai-analysis-modal .n-card) {
  border-color: rgba(203, 213, 225, 0.8) !important;
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

@media (max-width: 1200px) {
  .error-hero {
    grid-template-columns: 1fr;
  }

  .error-hero__stats {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
  }

  .module-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .module-chip--all {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    min-height: auto;
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
  .error-hero__stats {
    grid-template-columns: 1fr;
  }

  .module-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .module-chip--all {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .error-book-view {
    padding: 12px 8px 24px;
  }

  /* 装饰性光斑是 260×260 的绝对定位层，窄屏会顶出视口右侧；它本身无可见内容，直接隐藏 */
  .hero-ambient-glow {
    display: none;
  }

  .error-hero__copy,
  .error-hero__stats,
  .error-stage,
  .error-entry {
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-lg);
  }

  .hero-title-copy h1,
  .stage-title-row h2 {
    font-size: 24px;
  }

  .filter-row,
  .entry-head,
  .empty-extra {
    flex-direction: column;
    align-items: flex-start;
  }

  .entry-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .stage-stats,
  .glance-grid {
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
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-md);
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
    border-radius: var(--radius-lg);
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
