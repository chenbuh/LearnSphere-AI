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
    style="width: 800px; border-radius: var(--r-lg);"
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
  padding: 16px 18px;
  border-radius: var(--r-md);
  background: var(--paper-sunken);
  display: grid;
  gap: 12px;
}

.summary-copy {
  display: grid;
  gap: 8px;
}

.summary-eyebrow {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
}

.summary-title {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
  word-break: break-all;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
}

.key-name {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--accent-ink);
  word-break: break-all;
}

.value-box {
  width: 100%;
  max-height: 400px;
  overflow: auto;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper-sunken);
}

.value-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.value-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-2);
}

.value-hint {
  font-size: 12px;
  color: var(--ink-3);
}

.value-pre {
  margin: 0;
  padding: 16px;
  color: var(--ink);
  font-size: 13px;
  font-family: var(--font-mono);
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.7;
}
</style>
