<script setup>
import { NButton, NDivider, NForm, NFormItem, NGrid, NGridItem, NInput, NModal, NSelect, NSpace } from 'naive-ui'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  currentFeedback: {
    type: Object,
    default: null
  },
  auditForm: {
    type: Object,
    required: true
  },
  auditLoading: {
    type: Boolean,
    default: false
  },
  statusOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:show', 'submit'])
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    style="width: 900px"
    :title="currentFeedback?.status === 0 ? '处理 AI 内容反馈' : '查看反馈详情'"
    @update:show="emit('update:show', $event)"
  >
    <div v-if="currentFeedback" class="audit-content">
      <div class="summary-panel">
        <h3 class="summary-title">{{ currentFeedback.status === 0 ? '待处理反馈' : '已处理反馈' }}</h3>
        <div class="summary-tags">
          <span class="status-chip" :class="currentFeedback.status === 0 ? 'status-pending' : 'status-resolved'">
            {{ currentFeedback.status === 0 ? '待处理' : '已处理' }}
          </span>
          <span class="status-chip" :class="currentFeedback.status === 0 ? 'status-editable' : 'status-locked'">
            {{ currentFeedback.status === 0 ? '可编辑' : '只读' }}
          </span>
        </div>
      </div>

      <n-grid :cols="2" :x-gap="24">
        <n-grid-item>
          <div class="section-title">原始内容</div>
          <div class="content-preview">
            {{ currentFeedback.original_content }}
          </div>
        </n-grid-item>

        <n-grid-item>
          <div class="section-title">修正内容</div>
          <n-input
            v-model:value="auditForm.correctedContent"
            type="textarea"
            placeholder="在此输入修正后的高质量内容..."
            :autosize="{ minRows: 15, maxRows: 15 }"
            :disabled="currentFeedback.status !== 0"
          />
        </n-grid-item>
      </n-grid>

      <n-divider />

      <div class="section-title">处理记录</div>
      <n-form :model="auditForm">
        <n-form-item v-if="currentFeedback.status === 0" label="处理状态">
          <n-select v-model:value="auditForm.status" :options="statusOptions.filter((o) => o.value !== 0)" />
        </n-form-item>
        <n-form-item label="管理员备注">
          <n-input
            v-model:value="auditForm.adminNotes"
            placeholder="记录修正原因或 Prompt 调整建议..."
            :disabled="currentFeedback.status !== 0"
          />
        </n-form-item>
      </n-form>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button
          v-if="currentFeedback?.status === 0"
          type="primary"
          :loading="auditLoading"
          @click="emit('submit')"
        >
          提交处理
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.audit-content {
  display: grid;
  gap: 18px;
}

.summary-panel {
  padding: 12px 16px;
  border-radius: var(--r-md);
  background: var(--paper-sunken);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.summary-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: 600;
}

/* Waiting on a human decision: highlighter marker. */
.status-pending {
  background: var(--marker-soft);
  color: var(--marker-ink);
}

.status-resolved {
  background: var(--ok-soft);
  color: var(--ok);
}

.status-editable {
  background: var(--accent-soft);
  color: var(--accent-ink);
}

.status-locked {
  background: var(--surface);
  color: var(--ink-2);
}

.section-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.content-preview {
  max-height: 400px;
  overflow: auto;
  padding: 14px 16px;
  border-radius: var(--r-md);
  background: var(--paper-sunken);
  color: var(--ink);
  font-size: 14px;
  font-family: var(--font-mono);
  white-space: pre-wrap;
  line-height: 1.7;
}

@media (max-width: 720px) {
  .summary-panel {
    flex-direction: column;
  }
}
</style>
