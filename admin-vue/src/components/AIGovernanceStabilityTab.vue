<script setup>
import { computed, h, onMounted, ref, watch } from 'vue'
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NGrid,
  NGridItem,
  NInput,
  NSelect,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui'
import { Activity } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

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
  activeModel: 'qwen-plus',
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

const isModelActive = (model) => normalizeModelValue(aiConfig.value.activeModel) === model

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

const overviewCards = computed(() => ([
  {
    key: 'status',
    label: '熔断状态',
    value: circuitBreakerLabel.value,
    hint: circuitBreakerDescription.value,
    type: circuitBreakerTagType.value,
    tag: circuitBreakerStatus.value
  },
  {
    key: 'model',
    label: '当前运行模型',
    value: currentModelDisplay.value,
    hint: aiConfig.value.isOverridden ? '已启用动态覆盖配置' : '使用系统默认模型路由',
    type: aiConfig.value.isOverridden ? 'warning' : 'info',
    tag: aiConfig.value.isOverridden ? '动态切换' : '默认'
  },
  {
    key: 'p95',
    label: 'P95 延迟',
    value: formatDurationLabel(healthData.value?.p95),
    hint: Number(healthData.value?.max || 0) > 0 ? ('最大延迟 ' + formatDurationLabel(healthData.value?.max)) : '最近暂无有效耗时样本',
    type: Number(healthData.value?.p95 || 0) > 8000 ? 'warning' : 'success',
    tag: '延迟'
  },
  {
    key: 'p99',
    label: 'P99 延迟',
    value: formatDurationLabel(healthData.value?.p99),
    hint: Number(healthData.value?.p99 || 0) > 15000 ? '长尾请求偏高，建议关注重型生成任务。' : '长尾延迟处于可接受范围。',
    type: Number(healthData.value?.p99 || 0) > 15000 ? 'error' : 'success',
    tag: '长尾'
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
      round: true,
      type: row.failRate >= 30 ? 'error' : (row.failRate >= 10 ? 'warning' : 'success')
    }, { default: () => row.failRate.toFixed(1) + '%' })
  },
  {
    title: '总次数',
    key: 'total',
    width: 84
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
    width: 80
  }
]

