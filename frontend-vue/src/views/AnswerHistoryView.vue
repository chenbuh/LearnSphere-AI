<template>
  <div class="answer-history-view">
    <section class="history-hero">
      <div class="history-hero__copy">
        <div class="hero-topline">
          <div class="hero-kicker">
            <Sparkles :size="15" />
            <span>全维作答复盘档案室</span>
          </div>
          <div class="hero-status-pill" :class="`is-${historyActivityStatus.tone}`">
            <span class="status-dot"></span>
            <span>{{ historyActivityStatus.badge }}</span>
          </div>
        </div>

        <div class="hero-title-row">
          <div class="hero-mark">
            <Target :size="26" />
          </div>
          <div class="hero-title-copy">
            <h1>答题历史</h1>
            <p>
              按学科模块全真回看作答记录，智能标记复盘焦点，沉淀全科目提分轨迹。
            </p>
          </div>
        </div>

        <div class="hero-mastery-strip" :class="`is-${historyActivityStatus.tone}`">
          <div class="mastery-copy">
            <div class="mastery-title-row">
              <component :is="historyActivityStatus.isClean ? Sparkles : CheckCircle2" :size="18" class="mastery-icon" />
              <strong>{{ historyActivityStatus.title }}</strong>
            </div>
            <p>{{ historyActivityStatus.subtitle }}</p>
          </div>

          <div class="hero-action-group">
            <button
              type="button"
              class="hero-cta-btn is-primary"
              @click="goToPractice"
            >
              <span>进入「{{ currentModule.label }}」练习</span>
              <ArrowRight :size="15" />
            </button>
            <button
              type="button"
              class="hero-cta-btn is-secondary"
              @click="goToErrorBook"
            >
              <BookOpen :size="15" />
              <span>全科错题本</span>
            </button>
          </div>
        </div>
      </div>

      <div class="history-hero__stats">
        <article
          v-for="item in overviewStats"
          :key="item.key"
          class="bento-stat-card"
          :class="`tone-${item.tone}`"
        >
          <div class="bento-top">
            <span class="bento-icon-box">
              <component :is="item.icon" :size="18" />
            </span>
            <span class="bento-badge">{{ item.badge }}</span>
          </div>
          <div class="bento-metric">
            <span class="bento-label">{{ item.label }}</span>
            <strong class="bento-value">{{ item.value }}</strong>
          </div>
          <small class="bento-caption">{{ item.caption }}</small>
        </article>
      </div>
    </section>

    <section class="module-strip" aria-label="模块切换">
      <button
        v-for="module in moduleConfigs"
        :key="module.key"
        type="button"
        class="module-chip"
        :class="{ 'is-active': activeModule === module.key }"
        :style="{ '--chip-accent': module.accent }"
        @click="handleModuleSelect(module.key)"
      >
        <span class="module-chip__icon">
          <component :is="module.icon" :size="18" />
        </span>

        <span class="module-chip__body">
          <strong class="module-name">{{ module.label }}</strong>
          <span class="module-desc">{{ module.description }}</span>
        </span>

        <span class="module-chip__meta">
          <span class="module-count-badge">{{ formatModuleTotal(module.key) }}</span>
          <small class="module-time">{{ formatRelativeTime(moduleOverview[module.key].latestTime, true) }}</small>
        </span>
      </button>
    </section>

    <section class="history-stage">
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
              placeholder="搜索题目或作答内容关键词"
            />
          </label>

          <button
            type="button"
            class="refresh-button"
            :disabled="loading"
            @click="refreshCurrentModule"
          >
            <RotateCw :size="16" :class="{ 'is-spinning': loading }" />
            <span>刷新数据</span>
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

      <p class="filter-hint">
        {{ filterHint }}
      </p>

      <div class="stage-stats">
        <article
          v-for="item in currentModuleStats"
          :key="item.label"
          class="stage-stat"
        >
          <span class="stat-indicator"></span>
          <div class="stat-info">
            <span class="stat-label">{{ item.label }}</span>
            <strong class="stat-value">{{ item.value }}</strong>
            <small class="stat-caption">{{ item.caption }}</small>
          </div>
        </article>
      </div>

      <HistoryList
        :module="activeModule"
        :module-label="currentModule.label"
        :records="filteredRecords"
        :loading="loading"
        :page="paginationState[activeModule].page"
        :page-size="paginationState[activeModule].pageSize"
        :total="paginationState[activeModule].total"
        :show-pagination="!hasLocalFilters"
        :empty-description="emptyState.description"
        :empty-hint="emptyState.hint"
        :has-filters="hasLocalFilters"
        @update:page="handlePageChange(activeModule, $event)"
        @update:page-size="handlePageSizeChange(activeModule, $event)"
        @start-practice="goToPractice"
        @go-error-book="goToErrorBook"
        @clear-filter="clearLocalFilters"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  FileText,
  History,
  LayoutGrid,
  MessageSquare,
  Mic,
  RotateCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target
} from 'lucide-vue-next'
import HistoryList from '@/components/AnswerHistoryList.vue'
import { learningApi } from '@/api/learning'

