<script setup>
import { computed, ref, watch } from 'vue'
import {
  NAlert,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NTag,
  useMessage
} from 'naive-ui'
import { KeyRound, Link, Save, RotateCcw, Cpu, Brain } from 'lucide-vue-next'
import {
  buildProviderConfigPayload,
  normalizeEffort,
  validateProviderUrl
} from '@/utils/aiProviderForm'

const props = defineProps({
  config: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['save', 'reset'])
const message = useMessage()
const formRef = ref(null)
const form = ref({ apiUrl: '', apiKey: '', model: '', reasoningEffort: 'off' })
const supportsProviderConfig = computed(
  () => Object.hasOwn(props.config, 'apiUrl') && typeof props.config.apiKeyConfigured === 'boolean'
)
const keyHint = computed(() =>
  props.config.apiKeyConfigured
    ? '已配置密钥；留空保留现有 Key，填写新 Key 即可替换。'
    : '填写此接口对应的 API Key。密钥保存后不会回显。'
)
/**
 * 推理强度选项。文案刻意写得具体，因为「低/中/高」本身没有信息量，
 * 运维需要知道选了会发生什么（变慢、变贵、还是变准）。
 */
const effortOptions = [
  { label: '关闭（最快，不额外思考）', value: 'off' },
  { label: '低（简单推理，响应较快）', value: 'low' },
  { label: '中（默认思考强度）', value: 'medium' },
  { label: '高（深度思考，较慢但更准）', value: 'high' }
]
const effortHint = computed(() => {
  const model = String(form.value.model || '').toLowerCase()
  if (model.startsWith('qwen3') || model.includes('-thinking')) {
    return '当前模型支持思考。选「关闭」会下发 enable_thinking=false；低/中/高分别对应 1024 / 4096 / 16384 的思考 token 上限。'
  }
  if (model.startsWith('deepseek')) {
    return 'DeepSeek 使用 reasoning_effort 参数，取值为 none / low / high / max（没有 medium，选「中」会按 high 下发）。选「关闭」会下发 thinking.type=disabled。'
  }
  if (/^(o1|o3|o4|gpt-5)/.test(model)) {
    return '当前模型使用 reasoning_effort 参数。选「关闭」时不下发该参数，走模型默认行为。'
  }
  return '当前模型未识别为思考模型，推理强度不会生效。换了支持的模型（qwen3 或 deepseek 系列）后自动启用。'
})
watch(
  () => props.config,
  config => {
    form.value = {
      apiUrl: config.apiUrl || '',
      model: config.activeModel || '',
      apiKey: '',
      reasoningEffort: normalizeEffort(config.reasoningEffort)
    }
    formRef.value?.restoreValidation()
  },
  { immediate: true }
)
const rules = {
  apiUrl: {
    trigger: ['blur', 'input'],
    validator: (_rule, value) =>
      validateProviderUrl(value) || new Error('请输入有效的 HTTP/HTTPS URL，不要在 URL 中填写密钥')
  },
  model: { required: true, message: '请输入模型 ID', trigger: ['blur', 'input'] },
  apiKey: {
    trigger: ['blur', 'input'],
    validator: (_rule, value) =>
      props.config.apiKeyConfigured ||
      Boolean(String(value || '').trim()) ||
      new Error('请填写 API Key')
  }
}
const handleSave = async () => {
  if (props.loading || props.saving) return
  if (!supportsProviderConfig.value) {
    message.warning('当前后端尚未加载 URL 和 Key 配置接口，请重启后端并刷新页面后保存')
    return
  }
  try {
    await formRef.value.validate()
    emit('save', buildProviderConfigPayload(form.value, props.config))
  } catch (error) {
    if (error instanceof Error) message.error(error.message)
  }
}
</script>

<template>
  <section class="ls-panel provider-card">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">AI 服务配置</h2>
      <div class="ls-panel__tools">
        <n-tag size="small" :bordered="false" :type="config.isOverridden ? 'success' : 'default'">
          {{ config.isOverridden ? '后台配置' : '部署默认' }}
        </n-tag>
      </div>
    </header>

    <div class="ls-panel__body provider-body">
      <n-alert v-if="!loading && !supportsProviderConfig" type="info" class="provider-notice">
        可以先手动填写配置。请重启后端并刷新页面，加载 URL 和 Key 配置接口后再保存。
      </n-alert>
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="top"
        :disabled="loading || saving"
        class="provider-form"
        @keydown.enter.prevent="handleSave"
      >
        <n-form-item path="apiUrl" required>
          <template #label
            ><span class="field-label"><Link :size="16" />API URL</span></template
          >
          <div class="field-content">
            <n-input
              v-model:value="form.apiUrl"
              placeholder="https://你的服务地址/v1"
              :input-props="{ 'aria-label': 'API URL', autocomplete: 'url', spellcheck: false }"
            />
            <span class="field-hint">可填写 /v1 基础地址或完整的 /chat/completions 地址。</span>
          </div>
        </n-form-item>

        <n-form-item path="apiKey" :required="!config.apiKeyConfigured">
          <template #label
            ><span class="field-label"><KeyRound :size="16" />API Key</span></template
          >
          <div class="field-content">
            <n-input
              v-model:value="form.apiKey"
              type="password"
              show-password-on="click"
              :placeholder="config.apiKeyConfigured ? '已配置，留空保留当前密钥' : '输入 API Key'"
              :input-props="{
                'aria-label': 'API Key',
                autocomplete: 'new-password',
                spellcheck: false
              }"
            />
            <span class="field-hint">{{ keyHint }}</span>
          </div>
        </n-form-item>

        <n-form-item path="model" required>
          <template #label
            ><span class="field-label"><Cpu :size="16" />模型 ID</span></template
          >
          <div class="field-content">
            <n-input
              v-model:value="form.model"
              placeholder="填写服务提供方的模型 ID"
              :input-props="{ 'aria-label': '模型 ID', autocomplete: 'off', spellcheck: false }"
            />
            <span class="field-hint">模型 ID 必须与该 API 服务提供的模型一致。</span>
          </div>
        </n-form-item>

        <n-form-item path="reasoningEffort">
          <template #label
            ><span class="field-label"><Brain :size="16" />推理强度</span></template
          >
          <div class="field-content">
            <n-select
              v-model:value="form.reasoningEffort"
              :options="effortOptions"
              :aria-label="'推理强度'"
            />
            <span class="field-hint">{{ effortHint }}</span>
          </div>
        </n-form-item>

        <div class="provider-actions">
          <n-space :wrap="true">
            <n-button
              type="primary"
              :loading="saving"
              :disabled="loading || saving"
              @click="handleSave"
            >
              <template #icon><Save :size="17" /></template>保存配置
            </n-button>
            <n-button
              secondary
              :disabled="loading || saving || !supportsProviderConfig"
              @click="emit('reset')"
            >
              <template #icon><RotateCcw :size="16" /></template>恢复部署默认
            </n-button>
          </n-space>
          <span class="field-hint"
            >恢复默认会移除后台覆盖，重新使用部署时配置的 URL、Key 和模型。</span
          >
        </div>
      </n-form>
    </div>
  </section>
</template>

<style scoped>
.provider-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.provider-body {
  flex: 1;
}
.provider-notice {
  margin-bottom: 20px;
}
.field-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--ink);
}
.field-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-hint {
  display: block;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink-3);
  overflow-wrap: anywhere;
}
.provider-actions {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.provider-form :deep(.n-form-item) {
  margin-bottom: 4px;
}
.provider-form :deep(.n-input) {
  min-height: 40px;
}
@media (max-width: 640px) {
  .provider-actions :deep(.n-button) {
    min-height: 42px;
  }
}
</style>
