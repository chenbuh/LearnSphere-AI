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
      <n-grid :cols="2" :x-gap="24">
        <n-grid-item>
          <div class="section-title">原始内容</div>
          <div class="content-preview">
            {{ currentFeedback.original_content }}
          </div>
        </n-grid-item>

        <n-grid-item>
          <div class="section-title">修正内容 (用于优化模型数据集)</div>
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
.section-title {
  margin-bottom: 12px;
  font-size: 0.875rem;
  font-weight: 700;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.content-preview {
  max-height: 400px;
  overflow: auto;
  padding: 16px;
  border: 1px solid rgb(39, 39, 42);
  border-radius: 8px;
  background: rgba(24, 24, 27, 0.5);
  color: #d4d4d8;
  font-size: 0.875rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
  white-space: pre-wrap;
}
</style>