const router = useRouter()
const message = useMessage()

const moduleConfigs = [
  {
    key: 'listening',
    label: '听力练习',
    description: '回看听音作答、定位高频误判题。',
    accent: 'var(--tone-emerald)',
    icon: Bell
  },
  {
    key: 'reading',
    label: '阅读理解',
    description: '检查段落理解、选项判断与错题集中区。',
    accent: 'var(--tone-cyan)',
    icon: BookOpen
  },
  {
    key: 'grammar',
    label: '语法练习',
    description: '聚焦语法点失分，快速找到复盘入口。',
    accent: 'var(--tone-amber)',
    icon: MessageSquare
  },
  {
    key: 'speaking',
    label: '口语练习',
    description: '对照表达表现与 AI 反馈，追踪口语质量。',
    accent: 'var(--tone-orange)',
    icon: Mic
  },
  {
    key: 'writing',
    label: '写作练习',
    description: '回顾写作输出、评价反馈与修改重点。',
    accent: 'var(--tone-emerald)',
    icon: FileText
  }
]

const filterOptions = [
  { key: 'all', label: '全部记录' },
  { key: 'needs-review', label: '待复盘' },
  { key: 'high-score', label: '高分记录' },
  { key: 'recent', label: '最近 7 天' }
]

const activeModule = ref('listening')
const loading = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')

const recordsState = reactive({
  listening: [],
  reading: [],
  grammar: [],
  speaking: [],
  writing: []
})

const paginationState = reactive({
  listening: { page: 1, pageSize: 10, total: 0 },
  reading: { page: 1, pageSize: 10, total: 0 },
  grammar: { page: 1, pageSize: 20, total: 0 },
  speaking: { page: 1, pageSize: 10, total: 0 },
  writing: { page: 1, pageSize: 10, total: 0 }
})

const moduleOverview = reactive({
  listening: { total: 0, latestTime: '', metaLoaded: false, recordsLoaded: false },
  reading: { total: 0, latestTime: '', metaLoaded: false, recordsLoaded: false },
  grammar: { total: 0, latestTime: '', metaLoaded: false, recordsLoaded: false },
  speaking: { total: 0, latestTime: '', metaLoaded: false, recordsLoaded: false },
  writing: { total: 0, latestTime: '', metaLoaded: false, recordsLoaded: false }
})

const currentModule = computed(() => {
  return moduleConfigs.find(module => module.key === activeModule.value) || moduleConfigs[0]
})

const currentRecords = computed(() => recordsState[activeModule.value] || [])

const loadedModuleCount = computed(() => {
  return moduleConfigs.filter(module => moduleOverview[module.key].metaLoaded).length
})

const overallTotal = computed(() => {
  return moduleConfigs.reduce((total, module) => total + (moduleOverview[module.key].total || 0), 0)
})

const currentPageMetrics = computed(() => {
  const records = currentRecords.value
  const averageScore = records.length
    ? Math.round(records.reduce((sum, record) => sum + Number(record.score || 0), 0) / records.length)
    : 0

  const questionCount = records.reduce((sum, record) => sum + getQuestionCount(record), 0)
  const needsReviewCount = records.filter(record => isNeedsReview(record)).length
  const latestRecord = records[0]?.createTime || moduleOverview[activeModule.value].latestTime

  return {
    averageScore,
    questionCount,
    needsReviewCount,
    latestRecord
  }
})

