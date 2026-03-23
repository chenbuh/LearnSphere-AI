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
        <div class="summary-copy">
          <div class="summary-eyebrow">反馈摘要</div>
          <h3 class="summary-title">{{ currentFeedback.status === 0 ? '待处理反馈' : '已处理反馈' }}</h3>
          <p class="summary-description">
            左侧保留用户原始内容，右侧用于修正文案与沉淀训练数据，底部记录处理状态和备注。
          </p>
        </div>
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
          <div class="panel-hint">保留用户提交的原始表达，作为审核和修正依据。</div>
          <div class="content-preview">
            {{ currentFeedback.original_content }}
          </div>
        </n-grid-item>

        <n-grid-item>
          <div class="section-title">修正内容 (用于优化模型数据集)</div>
          <div class="panel-hint">在不改变业务结构的前提下，补全更适合入库的高质量文本。</div>
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
      <div class="panel-hint">记录本次审核结论与备注，便于后续复盘和追踪。</div>
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
  padding: 18px 20px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.5));
  border: 1px solid rgba(148, 163, 184, 0.14);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.summary-copy {
  display: grid;
  gap: 8px;
}

.summary-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.summary-title {
  margin: 0;
  font-size: 20px;
  color: #f8fafc;
}

.summary-description {
  margin: 0;
  line-height: 1.6;
  color: #cbd5e1;
}

.summary-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pending {
  background: rgba(245, 158, 11, 0.16);
  color: #fbbf24;
}

.status-resolved {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
}

.status-editable {
  background: rgba(59, 130, 246, 0.16);
  color: #93c5fd;
}

.status-locked {
  background: rgba(148, 163, 184, 0.16);
  color: #cbd5e1;
}

.section-title {
  margin-bottom: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.panel-hint {
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #a1a1aa;
}

.content-preview {
  max-height: 400px;
  overflow: auto;
  padding: 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.55);
  color: #d4d4d8;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  white-space: pre-wrap;
  line-height: 1.7;
}

@media (max-width: 720px) {
  .summary-panel {
    flex-direction: column;
  }
}
</style>
