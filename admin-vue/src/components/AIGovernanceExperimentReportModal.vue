<script setup>
import { computed, ref, watch } from 'vue'
import {
  NAlert,
  NCard,
  NEmpty,
  NGrid,
  NGridItem,
  NModal,
  NSpin,
  NStatistic,
  useMessage
} from 'naive-ui'
import { adminApi } from '@/api/admin'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  experimentId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:show'])

const message = useMessage()
const loading = ref(false)
const currentReport = ref(null)

const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const loadReport = async () => {
  if (!props.experimentId) {
    currentReport.value = null
    return
  }

  loading.value = true

  try {
    const res = await adminApi.getExperimentReport(props.experimentId)
    currentReport.value = res.data
  } catch (error) {
    console.error(error)
    currentReport.value = null
    message.error('获取报告失败')
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.show, props.experimentId],
  ([show, experimentId]) => {
    if (show && experimentId) {
      loadReport()
      return
    }

    if (!show) {
      currentReport.value = null
    }
  },
  { immediate: true }
)
</script>

<template>
  <n-modal v-model:show="modalVisible" preset="card" title="A/B 实验报告" style="width: 900px">
    <n-spin :show="loading">
      <div v-if="currentReport">
        <n-grid :cols="2" :x-gap="24" class="mb-6">
          <n-grid-item v-for="metric in currentReport.performance || []" :key="metric.variant">
            <n-card
              :title="metric.variant === 'CONTROL' ? 'Control (线上版本)' : currentReport.experiment?.variantName"
              size="small"
              :bordered="false"
              class="bg-zinc-800/50"
            >
              <n-statistic label="请求总数" :value="metric.request_count" />
              <div class="mt-4 space-y-2">
                <div class="flex justify-between text-sm"><span class="text-zinc-400">平均耗时</span> <span>{{ Number(metric.avg_latency || 0).toFixed(0) }} ms</span></div>
                <div class="flex justify-between text-sm"><span class="text-zinc-400">失败次数</span> <span class="text-rose-400">{{ metric.failure_count }}</span></div>
                <div class="flex justify-between text-sm"><span class="text-zinc-400">Token 消耗</span> <span>{{ metric.total_cost_tokens }}</span></div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-alert type="info" title="用户反馈对比" class="mb-4">
          <div v-if="!currentReport.feedback || currentReport.feedback.length === 0">暂无用户反馈数据</div>
          <div v-else class="flex gap-8">
            <div v-for="fb in currentReport.feedback" :key="fb.variant">
              <div class="text-xs text-zinc-500 mb-1">{{ fb.variant }}</div>
              <div class="text-xl font-bold">{{ Number(fb.avg_rating || 0).toFixed(1) }} <span class="text-xs font-normal">/ 5.0</span></div>
              <div class="text-xs text-zinc-400">{{ fb.feedback_count }} 条评价</div>
            </div>
          </div>
        </n-alert>
      </div>
      <n-empty v-else-if="!loading" description="暂无实验报告" />
    </n-spin>
  </n-modal>
</template>