const historyActivityStatus = computed(() => {
  const tot = overallTotal.value
  if (tot === 0) {
    return {
      isClean: true,
      title: '全新学习周期 · 等待开启首测',
      subtitle: '完成任意模块练习后，系统将自动归档全真题目、答案与解析，生成提分轨迹。',
      badge: '待沉淀作答',
      tone: 'indigo'
    }
  }
  return {
    isClean: false,
    title: `已跨学科归档 ${tot} 次训练记录`,
    subtitle: `当前聚焦【${currentModule.value.label}】，建议定期复盘错题，保持连贯的学习动量。`,
    badge: '记录持续更新',
    tone: 'emerald'
  }
})

const overviewStats = computed(() => {
  const tot = overallTotal.value
  const isFull = loadedModuleCount.value === moduleConfigs.length
  return [
    {
      key: 'coverage',
      label: '模块覆盖',
      value: `${loadedModuleCount.value}/${moduleConfigs.length}`,
      badge: isFull ? '全覆盖就绪' : '后台同步中',
      tone: 'cyan',
      icon: LayoutGrid,
      caption: isFull ? '模块概览已全部就绪' : '其余模块后台补齐中'
    },
    {
      key: 'total',
      label: '累计记录',
      value: `${tot}`,
      badge: tot > 0 ? '稳步积累' : '准备启航',
      tone: tot > 0 ? 'emerald' : 'indigo',
      icon: Sparkles,
      caption: '跨 5 个训练模块汇总'
    },
    {
      key: 'focus',
      label: '当前聚焦',
      value: currentModule.value.label,
      badge: `${paginationState[activeModule.value].total} 条可查`,
      tone: 'amber',
      icon: Target,
      caption: `${paginationState[activeModule.value].total} 条记录可回看`
    }
  ]
})

const goToPractice = () => {
  const map = {
    listening: '/listening',
    reading: '/reading',
    grammar: '/grammar',
    speaking: '/speaking',
    writing: '/writing'
  }
  const target = map[activeModule.value] || '/learning-hub'
  router.push(target)
}

const goToErrorBook = () => {
  router.push('/error-book')
}

const currentModuleStats = computed(() => [
  {
    label: '当前模块总记录',
    value: `${paginationState[activeModule.value].total}`,
    caption: '模块内全部历史练习'
  },
  {
    label: '当前页均分',
    value: `${currentPageMetrics.value.averageScore}%`,
    caption: '基于当前已加载记录计算'
  },
  {
    label: '待复盘记录',
    value: `${currentPageMetrics.value.needsReviewCount}`,
    caption: '低分或存在明显错题的练习'
  },
  {
    label: '最近练习',
    value: formatRelativeTime(currentPageMetrics.value.latestRecord, false),
    caption: `当前页共 ${currentPageMetrics.value.questionCount} 道题`
  }
])

const filteredRecords = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  let records = [...currentRecords.value]

  if (keyword) {
    records = records.filter(record => {
      const source = [record.title, record.content]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return source.includes(keyword)
    })
  }

  switch (activeFilter.value) {
    case 'needs-review':
      records = records.filter(record => isNeedsReview(record))
      break
    case 'high-score':
      records = records.filter(record => Number(record.score || 0) >= 85)
      break
    case 'recent':
      records = records.filter(record => isRecentRecord(record.createTime))
      break
    default:
      break
  }

  return records
})

const hasLocalFilters = computed(() => {
  return Boolean(searchQuery.value.trim()) || activeFilter.value !== 'all'
})

const filterHint = computed(() => {
  if (hasLocalFilters.value) {
    return `当前命中 ${filteredRecords.value.length} 条记录。搜索与筛选仅作用于当前已加载页面，翻页后会继续沿用该视图。`
  }

  return '按模块保留各自分页位置；如果刚完成新的练习，点“刷新”即可拉取最新历史。'
})

const emptyState = computed(() => {
  if (hasLocalFilters.value) {
    return {
      description: '当前筛选下暂无记录',
      hint: '换个关键词试试，或者清空筛选查看这一页的全部历史。'
    }
  }

  return {
    description: `${currentModule.value.label} 暂无练习记录`,
    hint: '完成一次练习后，这里会自动沉淀题目、答案和解析，方便你随时回看。'
  }
})

