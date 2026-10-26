<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'

const props = defineProps({
  configs: { type: Object, required: true }
})

const emit = defineEmits(['save-epay'])

const message = useMessage()
const saving = ref(false)
const loading = ref(true)

/**
 * 易支付配置表单。
 * 密钥不回传明文，后端只告诉「是否已配置」；留空表示不修改。
 */
const form = reactive({
  enabled: false,
  apiUrl: '',
  pid: '',
  key: '',
  notifyUrl: '',
  returnUrl: '',
  sitename: '',
  unifiedOrderPath: 'mapi.php',
  queryPath: 'api.php'
})

const meta = reactive({
  keyConfigured: false,
  ready: false,
  missing: []
})

const loadConfig = async () => {
  loading.value = true
  try {
    const res = await adminApi.getEpayConfig()
    const data = res.data || {}
    form.enabled = Boolean(data.enabled)
    form.apiUrl = data.apiUrl || ''
    form.pid = data.pid || ''
    form.notifyUrl = data.notifyUrl || ''
    form.returnUrl = data.returnUrl || ''
    form.sitename = data.sitename || ''
    form.unifiedOrderPath = data.unifiedOrderPath || 'mapi.php'
    form.queryPath = data.queryPath || 'api.php'
    form.key = ''
    meta.keyConfigured = Boolean(data.keyConfigured)
    meta.ready = Boolean(data.ready)
    meta.missing = data.missing || []
  } catch (error) {
    message.error('加载易支付配置失败')
  } finally {
    loading.value = false
  }
}

/**
 * 异步通知地址和同步跳转地址有固定格式，可一键按当前域名填充。
 * 填错会导致支付成功但会员不开通（网关回调打不到接口）。
 */
const fillUrls = () => {
  const origin = window.location.origin
  form.notifyUrl = `${origin}/api/payment/epay/notify`
  form.returnUrl = `${origin}/payment/result`
}

const handleSave = async () => {
  if (!form.apiUrl.trim()) {
    message.warning('请填写易支付网关地址')
    return
  }
  if (!form.pid.trim()) {
    message.warning('请填写商户 ID')
    return
  }
  if (!meta.keyConfigured && !form.key.trim()) {
    message.warning('请填写商户密钥')
    return
  }
  if (!form.notifyUrl.trim()) {
    message.warning('请填写异步通知地址')
    return
  }
  if (!form.returnUrl.trim()) {
    message.warning('请填写同步跳转地址')
    return
  }

  saving.value = true
  try {
    const res = await adminApi.saveEpayConfig({
      enabled: String(form.enabled),
      apiUrl: form.apiUrl.trim(),
      pid: form.pid.trim(),
      key: form.key.trim(),
      notifyUrl: form.notifyUrl.trim(),
      returnUrl: form.returnUrl.trim(),
      sitename: form.sitename.trim(),
      unifiedOrderPath: form.unifiedOrderPath.trim(),
      queryPath: form.queryPath.trim()
    })
    const data = res.data || {}
    meta.keyConfigured = Boolean(data.keyConfigured)
    meta.ready = Boolean(data.ready)
    meta.missing = data.missing || []
    form.key = ''
    message.success('易支付配置已保存，立即生效')
    emit('save-epay')
  } catch (error) {
    message.error('保存失败')
  } finally {
    saving.value = false
  }
}

const statusText = computed(() => {
  if (!form.enabled) return '未启用'
  if (meta.ready) return '已就绪'
  return '配置不完整'
})

const statusType = computed(() => {
  if (!form.enabled) return 'default'
  return meta.ready ? 'success' : 'warning'
})

watch(
  () => props.configs,
  () => {},
  { deep: true }
)

loadConfig()
</script>

