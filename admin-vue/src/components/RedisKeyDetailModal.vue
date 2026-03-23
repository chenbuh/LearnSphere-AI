<script setup>
import {
  NButton,
  NDescriptions,
  NDescriptionsItem,
  NEmpty,
  NModal,
  NSpin,
  NSpace,
  NTag
} from 'naive-ui'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  detailLoading: {
    type: Boolean,
    default: false
  },
  keyDetail: {
    type: Object,
    default: null
  },
  formatTTL: {
    type: Function,
    required: true
  },
  formatValue: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:show', 'delete'])
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: 800px; border-radius: 16px;"
    title="键值详情"
    @update:show="emit('update:show', $event)"
  >
    <n-spin :show="detailLoading">
      <div v-if="keyDetail" class="detail-container">
        <div class="summary-panel">
          <div class="summary-copy">
            <div class="summary-eyebrow">键值摘要</div>
            <h3 class="summary-title">{{ keyDetail.key }}</h3>
            <p class="summary-description">先确认类型与 TTL，再查看原始值内容，适合用于快速排查缓存状态。</p>
          </div>
          <div class="summary-tags">
            <n-tag type="info" :bordered="false" size="small">{{ keyDetail.type }}</n-tag>
            <n-tag :type="keyDetail.ttl === -1 ? 'success' : 'warning'" :bordered="false" size="small">
              {{ formatTTL(keyDetail.ttl) }}
            </n-tag>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">元数据</div>
          <n-descriptions bordered label-column-width="120" :column="1">
            <n-descriptions-item label="键名">
              <span class="key-name">{{ keyDetail.key }}</span>
            </n-descriptions-item>
            <n-descriptions-item label="数据类型">
              <n-tag type="info" size="small">{{ keyDetail.type }}</n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="过期时间 (TTL)">
              <n-tag :type="keyDetail.ttl === -1 ? 'success' : 'warning'" size="small">
                {{ formatTTL(keyDetail.ttl) }}
              </n-tag>
            </n-descriptions-item>
          </n-descriptions>
        </div>

        <div class="detail-section">
          <div class="section-title">原始值</div>
          <div class="value-box">
            <div class="value-toolbar">
              <span class="value-label">值内容</span>
              <span class="value-hint">原样展示当前缓存内容</span>
            </div>
            <pre class="value-pre">{{ formatValue(keyDetail.value) }}</pre>
          </div>
        </div>
      </div>
      <n-empty v-else description="未找到详情" />
    </n-spin>

    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">关闭</n-button>
        <n-button type="error" ghost @click="emit('delete', keyDetail?.key)">删除此键</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.detail-container {
  display: grid;
  gap: 18px;
}

.summary-panel {
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.82), rgba(15, 23, 42, 0.5));
  border: 1px solid rgba(148, 163, 184, 0.14);
  display: grid;
  gap: 12px;
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
  font-size: 20px;
  color: #f8fafc;
  word-break: break-all;
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

.key-name {
  font-family: monospace;
  font-weight: 700;
  color: #93c5fd;
  word-break: break-all;
}

.value-box {
  width: 100%;
  max-height: 400px;
  overflow: auto;
  padding: 0;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: #020617;
}

.value-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.9);
}

.value-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #93c5fd;
}

.value-hint {
  font-size: 12px;
  color: #64748b;
}

.value-pre {
  margin: 0;
  padding: 16px;
  color: #d4d4d8;
  font-size: 13px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.7;
}
</style>
