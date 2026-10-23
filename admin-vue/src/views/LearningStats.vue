<script setup>
import { computed, h, onMounted, ref } from 'vue'
import { NButton, NDataTable, NPagination, NProgress, NSelect, NTag } from 'naive-ui'
import { BookOpenCheck, CalendarCheck, ListChecks, NotebookPen, RefreshCw } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import { getExamTypeLabel } from '@/utils/examTypeMeta'

const loading = ref(false)
const stats = ref({})
const topUsers = ref([])

const plansLoading = ref(false)
const plans = ref([])
const plansTotal = ref(0)
const plansPage = ref(1)
const plansPageSize = 10
const planStatus = ref('all')

const planStatusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '进行中', value: 1 },
  { label: '已结束', value: 0 }
]

const percent = (part, whole) => (whole ? Math.round((Number(part || 0) / Number(whole)) * 100) : 0)
const taskRate = computed(() => percent(stats.value.dailyTasks?.todayCompleted, stats.value.dailyTasks?.todayTotal))

const fetchStats = async () => {
  loading.value = true
  try {
    const [dashboardRes, topRes] = await Promise.all([
      adminApi.getLearningStatsDashboard(),
      adminApi.getMasteryTopUsers({ limit: 10 }).catch(() => null)
    ])
    if (dashboardRes.code === 200) stats.value = dashboardRes.data || {}
    topUsers.value = topRes?.code === 200 && Array.isArray(topRes.data) ? topRes.data : []
  } finally {
    loading.value = false
  }
}

const fetchPlans = async () => {
  plansLoading.value = true
  try {
    const res = await adminApi.getStudyPlans({
      page: plansPage.value,
      pageSize: plansPageSize,
      status: planStatus.value === 'all' ? undefined : planStatus.value
    })
    if (res.code === 200) {
      plans.value = res.data?.records || []
      plansTotal.value = Number(res.data?.total || 0)
    }
  } finally {
    plansLoading.value = false
  }
}

const refreshAll = () => {
  fetchStats()
  fetchPlans()
}

const changePlanStatus = (value) => {
  planStatus.value = value
  plansPage.value = 1
  fetchPlans()
}

const formatDate = (value) => (value ? String(value).slice(0, 10) : '—')

const planColumns = [
  {
    title: '用户',
    key: 'username',
    minWidth: 140,
    render: (row) => row.username || `用户 #${row.userId}`
  },
  { title: '考试', key: 'examType', width: 110, render: (row) => getExamTypeLabel(row.examType, row.examType || '—') },
  { title: '目标分', key: 'targetScore', width: 90, align: 'right', render: (row) => row.targetScore ?? '—' },
  {
    title: '周期',
    key: 'startDate',
    width: 190,
    render: (row) => `${formatDate(row.startDate)} → ${formatDate(row.endDate)}`
  },
  {
    title: '进度',
    key: 'progress',
    minWidth: 140,
    render: (row) => h(NProgress, {
      type: 'line',
      percentage: Math.max(0, Math.min(100, Number(row.progress || 0))),
      height: 6,
      showIndicator: true,
      indicatorPlacement: 'outside'
    })
  },
  {
    title: '状态',
    key: 'status',
    width: 90,
    render: (row) => h(NTag, { size: 'small', bordered: false, type: row.status === 1 ? 'success' : 'default' }, {
      default: () => (row.status === 1 ? '进行中' : '已结束')
    })
  }
]

const topColumns = [
  {
    title: '用户',
    key: 'username',
    minWidth: 140,
    render: (row) => row.nickname || row.username || `用户 #${row.userId}`
  },
  { title: '已掌握', key: 'masteredWords', width: 76, align: 'right' },
  { title: '学习中', key: 'totalWords', width: 76, align: 'right' },
  {
    title: '最近复习',
    key: 'lastReviewTime',
    width: 110,
    render: (row) => formatDate(row.lastReviewTime)
  }
]

onMounted(refreshAll)
</script>

<template>
  <div class="admin-page admin-page--wide">
    <Teleport to="#page-actions" defer>
      <n-button secondary :loading="loading || plansLoading" @click="refreshAll">
        <template #icon><RefreshCw :size="16" /></template>
        刷新
      </n-button>
    </Teleport>

    <section class="ls-stats" aria-label="学习数据">
      <div class="ls-stat">
        <span class="ls-stat__label"><CalendarCheck :size="14" />学习计划</span>
        <strong class="ls-stat__value">{{ stats.studyPlans?.total ?? 0 }}</strong>
        <span class="ls-stat__hint">进行中 {{ stats.studyPlans?.inProgress ?? 0 }} · 已结束 {{ stats.studyPlans?.completed ?? 0 }}</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><ListChecks :size="14" />今日任务完成率</span>
        <strong class="ls-stat__value">{{ taskRate }}<small>%</small></strong>
        <span class="ls-stat__hint">{{ stats.dailyTasks?.todayCompleted ?? 0 }} / {{ stats.dailyTasks?.todayTotal ?? 0 }}</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><BookOpenCheck :size="14" />已掌握词汇</span>
        <strong class="ls-stat__value">{{ stats.vocabularyMastery?.masteredWords ?? 0 }}</strong>
        <span class="ls-stat__hint">共 {{ stats.vocabularyMastery?.totalRecords ?? 0 }} 条学习记录</span>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><NotebookPen :size="14" />答题记录</span>
        <strong class="ls-stat__value">{{ stats.learningRecords?.total ?? 0 }}</strong>
        <span class="ls-stat__hint">今日 {{ stats.learningRecords?.today ?? 0 }}</span>
      </div>
    </section>

    <div class="learning-grid">
      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">学习计划 <span class="ls-panel__count">共 {{ plansTotal }} 个</span></h2>
          <div class="ls-panel__tools">
            <n-select :value="planStatus" :options="planStatusOptions" size="small" style="width: 120px" @update:value="changePlanStatus" />
          </div>
        </header>
        <n-data-table :columns="planColumns" :data="plans" :loading="plansLoading" :bordered="false" remote />
        <div class="ls-panel__foot">
          <n-pagination v-model:page="plansPage" :item-count="plansTotal" :page-size="plansPageSize" @update:page="fetchPlans" />
        </div>
      </section>

      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">词汇掌握排行 <span class="ls-panel__count">前 10 名</span></h2>
        </header>
        <n-data-table :columns="topColumns" :data="topUsers" :loading="loading" :bordered="false" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.learning-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
}

@media (max-width: 1100px) {
  .learning-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
