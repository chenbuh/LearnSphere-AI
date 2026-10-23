<script setup>
import { defineAsyncComponent, h, onMounted, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NIcon,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui'
import { FlaskConical, RefreshCw } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const AIGovernanceExperimentModal = defineAsyncComponent(() => import('@/components/AIGovernanceExperimentModal.vue'))
const AIGovernanceExperimentReportModal = defineAsyncComponent(() => import('@/components/AIGovernanceExperimentReportModal.vue'))

const message = useMessage()
const loading = ref(false)
const experimentList = ref([])
const showExperimentModal = ref(false)
const showReportModal = ref(false)
const selectedReportExperimentId = ref(null)

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const fetchExperiments = async () => {
  loading.value = true
  try {
    const res = await adminApi.getExperiments()
    experimentList.value = res.data
  } catch {
    message.error('加载实验失败')
  } finally {
    loading.value = false
  }
}

const openExperimentModal = () => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showExperimentModal.value = true
}

const handleStopExperiment = async (id) => {
  try {
    await adminApi.stopExperiment(id)
    message.success('实验已停止')
    fetchExperiments()
  } catch {
    message.error('停止失败')
  }
}

const handleViewReport = (id) => {
  selectedReportExperimentId.value = id
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showReportModal.value = true
}

const experimentColumns = [
  { title: '实验名称', key: 'name', minWidth: 180, ellipsis: { tooltip: true } },
  { title: 'Action Type', key: 'actionType', width: 180, render: (row) => h(NTag, { size: 'small', bordered: false }, { default: () => row.actionType }) },
  { title: 'Variant B', key: 'variantName', minWidth: 160, ellipsis: { tooltip: true } },
  { title: '流量分配 (To B)', key: 'trafficRatio', width: 160, align: 'right', render: (row) => `${row.trafficRatio}%` },
  {
    title: '状态',
    key: 'status',
    width: 110,
    render: (row) => h(NTag, { type: row.status === 'RUNNING' ? 'success' : 'default', bordered: false, size: 'small' }, { default: () => row.status })
  },
  { title: '开始时间', key: 'startTime', width: 180, render: (row) => formatTime(row.startTime) },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    render: (row) => h(NSpace, { size: 4, wrap: false }, {
      default: () => [
        h(NButton, { size: 'small', type: 'primary', quaternary: true, onClick: () => handleViewReport(row.id) }, { default: () => '查看报告' }),
        row.status === 'RUNNING'
          ? h(NButton, { size: 'small', type: 'error', quaternary: true, onClick: () => handleStopExperiment(row.id) }, { default: () => '停止' })
          : null
      ]
    })
  }
]

onMounted(() => {
  fetchExperiments()
})
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary :loading="loading" @click="fetchExperiments">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
    <n-button type="primary" @click="openExperimentModal">
      <template #icon>
        <n-icon :component="FlaskConical" />
      </template>
      新建 A/B 实验
    </n-button>
  </Teleport>

  <section class="ls-panel experiment-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">实验列表 <span class="ls-panel__count">共 {{ (experimentList || []).length }} 个</span></h2>
    </header>
    <n-data-table
      :columns="experimentColumns"
      :data="experimentList"
      :loading="loading"
      :bordered="false"
      :scroll-x="1060"
    />
  </section>

  <AIGovernanceExperimentModal
    v-if="showExperimentModal"
    v-model:show="showExperimentModal"
    @created="fetchExperiments"
  />

  <AIGovernanceExperimentReportModal
    v-if="showReportModal"
    v-model:show="showReportModal"
    :experiment-id="selectedReportExperimentId"
  />
</template>

<style scoped>
.experiment-panel :deep(.n-data-table-td[data-col-key='startTime']),
.experiment-panel :deep(.n-data-table-td[data-col-key='trafficRatio']) {
  color: var(--ink-2);
  font-family: var(--font-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
</style>
