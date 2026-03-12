<script setup>
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSpace } from 'naive-ui'
import {
  createDefaultSpeakingForm,
  speakingDifficultyOptions,
  speakingTypeOptions
} from '@/utils/adminSpeakingConfig'

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
    default: () => createDefaultSpeakingForm()
  }
})

const emit = defineEmits(['update:show', 'save'])
</script>

<template>
  <n-modal
    v-if="show"
    :show="show"
    preset="card"
    :title="isEdit ? '编辑口语话题' : '添加口语话题'"
    style="width: 800px"
    @update:show="emit('update:show', $event)"
  >
    <n-form :model="formData" label-placement="top">
      <n-form-item label="话题标题" path="title">
        <n-input v-model:value="formData.title" placeholder="输入话题标题" />
      </n-form-item>

      <n-space item-style="flex: 1">
        <n-form-item label="口语类型" path="type">
          <n-select v-model:value="formData.type" :options="speakingTypeOptions" />
        </n-form-item>
        <n-form-item label="难度" path="difficulty">
          <n-select v-model:value="formData.difficulty" :options="speakingDifficultyOptions" />
        </n-form-item>
      </n-space>

      <n-form-item label="详细问题/话题描述" path="question">
        <n-input
          v-model:value="formData.question"
          type="textarea"
          placeholder="输入详细的口语问题或话题描述"
          :autosize="{ minRows: 3, maxRows: 8 }"
        />
      </n-form-item>

      <n-form-item label="关键词 (JSON数组)" path="keywords">
        <n-input
          v-model:value="formData.keywords"
          type="textarea"
          placeholder='例如: ["travel", "adventure", "culture"]'
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>

      <n-form-item label="提示/建议 (JSON数组)" path="tips">
        <n-input
          v-model:value="formData.tips"
          type="textarea"
          placeholder='例如: ["使用过去时态", "描述细节"]'
          :autosize="{ minRows: 2, maxRows: 4 }"
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
