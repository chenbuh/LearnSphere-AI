<script setup>
import { computed } from 'vue'
import { NDescriptions, NDescriptionsItem, NModal, NTag, NText } from 'naive-ui'
import { formatUserLogLocation, getUserLogActionLabel, getUserLogModuleLabel } from '@/utils/adminUserLogsConfig'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  log: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show'])

const deviceTypeLabel = computed(() => {
  if (props.log?.deviceType === 'Mobile') return '移动端'
  if (props.log?.deviceType === 'Tablet') return '平板'
  return '桌面端'
})

const statusType = computed(() => (props.log?.status === 1 ? 'success' : 'error'))
const statusLabel = computed(() => (props.log?.status === 1 ? '成功' : '失败'))
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="日志详情"
    style="width: 800px;"
    :bordered="false"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="log" class="log-modal-body">
      <div class="summary-panel">
        <div class="summary-copy">
          <h3 class="summary-title">{{ getUserLogActionLabel(log.action, log.action || '未知操作') }}</h3>
          <p v-if="log.details" class="summary-description">{{ log.details }}</p>
        </div>
        <div class="summary-tags">
          <n-tag size="small" :bordered="false">{{ getUserLogModuleLabel(log.module, log.module || '-') }}</n-tag>
          <n-tag size="small" :type="statusType" :bordered="false">{{ statusLabel }}</n-tag>
          <n-tag size="small" :bordered="false">{{ deviceTypeLabel }}</n-tag>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">基础信息</div>
        <n-descriptions :column="2" bordered label-placement="left">
          <n-descriptions-item label="用户ID">{{ log.userId }}</n-descriptions-item>
          <n-descriptions-item label="用户名">{{ log.username || '-' }}</n-descriptions-item>
          <n-descriptions-item label="操作时间">
            {{ log.createTime ? new Date(log.createTime).toLocaleString('zh-CN') : '-' }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag size="small" :type="statusType" :bordered="false">{{ statusLabel }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="地理位置">
            {{ formatUserLogLocation(log) }}
          </n-descriptions-item>
          <n-descriptions-item label="IP地址">
            <n-text code>{{ log.ip || '-' }}</n-text>
          </n-descriptions-item>
        </n-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">请求上下文</div>
        <n-descriptions :column="2" bordered label-placement="left">
          <n-descriptions-item label="请求方法">{{ log.requestMethod || '-' }}</n-descriptions-item>
          <n-descriptions-item label="设备类型">{{ deviceTypeLabel }}</n-descriptions-item>
          <n-descriptions-item label="请求URL" :span="2">
            <div class="evidence-block">
              <n-text code>{{ log.requestUrl || '-' }}</n-text>
            </div>
          </n-descriptions-item>
          <n-descriptions-item label="操作详情" :span="2">
            <div class="detail-copy">{{ log.details || '-' }}</div>
          </n-descriptions-item>
        </n-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">环境与证据</div>
        <n-descriptions :column="2" bordered label-placement="left">
          <n-descriptions-item label="浏览器">{{ log.browser || '-' }}</n-descriptions-item>
          <n-descriptions-item label="操作系统">{{ log.os || '-' }}</n-descriptions-item>
          <n-descriptions-item v-if="log.errorMsg" label="错误信息" :span="2">
            <div class="evidence-block evidence-block-error">
              <n-text type="error">{{ log.errorMsg }}</n-text>
            </div>
          </n-descriptions-item>
        </n-descriptions>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.log-modal-body {
  display: grid;
  gap: 18px;
}

.summary-panel {
  padding: 16px 18px;
  border-radius: var(--r-lg);
  background: var(--paper-sunken);
  display: grid;
  gap: 12px;
}

.summary-copy {
  display: grid;
  gap: 6px;
}

.summary-title {
  margin: 0;
  font-size: 18px;
  font-weight: 650;
  color: var(--ink);
}

.summary-description {
  margin: 0;
  color: var(--ink-2);
  line-height: 1.6;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-section {
  display: grid;
  gap: 10px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
}

.detail-copy {
  white-space: pre-wrap;
  line-height: 1.7;
  color: var(--ink-2);
}

.evidence-block {
  padding: 10px 12px;
  border-radius: var(--r-md);
  background: var(--paper-sunken);
  white-space: pre-wrap;
  word-break: break-all;
  font-family: var(--font-mono);
  font-size: 13px;
}

.evidence-block :deep(.n-text) {
  font-family: var(--font-mono);
  font-size: 13px;
}

/* Request URL already sits in a sunken block; drop the inline code chip so it doesn't double up. */
.evidence-block :deep(code) {
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--ink);
}

.evidence-block-error {
  background: var(--danger-soft);
}

.log-modal-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 13px;
}
</style>
