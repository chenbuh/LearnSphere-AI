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
        <n-descriptions bordered label-column-width="120" :column="1">
          <n-descriptions-item label="Key 名称">
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
          <n-descriptions-item label="存储值 (Value)">
            <div class="value-box">
              <pre class="value-pre">{{ formatValue(keyDetail.value) }}</pre>
            </div>
          </n-descriptions-item>
        </n-descriptions>
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
.key-name {
  font-family: monospace;
  font-weight: 700;
  color: #6366f1;
}

.value-box {
  width: 100%;
  max-height: 400px;
  overflow: auto;
  margin-top: 8px;
  padding: 16px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #000;
}

.value-pre {
  margin: 0;
  color: #d4d4d8;
  font-size: 13px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