const formatRelativeTime = (time, emptyAsLoading = false) => {
  if (!time) {
    return emptyAsLoading ? '等待载入' : '暂无记录'
  }

  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return emptyAsLoading ? '等待载入' : '时间未知'
  }

  const diff = Date.now() - date.getTime()
  const day = 24 * 60 * 60 * 1000

  if (diff < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.floor(diff / (60 * 1000)))
    return `${minutes} 分钟前`
  }

  if (diff < day) {
    return `${Math.floor(diff / (60 * 60 * 1000))} 小时前`
  }

  if (diff < day * 7) {
    return `${Math.floor(diff / day)} 天前`
  }

  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const parseQuestionCollection = (record) => {
  if (!record?.questions) {
    return []
  }

  if (Array.isArray(record.questions)) {
    return record.questions
  }

  if (typeof record.questions === 'string') {
    try {
      const parsed = JSON.parse(record.questions)
      return Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      return []
    }
  }

  return [record.questions]
}

const getQuestionCount = (record) => {
  return parseQuestionCollection(record).length
}

const normalizeAnswerValue = (value) => {
  if (value === undefined || value === null) {
    return null
  }

  const stringValue = String(value).trim()
  if (!stringValue || stringValue === 'undefined' || stringValue === 'null') {
    return null
  }

  return stringValue
}

const isNeedsReview = (record) => {
  if (Number(record.score || 0) < 60) {
    return true
  }

  return parseQuestionCollection(record).some(question => {
    if (question?.isCorrect === 0 || question?.isCorrect === false) {
      return true
    }

    const userAnswer = normalizeAnswerValue(question?.userAnswer)
    const correctAnswer = normalizeAnswerValue(
      question?.correctAnswer ?? question?.answer ?? question?.correct
    )

    return Boolean(userAnswer && correctAnswer && userAnswer !== correctAnswer)
  })
}

const isRecentRecord = (time) => {
  if (!time) {
    return false
  }

  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return false
  }

  return Date.now() - date.getTime() <= 7 * 24 * 60 * 60 * 1000
}

const syncModuleOverview = (module, payload, updateRecords) => {
  const records = payload?.records || []
  const state = paginationState[module]

  state.total = payload?.total || 0
  moduleOverview[module].total = payload?.total || 0
  moduleOverview[module].latestTime = records[0]?.createTime || moduleOverview[module].latestTime
  moduleOverview[module].metaLoaded = true

  if (updateRecords) {
    recordsState[module] = records
    moduleOverview[module].recordsLoaded = true
  }
}

const loadHistory = async (module, options = {}) => {
  const { silent = false, updateRecords = true } = options
  const state = paginationState[module]

  if (!silent) {
    loading.value = true
  }

  try {
    const res = await learningApi.getAnswerHistory(module, state.page, state.pageSize)
    if (res.code === 200) {
      syncModuleOverview(module, res.data, updateRecords)

      if (!silent && updateRecords) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }

      return res.data
    }
  } catch (error) {
    console.error(`Failed to load ${module} history`, error)
    if (!silent) {
      message.error('加载答题历史失败')
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
  }

  return null
}

const prefetchModuleOverview = async (module) => {
  if (moduleOverview[module].metaLoaded) {
    return
  }

  const pageSnapshot = paginationState[module].page
  const sizeSnapshot = paginationState[module].pageSize

  paginationState[module].page = 1
  paginationState[module].pageSize = 1

  try {
    await loadHistory(module, { silent: true, updateRecords: false })
  } finally {
    paginationState[module].page = pageSnapshot
    paginationState[module].pageSize = sizeSnapshot
  }
}

const handlePageChange = (module, page) => {
  paginationState[module].page = page
  loadHistory(module)
}

const handlePageSizeChange = (module, pageSize) => {
  paginationState[module].pageSize = pageSize
  paginationState[module].page = 1
  loadHistory(module)
}

const handleModuleSelect = (module) => {
  activeModule.value = module
}

const clearLocalFilters = () => {
  searchQuery.value = ''
  activeFilter.value = 'all'
}

const refreshCurrentModule = () => {
  loadHistory(activeModule.value)
}

const formatModuleTotal = (module) => {
  if (!moduleOverview[module].metaLoaded) {
    return '加载中'
  }

  return `${moduleOverview[module].total} 条`
}

