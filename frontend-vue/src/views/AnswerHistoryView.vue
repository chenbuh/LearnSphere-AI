<template>
  <div class="answer-history-view">
    <section class="history-hero">
      <div class="history-hero__copy">
        <div class="hero-kicker">
          <Sparkles :size="15" />
          <span>学习记录工作台</span>
        </div>
        <div class="hero-title-row">
          <div class="hero-mark">
            <Target :size="24" />
          </div>
          <div class="hero-title-copy">
            <h1>答题历史</h1>
            <p>
              按模块回看每一次作答，快速筛出需要复盘的练习，并把重点记录重新拉回学习节奏里。
            </p>
          </div>
        </div>
      </div>

      <div class="history-hero__stats">
        <article
          v-for="item in overviewStats"
          :key="item.label"
          class="hero-stat"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.caption }}</small>
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
          <small>{{ formatRelativeTime(moduleOverview[module.key].latestTime, true) }}</small>
        </span>
      </button>
    </section>

    <section class="history-stage">
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
              placeholder="搜索题目或内容关键词"
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

      <p class="filter-hint">
        {{ filterHint }}
      </p>

      <div class="stage-stats">
        <article
          v-for="item in currentModuleStats"
          :key="item.label"
          class="stage-stat"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.caption }}</small>
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
        @update:page="handlePageChange(activeModule, $event)"
        @update:page-size="handlePageSizeChange(activeModule, $event)"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import {
  BookOpen,
  FileText,
  MessageSquare,
  Mic,
  RotateCw,
  Search,
  Sparkles,
  Target,
  Bell
} from 'lucide-vue-next'
import HistoryList from '@/components/AnswerHistoryList.vue'
import { learningApi } from '@/api/learning'

const message = useMessage()

const moduleConfigs = [
  {
    key: 'listening',
    label: '听力练习',
    description: '回看听音作答、定位高频误判题。',
    accent: '#6366f1',
    icon: Bell
  },
  {
    key: 'reading',
    label: '阅读理解',
    description: '检查段落理解、选项判断与错题集中区。',
    accent: '#14b8a6',
    icon: BookOpen
  },
  {
    key: 'grammar',
    label: '语法练习',
    description: '聚焦语法点失分，快速找到复盘入口。',
    accent: '#f59e0b',
    icon: MessageSquare
  },
  {
    key: 'speaking',
    label: '口语练习',
    description: '对照表达表现与 AI 反馈，追踪口语质量。',
    accent: '#ec4899',
    icon: Mic
  },
  {
    key: 'writing',
    label: '写作练习',
    description: '回顾写作输出、评价反馈与修改重点。',
    accent: '#8b5cf6',
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

const overviewStats = computed(() => [
  {
    label: '模块覆盖',
    value: `${loadedModuleCount.value}/${moduleConfigs.length}`,
    caption: loadedModuleCount.value === moduleConfigs.length ? '模块概览已全部就绪' : '其余模块后台补齐中'
  },
  {
    label: '累计记录',
    value: `${overallTotal.value}`,
    caption: '跨 5 个训练模块汇总'
  },
  {
    label: '当前聚焦',
    value: currentModule.value.label,
    caption: `${paginationState[activeModule.value].total} 条记录可回看`
  }
])

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
  padding: 24px 20px 40px;
  color: var(--text-color);
  --history-panel-bg: rgba(255, 255, 255, 0.72);
  --history-panel-strong: rgba(255, 255, 255, 0.88);
  --history-panel-border: rgba(148, 163, 184, 0.18);
  --history-panel-shadow: 0 28px 60px -42px rgba(15, 23, 42, 0.28);
  --history-muted: rgba(71, 85, 105, 0.9);
  --history-soft: rgba(99, 102, 241, 0.09);
}

:global(html[data-theme='dark'] .answer-history-view) {
  --history-panel-bg: rgba(15, 23, 42, 0.72);
  --history-panel-strong: rgba(15, 23, 42, 0.9);
  --history-panel-border: rgba(148, 163, 184, 0.18);
  --history-panel-shadow: 0 32px 56px -40px rgba(2, 6, 23, 0.72);
  --history-muted: rgba(148, 163, 184, 0.92);
  --history-soft: rgba(99, 102, 241, 0.15);
}

.history-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  gap: 18px;
  align-items: stretch;
  margin-bottom: 20px;
}

