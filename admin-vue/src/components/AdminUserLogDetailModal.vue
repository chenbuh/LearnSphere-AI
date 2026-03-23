<script setup>
import { computed } from 'vue'
import { NDescriptions, NDescriptionsItem, NModal, NTag, NText } from 'naive-ui'
import { getUserLogActionLabel, getUserLogModuleLabel } from '@/utils/adminUserLogsConfig'

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
          <div class="summary-eyebrow">操作摘要</div>
          <h3 class="summary-title">{{ getUserLogActionLabel(log.action, log.action || '未知操作') }}</h3>
          <p class="summary-description">
            {{ log.details || '当前日志未提供额外详情，可结合请求上下文和设备环境继续排查。' }}
          </p>
        </div>
        <div class="summary-tags">
          <n-tag type="info" :bordered="false">{{ getUserLogModuleLabel(log.module, log.module || '-') }}</n-tag>
          <n-tag type="success" :bordered="false">{{ getUserLogActionLabel(log.action, log.action || '-') }}</n-tag>
          <n-tag :type="statusType" :bordered="false">{{ statusLabel }}</n-tag>
          <n-tag :type="log.deviceType === 'Mobile' ? 'warning' : log.deviceType === 'Tablet' ? 'info' : 'default'" :bordered="false">
            {{ deviceTypeLabel }}
          </n-tag>
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
            <n-tag :type="statusType">{{ statusLabel }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="地理位置">
            {{ log.ipProvince || '-' }} {{ log.ipCity || '-' }}
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
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.5));
  border: 1px solid rgba(148, 163, 184, 0.14);
  display: grid;
  gap: 14px;
}

.summary-copy {
  display: grid;
  gap: 8px;
}

.summary-eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.summary-title {
  margin: 0;
  font-size: 22px;
  color: #f8fafc;
}

.summary-description {
  margin: 0;
  color: #cbd5e1;
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
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.detail-copy {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #d4d4d8;
}

.evidence-block {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  white-space: pre-wrap;
  word-break: break-all;
}

.evidence-block-error {
  background: rgba(127, 29, 29, 0.2);
  border-color: rgba(248, 113, 113, 0.16);
}
</style>
