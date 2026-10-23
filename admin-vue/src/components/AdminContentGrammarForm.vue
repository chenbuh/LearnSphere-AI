<script setup>
import { NFormItem, NSelect } from 'naive-ui'
import QuestionEditor from '@/components/QuestionEditor.vue'

defineProps({
  formData: {
    type: Object,
    required: true
  },
  grammarTopicOptions: {
    type: Array,
    default: () => []
  },
  difficultyOptions: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="form-row">
    <n-form-item label="语法主题" path="topic">
      <n-select v-model:value="formData.topic" :options="grammarTopicOptions" />
    </n-form-item>
    <n-form-item label="难度" path="difficulty">
      <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
    </n-form-item>
  </div>

  <n-form-item label="练习题目 (可视化编辑)" path="questions">
    <QuestionEditor v-model:value="formData.questions" />
  </n-form-item>
</template>

<style scoped>
/* Side-by-side fields share one row: equal-width columns, same top edge. */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 16px;
  align-items: start;
}

.form-row :deep(.n-input-number) {
  width: 100%;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
