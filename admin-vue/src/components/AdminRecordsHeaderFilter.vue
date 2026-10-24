<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NInput, NTabPane, NTabs } from 'naive-ui'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileDown,
  Layers,
  PenTool,
  RefreshCw,
  Search,
  Type
} from 'lucide-vue-next'

const props = defineProps({
  contentType: {
    type: [String, null],
    default: null
  },
  contentTypeOptions: {
    type: Array,
    default: () => []
  },
  userId: {
    type: String,
    default: ''
  },
  records: {
    type: Array,
    default: () => []
  },
  total: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:content-type',
  'update:user-id',
  'search',
  'reset',
  'refresh',
  'export'
])

const ALL_KEY = '__all__'
const tabValue = computed(() => props.contentType ?? ALL_KEY)
const handleTabChange = value => emit('update:content-type', value === ALL_KEY ? null : value)

const tabIcons = {
  __all__: Layers,
  vocabulary: Type,
  grammar: PenTool,
  reading: BookOpen
}

const accuracyRate = computed(() => {
  if (!props.records.length) return '0%'
  const correctCount = props.records.filter(row => row.isCorrect === 1).length
  return `${Math.round((correctCount / props.records.length) * 100)}%`
})

const averageScore = computed(() => {
  const validScores = props.records
    .map(row => Number(row.score))
    .filter(value => Number.isFinite(value))
  if (!validScores.length) return '0.0'
  const totalScore = validScores.reduce((sum, value) => sum + value, 0)
  return (totalScore / validScores.length).toFixed(1)
})

const totalTimeSpent = computed(() => {
  const sum = props.records.reduce((acc, row) => acc + (Number(row.timeSpent) || 0), 0)
  return `${sum}s`
})
</script>

<template>
  <!-- 顶栏操作按钮组：与学习内容、用户管理页面规格完全一致 -->
  <Teleport to="#page-actions" defer>
    <div class="records-header-actions">
      <n-button class="records-act-btn" secondary :loading="loading" @click="emit('refresh')">
        <template #icon>
          <n-icon :component="RefreshCw" />
        </template>
        刷新记录
      </n-button>
      <n-button
        class="records-act-btn records-act-btn--primary"
        type="primary"
        @click="emit('export')"
      >
        <template #icon>
          <n-icon :component="FileDown" />
        </template>
        导出学习报表
      </n-button>
    </div>
  </Teleport>

  <!-- 顶部 4 个现代独立悬浮 KPI 数据卡片 -->
  <section class="ls-stats records-kpis" aria-label="学习概览指标">
    <!-- 指标 1: 总学习记录 -->
    <div class="ls-stat record-kpi record-kpi--indigo">
      <div class="record-kpi__head">
        <span class="ls-stat__label">全站答题记录</span>
        <div class="record-kpi__icon record-kpi__icon--indigo">
          <Layers :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value">{{ total }}</strong>
      <span class="ls-stat__hint">累计学习练习次数</span>
    </div>

    <!-- 指标 2: 本页正确率 -->
    <div class="ls-stat record-kpi record-kpi--emerald">
      <div class="record-kpi__head">
        <span class="ls-stat__label">本页正确率</span>
        <div class="record-kpi__icon record-kpi__icon--emerald">
          <CheckCircle2 :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value text-emerald">{{ accuracyRate }}</strong>
      <span class="ls-stat__hint">当前视图掌握程度</span>
    </div>

    <!-- 指标 3: 本页平均得分 -->
    <div class="ls-stat record-kpi record-kpi--violet">
      <div class="record-kpi__head">
        <span class="ls-stat__label">本页平均得分</span>
        <div class="record-kpi__icon record-kpi__icon--violet">
          <Award :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value text-violet">{{ averageScore }}</strong>
      <span class="ls-stat__hint">综合答题得分表现</span>
    </div>

    <!-- 指标 4: 本页累计耗时 -->
    <div class="ls-stat record-kpi record-kpi--amber">
      <div class="record-kpi__head">
        <span class="ls-stat__label">本页练习耗时</span>
        <div class="record-kpi__icon record-kpi__icon--amber">
          <Clock :size="15" />
        </div>
      </div>
      <strong class="ls-stat__value text-amber">{{ totalTimeSpent }}</strong>
      <span class="ls-stat__hint">总做题思考秒数</span>
    </div>
  </section>

  <!-- 筛选面板头部与分类标签栏 -->
  <header class="ls-panel__head records-panel-head">
    <div class="records-title-group">
      <h2 class="ls-panel__title">学员答题流水</h2>
      <span class="records-badge">当前 {{ records.length }} 条明细</span>
    </div>

    <!-- 分类标签 (带图标) -->
    <div class="records-tabs-wrap">
      <n-tabs :value="tabValue" type="line" size="small" @update:value="handleTabChange">
        <n-tab-pane
          v-for="opt in contentTypeOptions"
          :key="opt.value ?? ALL_KEY"
          :name="opt.value ?? ALL_KEY"
        >
          <template #tab>
            <div class="tab-label-item">
              <component :is="tabIcons[opt.value ?? ALL_KEY] || Layers" :size="14" />
              <span>{{ opt.label }}</span>
            </div>
          </template>
        </n-tab-pane>
      </n-tabs>
    </div>
  </header>

  <!-- 检索工具栏 (支持按用户ID筛选) -->
  <div class="ls-filter records-filter-bar">
    <div class="records-search-group">
      <n-input
        :value="userId"
        placeholder="输入学员用户 ID (如 1001)..."
        clearable
        style="width: 280px"
        @update:value="emit('update:user-id', $event)"
        @keyup.enter="emit('search')"
      >
        <template #prefix>
          <Search :size="14" class="search-icon" />
        </template>
      </n-input>
      <n-button type="primary" :loading="loading" @click="emit('search')"> 检索 </n-button>
      <n-button v-if="userId" secondary @click="emit('reset')"> 重置 </n-button>
    </div>
    <span class="records-filter-tip">支持按题目类型与用户 ID 组合下钻查看</span>
  </div>
