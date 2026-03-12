<script setup>
import { NButton, NForm, NFormItem, NInput, NInputNumber, NModal, NSelect, NSpace } from 'naive-ui'
import {
  createDefaultWritingForm,
  writingDifficultyOptions,
  writingExamTypeOptions,
  writingModeOptions
} from '@/utils/adminWritingConfig'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => createDefaultWritingForm()
  }
})

const emit = defineEmits(['update:show', 'save'])
</script>

<template>
  <n-modal
    v-if="show"
    :show="show"
    preset="card"
    :title="isEdit ? '编辑写作话题' : '添加写作话题'"
    style="width: 700px"
    @update:show="emit('update:show', $event)"
  >
    <n-form :model="formData" label-placement="top">
      <n-form-item label="话题标题" path="title">
        <n-input v-model:value="formData.title" placeholder="输入话题标题" />
      </n-form-item>

      <n-space item-style="flex: 1">
        <n-form-item label="考试类型" path="examType">
          <n-select v-model:value="formData.examType" :options="writingExamTypeOptions" />
        </n-form-item>
        <n-form-item label="写作模式" path="mode">
          <n-select v-model:value="formData.mode" :options="writingModeOptions" />
        </n-form-item>
        <n-form-item label="难度" path="difficulty">
          <n-select v-model:value="formData.difficulty" :options="writingDifficultyOptions" />
        </n-form-item>
      </n-space>

      <n-form-item label="最小词数" path="minWords">
        <n-input-number v-model:value="formData.minWords" :min="100" :step="50" />
      </n-form-item>

      <n-form-item label="写作提示/要求" path="prompt">
        <n-input
          v-model:value="formData.prompt"
          type="textarea"
          placeholder="输入详细的写作要求和提示"
          :autosize="{ minRows: 4, maxRows: 10 }"
        />
      </n-form-item>

      <n-form-item label="写作技巧提示 (JSON数组)" path="tips">
        <n-input
          v-model:value="formData.tips"
          type="textarea"
          placeholder='例如: ["明确观点", "逻辑清晰"]'
          :autosize="{ minRows: 2, maxRows: 5 }"
        />
      </n-form-item>

      <div class="modal-actions">
        <n-button @click="emit('update:show', false)">取消</n-button>
        <n-button type="primary" @click="emit('save')">确定保存</n-button>
      </div>
    </n-form>
  </n-modal>
</template>

<style scoped>
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
</style>