const alertColumns = [
  {
    title: '级别',
    key: 'level',
    width: 84,
    render: (row) => h(NTag, {
      size: 'small',
      round: true,
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

const qwenModelPresetGroups = ref([
  {
    title: '通用主力',
    models: [
      { label: 'Qwen3.5-Flash', value: 'qwen3.5-flash' },
      { label: 'Qwen3.5-Max', value: 'qwen3.5-max' },
      { label: 'Qwen3.5-Max-Latest', value: 'qwen3.5-max-latest' },
      { label: 'Qwen3.5-Plus', value: 'qwen3.5-plus' },
      { label: 'Qwen3.5-Plus-2026-02-15', value: 'qwen3.5-plus-2026-02-15' },
      { label: 'Qwen3.5-Flash-2026-02-23', value: 'qwen3.5-flash-2026-02-23' },
      { label: 'Qwen3.5-Plus-Latest', value: 'qwen3.5-plus-latest' },
      { label: 'Qwen3.5-Turbo', value: 'qwen3.5-turbo' },
      { label: 'Qwen3.5-Turbo-Latest', value: 'qwen3.5-turbo-latest' },
      { label: 'Qwen3.5-Long', value: 'qwen3.5-long' },
      { label: 'Qwen3.5-Long-Latest', value: 'qwen3.5-long-latest' },
      { label: 'Qwen-Max', value: 'qwen-max' },
      { label: 'Qwen-Max-Latest', value: 'qwen-max-latest' },
      { label: 'Qwen-Plus', value: 'qwen-plus' },
      { label: 'Qwen-Plus-Latest', value: 'qwen-plus-latest' },
      { label: 'Qwen-Turbo', value: 'qwen-turbo' },
      { label: 'Qwen-Turbo-Latest', value: 'qwen-turbo-latest' },
      { label: 'Qwen-Long', value: 'qwen-long' },
      { label: 'Qwen-Long-Latest', value: 'qwen-long-latest' },
      { label: 'Qwen-Flash', value: 'qwen-flash' }
    ]
  },
  {
    title: '推理与数学',
    models: [
      { label: 'Qwen3.5-397B-A17B', value: 'qwen3.5-397b-a17b' },
      { label: 'Qwen3.5-122B-A10B', value: 'qwen3.5-122b-a10b' },
      { label: 'Qwen3.5-35B-A3B', value: 'qwen3.5-35b-a3b' },
      { label: 'Qwen3.5-27B', value: 'qwen3.5-27b' },
      { label: 'Qwen3.5-235B-A22B', value: 'qwen3.5-235b-a22b' },
      { label: 'Qwen3.5-30B-A3B', value: 'qwen3.5-30b-a3b' },
      { label: 'Qwen3.5-32B', value: 'qwen3.5-32b' },
      { label: 'Qwen3.5-14B', value: 'qwen3.5-14b' },
      { label: 'Qwen3.5-8B', value: 'qwen3.5-8b' },
      { label: 'Qwen3.5-4B', value: 'qwen3.5-4b' },
      { label: 'QwQ-32B-Preview', value: 'qwq-32b-preview' },
      { label: 'QwQ-Plus', value: 'qwq-plus' },
      { label: 'QwQ-Plus-Latest', value: 'qwq-plus-latest' },
      { label: 'Qwen3-235B-A22B', value: 'qwen3-235b-a22b' },
      { label: 'Qwen3-30B-A3B', value: 'qwen3-30b-a3b' },
      { label: 'Qwen3-32B', value: 'qwen3-32b' },
      { label: 'Qwen3-14B', value: 'qwen3-14b' },
      { label: 'Qwen3-8B', value: 'qwen3-8b' },
      { label: 'Qwen3-4B', value: 'qwen3-4b' }
    ]
  },
  {
    title: '开源指令',
    models: [
      { label: 'Qwen3.5-72B-Instruct', value: 'qwen3.5-72b-instruct' },
      { label: 'Qwen3.5-32B-Instruct', value: 'qwen3.5-32b-instruct' },
      { label: 'Qwen3.5-14B-Instruct', value: 'qwen3.5-14b-instruct' },
      { label: 'Qwen3.5-7B-Instruct', value: 'qwen3.5-7b-instruct' },
      { label: 'Qwen3.5-3B-Instruct', value: 'qwen3.5-3b-instruct' },
      { label: 'Qwen3.5-1.5B-Instruct', value: 'qwen3.5-1.5b-instruct' },
      { label: 'Qwen2.5-72B-Instruct', value: 'qwen2.5-72b-instruct' },
      { label: 'Qwen2.5-32B-Instruct', value: 'qwen2.5-32b-instruct' },
      { label: 'Qwen2.5-14B-Instruct', value: 'qwen2.5-14b-instruct' },
      { label: 'Qwen2.5-7B-Instruct', value: 'qwen2.5-7b-instruct' },
      { label: 'Qwen2.5-3B-Instruct', value: 'qwen2.5-3b-instruct' },
      { label: 'Qwen2.5-1.5B-Instruct', value: 'qwen2.5-1.5b-instruct' },
      { label: 'Qwen2-72B-Instruct', value: 'qwen2-72b-instruct' },
      { label: 'Qwen2-7B-Instruct', value: 'qwen2-7b-instruct' }
    ]
  },
  {
    title: '代码专用',
    models: [
      { label: 'Qwen3.5-Coder-Plus', value: 'qwen3.5-coder-plus' },
      { label: 'Qwen3.5-Coder-Plus-Latest', value: 'qwen3.5-coder-plus-latest' },
      { label: 'Qwen3.5-Coder-Turbo', value: 'qwen3.5-coder-turbo' },
      { label: 'Qwen3.5-Coder-Turbo-Latest', value: 'qwen3.5-coder-turbo-latest' },
      { label: 'Qwen-Coder-Plus', value: 'qwen-coder-plus' },
      { label: 'Qwen-Coder-Plus-Latest', value: 'qwen-coder-plus-latest' },
      { label: 'Qwen-Coder-Turbo', value: 'qwen-coder-turbo' },
      { label: 'Qwen-Coder-Turbo-Latest', value: 'qwen-coder-turbo-latest' },
      { label: 'Qwen2.5-Coder-32B', value: 'qwen2.5-coder-32b-instruct' },
      { label: 'Qwen2.5-Coder-14B', value: 'qwen2.5-coder-14b-instruct' },
      { label: 'Qwen2.5-Coder-7B', value: 'qwen2.5-coder-7b-instruct' }
    ]
  },
  {
    title: '多模态',
    models: [
      { label: 'Qwen3.5-VL', value: 'qwen3.5-vl' },
      { label: 'Qwen3.5-VL-72B', value: 'qwen3.5-vl-72b-instruct' },
      { label: 'Qwen3.5-VL-32B', value: 'qwen3.5-vl-32b-instruct' },
      { label: 'Qwen3.5-VL-7B', value: 'qwen3.5-vl-7b-instruct' },
      { label: 'Qwen3.5-Omni-Turbo', value: 'qwen3.5-omni-turbo' },
      { label: 'Qwen3.5-Audio-Turbo', value: 'qwen3.5-audio-turbo' },
      { label: 'Qwen-VL-Max', value: 'qwen-vl-max' },
      { label: 'Qwen-VL-Plus', value: 'qwen-vl-plus' },
      { label: 'Qwen2.5-VL-72B', value: 'qwen2.5-vl-72b-instruct' },
      { label: 'Qwen2.5-VL-32B', value: 'qwen2.5-vl-32b-instruct' },
      { label: 'Qwen2.5-VL-7B', value: 'qwen2.5-vl-7b-instruct' },
      { label: 'Qwen-Omni-Turbo', value: 'qwen-omni-turbo' },
      { label: 'Qwen-Audio-Turbo', value: 'qwen-audio-turbo' }
    ]
  }
])

const modelQuickSearch = ref('')
const selectedModelOption = ref('')
const customModelValue = ref('')

const allPresetModels = computed(() => {
  const modelMap = new Map()
  qwenModelPresetGroups.value.forEach(group => {
    group.models.forEach(item => {
      const key = String(item.value).toLowerCase()
      if (!modelMap.has(key)) {
        modelMap.set(key, item)
      }
    })
  })
  return Array.from(modelMap.values())
})

const totalPresetModelCount = computed(() => allPresetModels.value.length)

const modelSelectOptions = computed(() => {
  return allPresetModels.value.map(item => ({
    label: `${item.label} (${item.value})`,
    value: item.value
  }))
})

const filteredModelGroups = computed(() => {
  const keyword = modelQuickSearch.value.trim().toLowerCase()
  if (!keyword) return qwenModelPresetGroups.value
  return qwenModelPresetGroups.value
    .map(group => ({
      ...group,
      models: group.models.filter(item =>
        item.label.toLowerCase().includes(keyword) ||
        item.value.toLowerCase().includes(keyword)
      )
    }))
    .filter(group => group.models.length > 0)
})

const normalizeModelGroups = (res) => {
  const directGroups = res?.data?.groups
  if (Array.isArray(directGroups)) {
    return directGroups
  }
  if (Array.isArray(res?.groups)) {
    return res.groups
  }
  if (Array.isArray(res?.data)) {
    return res.data
  }
  return []
}

const fetchAIModelCatalog = async () => {
  try {
    const res = await adminApi.getAIModelCatalog()
    const groups = normalizeModelGroups(res)
    if (Array.isArray(groups) && groups.length > 0) {
      qwenModelPresetGroups.value = groups
    }
  } catch (error) {
    // 静默回退到本地预置清单，避免对管理员造成干扰提示
    console.warn('[AIGovernance] model catalog load failed, fallback to local presets', error)
  }
}

const fetchAIConfig = async () => {
  try {
    const res = await adminApi.getAIConfig()
    aiConfig.value = res.data
  } catch (error) {
    message.error('获取 AI 配置失败')
  }
}

const handleUpdateModel = async (model) => {
  const previousModel = aiConfig.value.activeModel
  const previousOverridden = aiConfig.value.isOverridden
  // Optimistic Update
  if (model === 'default') {
      aiConfig.value.activeModel = 'default'
      aiConfig.value.isOverridden = false
  } else {
      aiConfig.value.activeModel = model
      aiConfig.value.isOverridden = true
  }

  try {
    const res = await adminApi.updateAIConfig({ model })
    if (res.code === 200) {
        message.success(`模型已切换至: ${model === 'default' ? '系统默认' : model}`)
        fetchAIConfig()
        // Refresh health data to show new model
        const healthRes = await adminApi.getAIHealth()
        healthData.value = healthRes.data
    }
  } catch (error) {
    // Rollback
    aiConfig.value.activeModel = previousModel
    aiConfig.value.isOverridden = previousOverridden
    message.error('切换模型失败')
  }
}

const applySelectedModel = async () => {
  if (!selectedModelOption.value) {
    message.warning('请先选择模型')
    return
  }
  await handleUpdateModel(selectedModelOption.value)
}

const applyCustomModel = async () => {
  const model = customModelValue.value.trim()
  if (!model) {
    message.warning('请输入自定义模型 ID')
    return
  }
  await handleUpdateModel(model)
  selectedModelOption.value = model
  customModelValue.value = ''
}

watch(
  () => aiConfig.value.activeModel,
  (val) => {
    const normalized = normalizeModelValue(val)
    selectedModelOption.value = normalized === 'default' ? '' : normalized
  },
  { immediate: true }
)

onMounted(() => {
  fetchAIHealth()
  fetchAIModelCatalog()
  fetchAIConfig()
})
</script>

<template>
  <div class="stability-layout">
    <n-grid cols="1 800:2 1400:4" responsive="screen" :x-gap="16" :y-gap="16">
      <n-grid-item v-for="card in overviewCards" :key="card.key">
        <n-card :bordered="false" class="main-card metric-card h-full">
          <div class="metric-header">
            <div class="metric-copy">
              <div class="metric-label-row">
                <span class="metric-label">{{ card.label }}</span>
                <n-tag size="small" round :type="card.type">{{ card.tag }}</n-tag>
              </div>
              <div class="metric-value">{{ card.value }}</div>
              <p class="metric-hint">{{ card.hint }}</p>
            </div>
            <div
              v-if="card.key === 'status'"
              class="status-icon"
              :class="{
                'status-ok': circuitBreakerStatus === 'CLOSED',
                'status-danger': circuitBreakerStatus === 'OPEN',
                'status-warn': circuitBreakerStatus === 'HALF_OPEN'
              }"
            >
              <Activity :size="22" />
            </div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid cols="1 1200:2" responsive="screen" :x-gap="24" :y-gap="24">
      <n-grid-item>
        <n-card title="动态模型路由" :bordered="false" class="main-card h-full">
          <div class="router-card-body">
            <div class="router-meta-grid">
              <div class="router-meta-item">
                <span class="router-meta-label">当前生效模型</span>
                <strong class="router-meta-value">{{ currentModelDisplay }}</strong>
              </div>
              <div class="router-meta-item">
                <span class="router-meta-label">预置模型总数</span>
                <strong class="router-meta-value">{{ totalPresetModelCount }} 个</strong>
              </div>
            </div>

            <div>
              <p class="section-caption">预置模型选择</p>
              <div class="control-row">
                <n-select
                  v-model:value="selectedModelOption"
                  :options="modelSelectOptions"
                  filterable
                  clearable
                  placeholder="搜索并选择模型"
                />
                <n-button type="primary" secondary :disabled="!selectedModelOption" @click="applySelectedModel">
                  应用
                </n-button>
              </div>
            </div>

            <div>
              <p class="section-caption">自定义模型 ID</p>
              <div class="control-row">
                <n-input
                  v-model:value="customModelValue"
                  placeholder="例如 qwen-plus-latest / qwen3.5-plus"
                />
                <n-button quaternary :disabled="!customModelValue || !customModelValue.trim()" @click="applyCustomModel">
                  应用自定义
                </n-button>
              </div>
            </div>

            <div>
              <div class="section-title-row">
                <p class="section-caption mb-0">快捷模型面板</p>
                <span class="section-note">支持按名称或 ID 过滤</span>
              </div>
              <n-input
                v-model:value="modelQuickSearch"
                clearable
                size="small"
                placeholder="输入 max / coder / vl / omni / qwen3.5..."
              />
            </div>

            <div v-if="filteredModelGroups.length" class="router-group-list">
              <div
                v-for="group in filteredModelGroups"
                :key="group.title"
                class="group-card"
              >
                <div class="group-card-header">
                  <span class="group-title">{{ group.title }}</span>
                  <span class="group-count">{{ group.models.length }} 个</span>
                </div>
                <div class="group-button-grid">
                  <n-button
                    v-for="model in group.models"
                    :key="model.value"
                    secondary
                    size="tiny"
                    :type="isModelActive(model.value) ? 'primary' : 'default'"
                    @click="handleUpdateModel(model.value)"
                  >
                    <span class="truncate">{{ model.label }}</span>
                  </n-button>
                </div>
              </div>
            </div>
            <n-empty
              v-else
              size="small"
              description="未匹配到模型，请调整关键词或直接使用自定义 ID"
              class="py-6"
            />

            <n-button
              block
              quaternary
              :type="isModelActive('default') ? 'primary' : 'default'"
              @click="handleUpdateModel('default')"
            >
              恢复系统默认运行配置
            </n-button>
          </div>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <div class="panel-stack">
          <n-card title="高失败动作" :bordered="false" class="main-card h-full">
            <p class="card-subtitle">优先关注失败率偏高的生成动作，便于快速定位薄弱环节。</p>
            <n-data-table
              v-if="highFailureActionRows.length"
              :columns="failureColumns"
              :data="highFailureActionRows"
              :bordered="false"
              size="small"
            />
            <n-empty v-else size="small" description="暂无失败动作数据" class="py-8" />
          </n-card>

          <n-card title="常见错误聚合" :bordered="false" class="main-card h-full">
            <p class="card-subtitle">聚合同类错误，方便判断是模型能力问题还是输入侧异常。</p>
            <n-data-table
              v-if="commonErrorRows.length"
              :columns="errorColumns"
              :data="commonErrorRows"
              :bordered="false"
              size="small"
            />
            <n-empty v-else size="small" description="暂无错误聚合数据" class="py-8" />
          </n-card>
        </div>
      </n-grid-item>
    </n-grid>

    <n-card title="系统风险提示" :bordered="false" class="main-card alert-card">
      <p class="card-subtitle">根据熔断状态、延迟分布和失败动作自动整理的当前风险摘要。</p>
      <n-data-table
        :columns="alertColumns"
        :data="systemAlertRows"
        :bordered="false"
        size="small"
      />
    </n-card>
  </div>
</template>

<style scoped>
.stability-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-card {
  backdrop-filter: blur(12px);
  background: rgba(20, 20, 25, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 8px 32px -1px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.12) !important;
}

.metric-card :deep(.n-card__content) {
  height: 100%;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.metric-copy {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.metric-label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.metric-label {
  font-size: 0.8rem;
  color: #a1a1aa;
  letter-spacing: 0.04em;
}

.metric-value {
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1.25;
  color: #f4f4f5;
  word-break: break-word;
}

.metric-hint {
  font-size: 0.78rem;
  line-height: 1.6;
  color: #a1a1aa;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-ok {
  background: rgba(16, 185, 129, 0.18);
  color: #10b981;
  box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.08);
}

.status-danger {
  background: rgba(244, 63, 94, 0.18);
  color: #f43f5e;
  box-shadow: 0 0 0 8px rgba(244, 63, 94, 0.08);
}

.status-warn {
  background: rgba(245, 158, 11, 0.18);
  color: #f59e0b;
  box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.08);
}

.router-card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.router-meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.router-meta-item {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(39, 39, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.router-meta-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.75rem;
  color: #a1a1aa;
}

.router-meta-value {
  display: block;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #f4f4f5;
  word-break: break-word;
}

.section-caption {
  margin-bottom: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #d4d4d8;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.section-note {
  font-size: 0.75rem;
  color: #71717a;
}

.control-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
}

.router-group-list {
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-card {
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(24, 24, 27, 0.42);
}

.group-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.group-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #e4e4e7;
}

.group-count {
  font-size: 0.72rem;
  color: #71717a;
}

.group-button-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 8px;
}

.panel-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.card-subtitle {
  margin-bottom: 12px;
  font-size: 0.78rem;
  line-height: 1.6;
  color: #a1a1aa;
}

.alert-card :deep(.n-data-table-td) {
  vertical-align: top;
}

@media (min-width: 768px) {
  .group-button-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1600px) {
  .group-button-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .router-meta-grid,
  .control-row {
    grid-template-columns: 1fr;
  }

  .section-title-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