watch(activeModule, async (module) => {
  clearLocalFilters()

  if (!moduleOverview[module].recordsLoaded) {
    await loadHistory(module)
  }
})

onMounted(async () => {
  await loadHistory(activeModule.value)

  moduleConfigs
    .filter(module => module.key !== activeModule.value)
    .forEach(module => {
      void prefetchModuleOverview(module.key)
    })
})
</script>

<style scoped>
.answer-history-view {
  max-width: 1380px;
  margin: 0 auto;
  padding: 24px 20px 48px;
  color: var(--text-color);
  --history-panel-bg: rgba(255, 255, 255, 0.9);
  --history-panel-strong: #ffffff;
  --history-panel-border: rgba(226, 232, 240, 0.95);
  --history-panel-shadow: 0 20px 48px -24px rgba(15, 23, 42, 0.08);
  --history-title-color: #0f172a;
  --history-muted: #475569;
  --history-soft: rgba(30, 107, 82, 0.07);
  --history-stat-bg: rgba(248, 250, 252, 0.92);
  --history-stat-border: rgba(226, 232, 240, 0.95);
}

:global(html[data-theme='dark'] .answer-history-view) {
  --history-panel-bg: rgba(15, 23, 42, 0.72);
  --history-panel-strong: rgba(30, 41, 59, 0.76);
  --history-panel-border: rgba(148, 163, 184, 0.16);
  --history-panel-shadow: 0 32px 56px -40px rgba(2, 6, 23, 0.72);
  --history-title-color: #f8fafc;
  --history-muted: #94a3b8;
  --history-soft: rgba(30, 107, 82, 0.14);
  --history-stat-bg: rgba(15, 23, 42, 0.55);
  --history-stat-border: rgba(148, 163, 184, 0.14);
}

/* ==========================================================================
   Hero 主舱
   ========================================================================== */
.history-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(360px, 1fr);
  gap: 20px;
  align-items: stretch;
  margin-bottom: 22px;
}

.history-hero__copy,
.bento-stat-card,
.history-stage {
  border: 1px solid var(--history-panel-border);
  background: var(--card-bg);
}

.history-hero__copy {
  padding: 28px 30px;
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}

.history-hero__copy::after {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  background: transparent;
  pointer-events: none;
}

.hero-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--history-soft);
  color: var(--tone-emerald);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  border: 1px solid rgba(30, 107, 82, 0.18);
}

.hero-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  position: relative;
}

.status-dot::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: inherit;
  opacity: 0.6;
  animation: pulse-ring 2s infinite ease-out;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(2.2); opacity: 0; }
}

.hero-status-pill.is-indigo {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.22);
}

.hero-status-pill.is-indigo .status-dot {
  background: #1e6b52;
}

.hero-status-pill.is-emerald {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.22);
}

.hero-status-pill.is-emerald .status-dot {
  background: #10b981;
}

.hero-title-row {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.hero-mark {
  width: 58px;
  height: 58px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--tone-emerald);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.hero-title-copy h1 {
  margin: 0;
  font-size: clamp(28px, 3.2vw, 36px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--history-title-color);
}

.hero-title-copy p {
  margin: 10px 0 0;
  max-width: 680px;
  line-height: 1.65;
  color: var(--history-muted);
  font-size: 14px;
}

/* 态势条与黄金行动跳板 */
.hero-mastery-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(30, 107, 82, 0.2);
  background: var(--card-bg);
  transition: all 0.3s ease;
}

.hero-mastery-strip.is-emerald {
  border-color: rgba(16, 185, 129, 0.24);
  background: var(--card-bg);
}

.mastery-copy {
  display: grid;
  gap: 4px;
}

.mastery-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--history-title-color);
}

.hero-mastery-strip.is-indigo .mastery-icon {
  color: var(--tone-emerald);
}

.hero-mastery-strip.is-emerald .mastery-icon {
  color: var(--tone-emerald);
}

.mastery-copy p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--history-muted);
}

.hero-action-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.hero-cta-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.22s ease;
}

.hero-cta-btn.is-primary {
  color: var(--brand-ink);
  background: var(--brand);
}

.hero-cta-btn.is-primary:hover {
  transform: translateY(-2px);
}

.hero-cta-btn.is-secondary {
  color: var(--history-title-color);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid var(--history-panel-border);
}

