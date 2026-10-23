<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import {
  NButton,
  NDataTable,
  NIcon,
  NTag,
  useMessage
} from 'naive-ui'
import { Clock, Cpu, Gauge, History, RefreshCw, ShieldCheck } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import AIProviderConfigPanel from '@/components/AIProviderConfigPanel.vue'

const props = defineProps({
  aiHealth: {
    type: Object,
    default: () => ({
      commonErrors: [],
      highFailureActions: [],
      p95: 0,
      p99: 0,
      circuitBreakerStatus: 'CLOSED',
      lastFailoverTime: null,
      activeModel: 'qwen-plus'
    })
  }
})

const message = useMessage()
const healthData = ref(props.aiHealth)

watch(
  () => props.aiHealth,
  (value) => {
    healthData.value = value || healthData.value
  },
  { deep: true }
)

const fetchAIHealth = async () => {
  try {
    const res = await adminApi.getAIHealth()
    healthData.value = res.data
  } catch (error) {
    message.error('获取 AI 健康状态失败')
  }
}

const aiConfig = ref({
  activeModel: '',
  apiUrl: '',
  apiKeyConfigured: false,
  isOverridden: false
})

const normalizeModelValue = (model) => {
  if (!model) return 'default'
  const raw = String(model).trim()
  const lower = raw.toLowerCase()
  if (lower === 'default' || raw.includes('系统默认')) {
    return 'default'
  }
  return raw
}

const currentModelDisplay = computed(() => {
  return normalizeModelValue(aiConfig.value.activeModel) === 'default'
    ? '系统默认（跟随部署配置 ai.model）'
    : aiConfig.value.activeModel
})


const formatDurationLabel = (value) => {
  const duration = Number(value || 0)
  return duration > 0 ? duration + ' ms' : '暂无数据'
}

const circuitBreakerStatus = computed(() => {
  return String(healthData.value?.circuitBreakerStatus || 'CLOSED').toUpperCase()
})

const circuitBreakerLabel = computed(() => {
  if (circuitBreakerStatus.value === 'OPEN') return '熔断保护中'
  if (circuitBreakerStatus.value === 'HALF_OPEN') return '半开恢复中'
  return '正常运行'
})

const circuitBreakerTagType = computed(() => {
  if (circuitBreakerStatus.value === 'OPEN') return 'error'
  if (circuitBreakerStatus.value === 'HALF_OPEN') return 'warning'
  return 'success'
})

const circuitBreakerDescription = computed(() => {
  if (circuitBreakerStatus.value === 'OPEN') return '当前调用链已进入保护状态，请优先检查上游模型或网络。'
  if (circuitBreakerStatus.value === 'HALF_OPEN') return '系统正在放行少量请求验证可用性。'
  return '当前未检测到熔断，AI 请求可正常放行。'
})

const normalizeErrorRows = (rows) => {
  if (!Array.isArray(rows)) return []
  return rows.map((item, index) => ({
    id: index + 1,
    error: item?.error || item?.ERROR || '未知错误',
    count: Number(item?.count || item?.COUNT || 0)
  }))
}

const normalizeFailureRows = (rows) => {
  if (!Array.isArray(rows)) return []
  return rows.map((item, index) => ({
    id: index + 1,
    action: item?.action || item?.ACTION || '未知动作',
    failRate: Number(item?.failRate || item?.FAILRATE || 0),
    total: Number(item?.total || item?.TOTAL || 0)
  }))
}

const commonErrorRows = computed(() => normalizeErrorRows(healthData.value?.commonErrors))
const highFailureActionRows = computed(() => normalizeFailureRows(healthData.value?.highFailureActions))

const statTone = (type) => {
  if (type === 'error') return 'ls-stat--danger'
  if (type === 'warning') return 'ls-stat--warn'
  if (type === 'success') return 'ls-stat--ok'
  return ''
}

const lastFailoverLabel = computed(() => (
  healthData.value?.lastFailoverTime ? new Date(healthData.value.lastFailoverTime).toLocaleString() : '--'
))