</template>

<style scoped>
.records-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.records-act-btn {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  color: #334155 !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  font-weight: 550;
  border-radius: 8px;
}

.records-act-btn:hover {
  background: #f8fafc !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.records-act-btn--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%) !important;
  border: none !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.28) !important;
  font-weight: 600;
}

.records-act-btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.38) !important;
}

/* KPI 网格 */
.records-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.record-kpi {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 18px;
  min-height: 104px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.04),
    0 4px 12px -2px rgba(15, 23, 42, 0.03);
  transition:
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.2s ease;
  overflow: hidden;
}

.record-kpi::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.2s ease;
}

.record-kpi:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  box-shadow:
    0 10px 24px -4px rgba(15, 23, 42, 0.08),
    0 3px 6px -2px rgba(15, 23, 42, 0.04);
}

.record-kpi--indigo:hover::before {
  background: linear-gradient(90deg, #4f46e5, #818cf8);
}
.record-kpi--emerald:hover::before {
  background: #10b981;
}
.record-kpi--violet:hover::before {
  background: #8b5cf6;
}
.record-kpi--amber:hover::before {
  background: #f59e0b;
}

.record-kpi__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.record-kpi__head .ls-stat__label {
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  margin: 0;
}

.record-kpi__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.record-kpi:hover .record-kpi__icon {
  transform: scale(1.08);
}

.record-kpi__icon--indigo {
  background: #eef2ff;
  color: #4f46e5;
}
.record-kpi__icon--emerald {
  background: #ecfdf5;
  color: #059669;
}
.record-kpi__icon--violet {
  background: #f5f3ff;
  color: #7c3aed;
}
.record-kpi__icon--amber {
  background: #fffbeb;
  color: #d97706;
}

.record-kpi .ls-stat__value {
  color: #0f172a;
  font-size: 26px;
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin: 6px 0 2px 0;
}

.record-kpi .ls-stat__hint {
  color: #94a3b8;
  font-size: 11.5px;
  font-weight: 500;
}

.text-emerald {
  color: #059669 !important;
}
.text-violet {
  color: #7c3aed !important;
}
.text-amber {
  color: #d97706 !important;
}

/* 面板头部 */
.records-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 22px 0 22px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
}

.records-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.records-badge {
  font-size: 11.5px;
  font-weight: 550;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.records-tabs-wrap :deep(.n-tabs-nav) {
  margin-bottom: -1px;
}

.tab-label-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 550;
  font-size: 13.5px;
}

/* 过滤栏 */
.records-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.records-search-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  color: #94a3b8;
}

.records-filter-tip {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 1100px) {
  .records-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .records-kpis {
    grid-template-columns: 1fr;
  }
  .records-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .records-search-group :deep(.n-input) {
    width: 100% !important;
  }
}
</style>