.history-hero__copy,
.history-hero__stats,
.history-stage {
  border: 1px solid var(--history-panel-border);
  background: linear-gradient(180deg, var(--history-panel-strong), var(--history-panel-bg));
  box-shadow: var(--history-panel-shadow);
  backdrop-filter: blur(20px);
}

.history-hero__copy {
  padding: 24px 26px;
  border-radius: 28px;
  position: relative;
  overflow: hidden;
}

.history-hero__copy::after {
  content: '';
  position: absolute;
  inset: auto -40px -50px auto;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.16), transparent 70%);
  pointer-events: none;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--history-soft);
  color: var(--secondary-text);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero-title-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
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
  max-width: 680px;
  line-height: 1.7;
  color: var(--history-muted);
  font-size: 14px;
}

.history-hero__stats {
  border-radius: 28px;
  padding: 14px;
  display: grid;
  gap: 12px;
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
  color: var(--history-muted);
  line-height: 1.5;
}

.module-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.module-chip {
  padding: 14px;
  border: 1px solid var(--history-panel-border);
  border-radius: 22px;
  background: linear-gradient(180deg, var(--history-panel-strong), var(--history-panel-bg));
  color: inherit;
  box-shadow: var(--history-panel-shadow);
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
  border-color: rgba(99, 102, 241, 0.38);
  box-shadow: 0 26px 42px -34px rgba(99, 102, 241, 0.42);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(244, 247, 255, 0.92));
}

:global(html[data-theme='dark'] .module-chip.is-active) {
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.94));
}

.module-chip__icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--chip-accent, #6366f1);
  background: color-mix(in srgb, var(--chip-accent, #6366f1) 14%, transparent);
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
  color: var(--history-muted);
}

.module-chip__meta {
  justify-items: end;
}

.history-stage {
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

.stage-title-row {
  display: flex;
  gap: 14px;
  align-items: flex-start;
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
  width: min(340px, 42vw);
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
  background: var(--history-soft);
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
  color: var(--history-muted);
  font-size: 13px;
  line-height: 1.6;
}

.stage-stats {
  margin: 18px 0 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
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
  .history-hero {
    grid-template-columns: 1fr;
  }

  .module-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
    padding: 12px 8px 24px;
  }

  .history-hero__copy,
  .history-hero__stats,
  .history-stage {
    border-radius: 24px;
  }

  .history-hero__copy,
  .history-stage {
    padding: 18px 16px;
  }

  .hero-title-row,
  .stage-title-row {
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
  .answer-history-view {
    padding: 10px 6px 20px;
  }

  .history-hero__copy,
  .history-hero__stats,
  .history-stage {
    border-radius: 20px;
  }

  .history-hero__copy,
  .history-stage {
    padding: 16px 14px;
  }

  .history-hero__stats {
    padding: 12px;
  }

  .hero-mark,
  .stage-icon,
  .module-chip__icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .hero-title-copy h1,
  .stage-title-row h2 {
    font-size: 20px;
  }

  .hero-title-copy p,
  .filter-hint {
    font-size: 13px;
  }

  .hero-stat,
  .stage-stat {
    padding: 12px 14px;
    border-radius: 18px;
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
  .filter-row {
    gap: 10px;
  }

  .stage-actions > *,
  .filter-row > * {
    width: 100%;
  }

  .filter-pills {
    width: 100%;
  }

  .search-shell {
    width: 100%;
    min-height: 44px;
    padding: 0 12px;
  }
}

@media (max-width: 360px) {
  .hero-title-copy h1,
  .stage-title-row h2 {
    font-size: 18px;
  }

  .history-stage {
    padding: 14px 12px;
  }

  .module-chip {
    grid-template-columns: auto 1fr;
  }

  .module-chip__meta {
    grid-column: 1 / -1;
    justify-items: start;
    padding-top: 2px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .answer-history-view {
    padding-bottom: 16px;
  }

  .history-hero__copy,
  .history-hero__stats,
  .history-stage {
    border-radius: 22px;
  }

  .history-stage {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .module-strip {
    gap: 10px;
  }
}
</style>