const overviewCards = computed(() => ([
  {
    key: 'status',
    icon: ShieldCheck,
    label: '熔断状态',
    value: circuitBreakerLabel.value,
    hint: circuitBreakerStatus.value,
    tone: statTone(circuitBreakerTagType.value)
  },
  {
    key: 'model',
    icon: Cpu,
    label: '当前运行模型',
    value: currentModelDisplay.value,
    hint: aiConfig.value.isOverridden ? '后台动态切换' : '部署默认',
    tone: ''
  },
  {
    key: 'p95',
    icon: Gauge,
    label: 'P95 延迟',
    value: formatDurationLabel(healthData.value?.p95),
    hint: Number(healthData.value?.max || 0) > 0 ? ('最大 ' + formatDurationLabel(healthData.value?.max)) : '',
    tone: Number(healthData.value?.p95 || 0) > 8000 ? 'ls-stat--warn' : ''
  },
  {
    key: 'p99',
    icon: Clock,
    label: 'P99 延迟',
    value: formatDurationLabel(healthData.value?.p99),
    hint: Number(healthData.value?.p99 || 0) > 15000 ? '长尾偏高' : '',
    tone: Number(healthData.value?.p99 || 0) > 15000 ? 'ls-stat--danger' : ''
  },
  {
    key: 'failover',
    icon: History,
    label: '最近切换',
    value: lastFailoverLabel.value,
    hint: '',
    tone: ''
  }
]))

const failureColumns = [
  {
    title: '动作类型',
    key: 'action',
    ellipsis: { tooltip: true }
  },
  {
    title: '失败率',
    key: 'failRate',
    width: 96,
    render: (row) => h(NTag, {
      size: 'small',
      bordered: false,
      type: row.failRate >= 30 ? 'error' : (row.failRate >= 10 ? 'warning' : 'success')
    }, { default: () => row.failRate.toFixed(1) + '%' })
  },
  {
    title: '总次数',
    key: 'total',
    width: 84,
    align: 'right'
  }
]

const errorColumns = [
  {
    title: '错误信息',
    key: 'error',
    ellipsis: { tooltip: true }
  },
  {
    title: '次数',
    key: 'count',
    width: 80,
    align: 'right'
  }
]

const alertColumns = [
  {
    title: '级别',
    key: 'level',
    width: 84,
    render: (row) => h(NTag, {
      size: 'small',
      bordered: false,
      type: row.levelType
    }, { default: () => row.level })
  },
  {
    title: '来源',
    key: 'source',
    width: 120
  },
  {
    title: '说明',
    key: 'content',
    ellipsis: { tooltip: true }
  },
  {
    title: '建议',
    key: 'suggestion',
    ellipsis: { tooltip: true }
  }
]

const systemAlertRows = computed(() => {
  const rows = []

  if (circuitBreakerStatus.value === 'OPEN') {
    rows.push({
      level: '高',
      levelType: 'error',
      source: '熔断器',
      content: '熔断器处于 OPEN 状态，部分请求会被快速失败保护。',
      suggestion: '检查最近失败日志、上游模型可用性，并视情况切换模型。'
    })
  } else if (circuitBreakerStatus.value === 'HALF_OPEN') {
    rows.push({
      level: '中',
      levelType: 'warning',
      source: '熔断器',
      content: '熔断器处于 HALF_OPEN 状态，正在尝试恢复。',
      suggestion: '观察错误率与延迟是否回落，再决定是否继续切流。'
    })
  }

  if (Number(healthData.value?.p99 || 0) > 15000) {
    rows.push({
      level: '高',
      levelType: 'error',
      source: '延迟分布',
      content: 'P99 延迟超过 15 秒，长尾请求偏高。',
      suggestion: '优先检查高复杂度生成任务，必要时切换更稳定模型。'
    })
  } else if (Number(healthData.value?.p95 || 0) > 8000) {
    rows.push({
      level: '中',
      levelType: 'warning',
      source: '延迟分布',
      content: 'P95 延迟超过 8 秒，响应体验开始下降。',
      suggestion: '关注最近高耗时动作，排查 Prompt 过长或模型响应抖动。'
    })
  }

  if (highFailureActionRows.value.length > 0 && highFailureActionRows.value[0].failRate >= 20) {
    rows.push({
      level: '中',
      levelType: 'warning',
      source: '失败动作',
      content: '动作 ' + highFailureActionRows.value[0].action + ' 失败率达到 ' + highFailureActionRows.value[0].failRate.toFixed(1) + '%。',
      suggestion: '优先检查该动作关联的 Prompt、模型能力和输入大小。'
    })
  }

  if (commonErrorRows.value.length > 0) {
    rows.push({
      level: '中',
      levelType: 'warning',
      source: '错误聚合',
      content: '最近高频错误：' + commonErrorRows.value[0].error,
      suggestion: '结合运行日志进一步确认是否为模型限流、参数兼容或数据问题。'
    })
  }

  if (!rows.length) {
    rows.push({
      level: '低',
      levelType: 'success',
      source: '系统',
      content: '当前未检测到明显稳定性风险。',
      suggestion: '继续观察延迟趋势与模型切换效果即可。'
    })
  }

  return rows
})