:global(html[data-theme='dark'] .hero-cta-btn.is-secondary) {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.2);
}

.hero-cta-btn.is-secondary:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.4);
}

/* ==========================================================================
   右侧 3 大 Bento 独立晶体卡片
   ========================================================================== */
.history-hero__stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.bento-stat-card {
  padding: 18px 22px;
  border-radius: var(--radius-lg);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.bento-stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.3);
}

.bento-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bento-icon-box {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

.bento-stat-card.tone-cyan .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(43, 122, 96, 0.12);
  border: 1px solid rgba(43, 122, 96, 0.25);
}

.bento-stat-card.tone-emerald .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.bento-stat-card.tone-indigo .bento-icon-box {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.bento-stat-card.tone-amber .bento-icon-box {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.bento-metric {
  display: grid;
  gap: 3px;
}

.bento-label {
  font-size: 12px;
  color: var(--history-muted);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.bento-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--history-title-color);
  letter-spacing: -0.02em;
}

.bento-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.bento-stat-card.tone-cyan .bento-badge {
  color: var(--tone-cyan);
  background: rgba(43, 122, 96, 0.12);
  border: 1px solid rgba(43, 122, 96, 0.2);
}

.bento-stat-card.tone-emerald .bento-badge {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.bento-stat-card.tone-indigo .bento-badge {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.2);
}

.bento-stat-card.tone-amber .bento-badge {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

:global(html[data-theme='dark'] .bento-stat-card.tone-cyan .bento-badge) { color: var(--tone-emerald); }
:global(html[data-theme='dark'] .bento-stat-card.tone-emerald .bento-badge) { color: var(--tone-emerald); }
:global(html[data-theme='dark'] .bento-stat-card.tone-indigo .bento-badge) { color: var(--tone-emerald); }
:global(html[data-theme='dark'] .bento-stat-card.tone-amber .bento-badge) { color: var(--tone-amber); }

.bento-caption {
  font-size: 12px;
  line-height: 1.45;
  color: var(--history-muted);
  text-align: right;
  max-width: 140px;
}

/* ==========================================================================
   模块导航条 (Module Strip)
   ========================================================================== */
.module-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.module-chip {
  padding: 16px 18px;
  border: 1px solid var(--history-panel-border);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  color: inherit;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s ease;
}

.module-chip:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--chip-accent, #1e6b52) 40%, transparent);
}

.module-chip.is-active {
  border-color: color-mix(in srgb, var(--chip-accent, #1e6b52) 50%, transparent);
}

.module-chip.is-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 15%;
  right: 15%;
  height: 3px;
  border-radius: 999px;
  background: var(--chip-accent, #1e6b52);
}

.module-chip__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chip-accent, var(--tone-emerald));
  background: color-mix(in srgb, var(--chip-accent, #1e6b52) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--chip-accent, #1e6b52) 22%, transparent);
  transition: all 0.25s ease;
}

.module-chip:hover .module-chip__icon {
  transform: scale(1.06);
}

.module-chip__body {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.module-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--history-title-color);
  letter-spacing: -0.01em;
}

.module-desc {
  font-size: 12px;
  line-height: 1.45;
  color: var(--history-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-chip__meta {
  display: grid;
  gap: 3px;
  justify-items: end;
  flex-shrink: 0;
}

.module-count-badge {
  font-size: 13px;
  font-weight: 700;
  color: var(--history-title-color);
  padding: 2px 8px;
  border-radius: 8px;
  background: var(--history-soft);
}

.module-time {
  font-size: 11px;
  color: var(--history-muted);
  white-space: nowrap;
}

/* ==========================================================================
   工作台 (Stage)
   ========================================================================== */
.history-stage {
  border-radius: var(--radius-lg);
  padding: 28px;
}

.stage-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.stage-kicker {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--tone-emerald);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stage-title-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.stage-icon {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chip-accent, var(--tone-emerald));
  background: color-mix(in srgb, var(--chip-accent, #1e6b52) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--chip-accent, #1e6b52) 24%, transparent);
}

.stage-title-row h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.15;
  color: var(--history-title-color);
}

.stage-title-row p {
  margin: 6px 0 0;
  color: var(--history-muted);
  font-size: 14px;
  line-height: 1.5;
}

.stage-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-shell {
  width: min(340px, 42vw);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  min-height: 44px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--history-panel-border);
  background: rgba(255, 255, 255, 0.7);
  color: var(--history-muted);
  transition: all 0.2s ease;
}

:global(html[data-theme='dark'] .search-shell) {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.2);
}

.search-shell:focus-within {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(30, 107, 82, 0.15);
}

.search-shell input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--history-title-color);
  font-size: 14px;
}

