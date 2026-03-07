<script setup>
import { defineAsyncComponent, h, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui'
import { FlaskConical, RefreshCcw } from 'lucide-vue-next'
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
  { title: '实验名称', key: 'name' },
  { title: 'Action Type', key: 'actionType', render: (row) => h(NTag, { type: 'info', size: 'small' }, { default: () => row.actionType }) },
  { title: 'Variant B', key: 'variantName' },
  { title: '流量分配 (To B)', key: 'trafficRatio', render: (row) => `${row.trafficRatio}%` },
  {
    title: '状态',
    key: 'status',
    render: (row) => h(NTag, { type: row.status === 'RUNNING' ? 'success' : 'default', bordered: false, round: true }, { default: () => row.status })
  },
  { title: '开始时间', key: 'startTime', render: (row) => formatTime(row.startTime) },
  {
    title: '操作',
    key: 'actions',
    render: (row) => h(NSpace, { size: 'small' }, {
      default: () => [
        row.status === 'RUNNING'
          ? h(NButton, { size: 'small', type: 'error', ghost: true, onClick: () => handleStopExperiment(row.id) }, { default: () => '停止' })
          : null,
        h(NButton, { size: 'small', onClick: () => handleViewReport(row.id) }, { default: () => '查看报告' })
      ]
    })
  }
]

onMounted(() => {
  fetchExperiments()
})
</script>

<template>
  <n-card title="进行中的实验" :bordered="false" class="governance-card">
    <template #header-extra>
      <n-space>
        <n-button secondary @click="fetchExperiments">
          <template #icon><RefreshCcw :size="16" /></template>
          刷新列表
        </n-button>
        <n-button type="primary" @click="openExperimentModal">
          <template #icon><FlaskConical :size="16" /></template>
          新建 A/B 实验
        </n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="experimentColumns"
      :data="experimentList"
      :loading="loading"
    />
  </n-card>

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