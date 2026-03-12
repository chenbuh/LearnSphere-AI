<script setup>
import { defineAsyncComponent } from 'vue'
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSpace } from 'naive-ui'
import {
  createDefaultGrammarForm,
  grammarDifficultyOptions,
  grammarTopicOptions
} from '@/utils/adminGrammarConfig'

const QuestionEditor = defineAsyncComponent(() => import('@/components/QuestionEditor.vue'))

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
    default: () => createDefaultGrammarForm()
  }
})

const emit = defineEmits(['update:show', 'save'])
</script>

<template>
  <n-modal
    v-if="show"
    :show="show"
    preset="card"
    :title="isEdit ? '编辑语法练习' : '添加语法练习'"
    style="width: 800px"
    @update:show="emit('update:show', $event)"
  >
    <n-form :model="formData" label-placement="top">
      <n-space item-style="flex: 1">
        <n-form-item label="语法主题" path="topic">
          <n-select v-model:value="formData.topic" :options="grammarTopicOptions" />
        </n-form-item>
        <n-form-item label="难度" path="difficulty">
          <n-select v-model:value="formData.difficulty" :options="grammarDifficultyOptions" />
        </n-form-item>
      </n-space>

      <n-form-item label="练习题目 (可视化编辑)" path="questions">
        <QuestionEditor v-model:value="formData.questions" />
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