<template>
  <section class="admin-card settings-card">
    <header class="settings-card__head">
      <div>
        <h2 class="settings-card__title">易支付配置</h2>
        <p class="settings-card__desc">配置彩虹易支付商户信息。保存后立即生效，无需重启服务。</p>
      </div>
      <n-tag :type="statusType" size="small" :bordered="false">{{ statusText }}</n-tag>
    </header>

    <n-spin :show="loading">
      <div class="epay-grid">
        <label class="epay-field epay-field--switch">
          <span class="epay-label">启用在线支付</span>
          <n-switch v-model:value="form.enabled" />
          <span class="epay-hint">关闭后前台价格页不显示支付按钮</span>
        </label>

        <label class="epay-field">
          <span class="epay-label">网关地址 <em>*</em></span>
          <n-input
            v-model:value="form.apiUrl"
            placeholder="https://pay.example.com/"
            :input-props="{ autocomplete: 'off' }"
          />
          <span class="epay-hint">易支付站点根地址，末尾带斜杠</span>
        </label>

        <label class="epay-field">
          <span class="epay-label">商户 ID（PID） <em>*</em></span>
          <n-input
            v-model:value="form.pid"
            placeholder="1000"
            :input-props="{ autocomplete: 'off' }"
          />
        </label>

        <label class="epay-field">
          <span class="epay-label">商户密钥 <em>*</em></span>
          <n-input
            v-model:value="form.key"
            type="password"
            show-password-on="click"
            :placeholder="meta.keyConfigured ? '已配置，留空表示不修改' : '请输入商户密钥'"
            :input-props="{ autocomplete: 'new-password' }"
          />
          <span class="epay-hint">
            {{ meta.keyConfigured ? '已加密存储，留空则保持不变' : '用于订单签名，务必与网关一致' }}
          </span>
        </label>

        <label class="epay-field epay-field--full">
          <span class="epay-label">异步通知地址 <em>*</em></span>
          <div class="epay-inline">
            <n-input
              v-model:value="form.notifyUrl"
              placeholder="https://your-domain/api/payment/epay/notify"
            />
            <n-button quaternary @click="fillUrls">按当前域名填充</n-button>
          </div>
          <span class="epay-hint">必须公网可访问，支付成功后网关回调此地址开通会员</span>
        </label>

        <label class="epay-field epay-field--full">
          <span class="epay-label">同步跳转地址 <em>*</em></span>
          <n-input
            v-model:value="form.returnUrl"
            placeholder="https://your-domain/payment/result"
          />
          <span class="epay-hint">用户支付完成后浏览器跳回的页面</span>
        </label>

        <label class="epay-field">
          <span class="epay-label">订单名称前缀</span>
          <n-input v-model:value="form.sitename" placeholder="LearnSphere" />
        </label>

        <label class="epay-field">
          <span class="epay-label">下单接口路径</span>
          <n-input v-model:value="form.unifiedOrderPath" placeholder="mapi.php" />
        </label>

        <label class="epay-field">
          <span class="epay-label">查单接口路径</span>
          <n-input v-model:value="form.queryPath" placeholder="api.php" />
        </label>
      </div>

      <n-alert
        v-if="form.enabled && meta.missing.length"
        type="warning"
        :bordered="false"
        class="epay-alert"
      >
        还缺少：{{ meta.missing.join('、') }}
      </n-alert>

      <footer class="settings-card__foot">
        <n-button type="primary" :loading="saving" @click="handleSave">保存配置</n-button>
      </footer>
    </n-spin>
  </section>
</template>

<style scoped>
.epay-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 20px;
}

.epay-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.epay-field--full {
  grid-column: 1 / -1;
}

.epay-field--switch {
  flex-direction: row;
  align-items: center;
  gap: 12px;
  grid-column: 1 / -1;
}

.epay-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
}

.epay-label em {
  color: var(--danger, #e5484d);
  font-style: normal;
}

.epay-hint {
  font-size: 12px;
  color: var(--ink-3);
}

.epay-inline {
  display: flex;
  gap: 8px;
  align-items: center;
}

.epay-inline :deep(.n-input) {
  flex: 1;
}

.epay-alert {
  margin-top: 16px;
}

@media (max-width: 900px) {
  .epay-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