.search-shell input::placeholder {
  color: var(--history-muted);
}

.refresh-button,
.clear-filter-button,
.filter-pill {
  border: 0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-button {
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-lg);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--brand-ink);
  font-weight: 600;
  font-size: 14px;
  background: var(--brand);
}

.refresh-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.refresh-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

.filter-row {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-pill,
.clear-filter-button {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--history-muted);
  background: var(--history-soft);
  border: 1px solid transparent;
}

.filter-pill:hover,
.clear-filter-button:hover {
  transform: translateY(-1px);
  color: var(--history-title-color);
}

.filter-pill.is-active {
  color: var(--brand-ink);
  background: var(--brand);
}

.clear-filter-button {
  background: rgba(148, 163, 184, 0.12);
}

.filter-hint {
  margin: 14px 0 0;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--history-stat-bg);
  border: 1px solid var(--history-stat-border);
  color: var(--history-muted);
  font-size: 13px;
  line-height: 1.6;
}

/* 4 项阶段统计 */
.stage-stats {
  margin: 20px 0 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stage-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  background: var(--history-stat-bg);
  border: 1px solid var(--history-stat-border);
  position: relative;
  overflow: hidden;
  transition: all 0.22s ease;
}

.stage-stat:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.25);
}

.stat-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--brand);
  opacity: 0.6;
}

.stage-stat:nth-child(2) .stat-indicator {
  background: #10b981;
}

.stage-stat:nth-child(3) .stat-indicator {
  background: #f59e0b;
}

.stage-stat:nth-child(4) .stat-indicator {
  background: #b4543a;
}

.stat-info {
  display: grid;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--history-muted);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.stat-value {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  color: var(--history-title-color);
  letter-spacing: -0.02em;
}

.stat-caption {
  font-size: 12px;
  color: var(--history-muted);
  line-height: 1.45;
}

.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==========================================================================
   响应式断点
   ========================================================================== */
@media (max-width: 1200px) {
  .history-hero {
    grid-template-columns: 1fr;
  }

  .history-hero__stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .bento-stat-card {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 10px;
  }

  .bento-top {
    flex-direction: row;
    justify-content: center;
  }

  .bento-caption {
    text-align: center;
    max-width: none;
  }

  .module-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .stage-head {
    flex-direction: column;
  }

  .stage-actions {
    width: 100%;
  }

  .search-shell {
    width: 100%;
  }

  .stage-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .answer-history-view {
    padding: 16px 12px 32px;
  }

  .history-hero__copy,
  .history-stage {
    padding: 20px 18px;
    border-radius: var(--radius-lg);
  }

  .hero-mastery-strip {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .hero-action-group {
    flex-direction: column;
    width: 100%;
  }

  .hero-cta-btn {
    width: 100%;
    justify-content: center;
  }

  .history-hero__stats {
    grid-template-columns: 1fr;
  }

  .bento-stat-card {
    grid-template-columns: auto 1fr auto;
    text-align: left;
  }

  .bento-top {
    flex-direction: column;
  }

  .bento-caption {
    text-align: right;
    max-width: 120px;
  }

  .module-strip {
    grid-template-columns: 1fr;
  }

  .module-chip {
    padding: 14px 16px;
  }

  .stage-actions,
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .refresh-button,
  .clear-filter-button {
    justify-content: center;
  }

  .stage-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-mark,
  .stage-icon,
  .module-chip__icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
  }

  .hero-title-copy h1,
  .stage-title-row h2 {
    font-size: 22px;
  }

  .bento-stat-card {
    grid-template-columns: auto 1fr;
    gap: 12px;
  }

  .bento-caption {
    grid-column: 1 / -1;
    text-align: left;
    max-width: none;
  }

  .module-chip {
    grid-template-columns: auto 1fr;
  }

  .module-chip__meta {
    grid-column: 2 / 3;
    justify-items: start;
  }
}
</style>