const loadingAIConfig = ref(false)
const savingAIConfig = ref(false)

const fetchAIConfig = async () => {
  loadingAIConfig.value = true
  try {
    const res = await adminApi.getAIConfig()
    aiConfig.value = res.data
  } catch (error) {
    message.error('获取 AI 服务配置失败')
  } finally {
    loadingAIConfig.value = false
  }
}

const saveAIConfig = async (payload) => {
  savingAIConfig.value = true
  try {
    await adminApi.updateAIConfig(payload)
    await fetchAIConfig()
    message.success('AI 服务配置已保存，后续请求立即生效')
    fetchAIHealth()
  } catch (error) {
    message.error(error.message || '保存 AI 服务配置失败')
  } finally {
    savingAIConfig.value = false
  }
}

const resetAIConfig = async () => {
  savingAIConfig.value = true
  try {
    await adminApi.updateAIConfig({ reset: true })
    await fetchAIConfig()
    message.success('已恢复部署默认配置')
    fetchAIHealth()
  } catch (error) {
    message.error(error.message || '恢复默认配置失败')
  } finally {
    savingAIConfig.value = false
  }
}

onMounted(() => {
  fetchAIHealth()
  fetchAIConfig()
})
</script>

<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary @click="fetchAIHealth">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
  </Teleport>

  <div class="stability-tab">
    <section class="ls-stats stability-stats" aria-label="稳定性摘要">
      <div
        v-for="card in overviewCards"
        :key="card.key"
        class="ls-stat"
        :class="card.tone"
        :title="card.key === 'status' ? circuitBreakerDescription : card.value"
      >
        <span class="ls-stat__label"><component :is="card.icon" :size="14" />{{ card.label }}</span>
        <strong class="ls-stat__value stability-stat__value">{{ card.value }}</strong>
        <span v-if="card.hint" class="ls-stat__hint">{{ card.hint }}</span>
      </div>
    </section>

    <div class="ls-grid-2 stability-row">
      <AIProviderConfigPanel
        :config="aiConfig"
        :loading="loadingAIConfig"
        :saving="savingAIConfig"
        @save="saveAIConfig"
        @reset="resetAIConfig"
      />

      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">高失败动作 <span class="ls-panel__count">{{ highFailureActionRows.length }} 项</span></h2>
        </header>
        <n-data-table
          v-if="highFailureActionRows.length"
          :columns="failureColumns"
          :data="highFailureActionRows"
          :bordered="false"
          size="small"
        />
        <div v-else class="ls-empty">暂无失败动作数据</div>
      </section>
    </div>

    <div class="ls-grid-2 stability-row">
      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">常见错误 <span class="ls-panel__count">{{ commonErrorRows.length }} 类</span></h2>
        </header>
        <n-data-table
          v-if="commonErrorRows.length"
          :columns="errorColumns"
          :data="commonErrorRows"
          :bordered="false"
          size="small"
        />
        <div v-else class="ls-empty">暂无错误聚合数据</div>
      </section>

      <section class="ls-panel alert-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">风险提示 <span class="ls-panel__count">{{ systemAlertRows.length }} 条</span></h2>
        </header>
        <n-data-table
          :columns="alertColumns"
          :data="systemAlertRows"
          :bordered="false"
          size="small"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.stability-tab {
  display: grid;
  gap: 20px;
  min-width: 0;
}

.stability-stats {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.stability-stats .ls-stat {
  align-content: start;
}

/* Values here are words (model id, time), so keep them one line and smaller than numeric KPIs. */
.stability-stat__value {
  overflow: hidden;
  font-size: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stability-row {
  align-items: stretch;
}

.stability-row > :deep(.ls-panel),
.stability-row > .ls-panel {
  display: flex;
  flex-direction: column;
}

.alert-panel :deep(.n-data-table-td) {
  vertical-align: top;
}

@media (max-width: 1280px) {
  .stability-stats {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  }
}
</style>
