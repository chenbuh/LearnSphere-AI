<script setup>
import { NFormItem, NSelect, NSpace } from 'naive-ui'
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
  <n-space item-style="flex: 1">
    <n-form-item label="语法主题" path="topic">
      <n-select v-model:value="formData.topic" :options="grammarTopicOptions" />
    </n-form-item>
    <n-form-item label="难度" path="difficulty">
      <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
    </n-form-item>
  </n-space>

  <n-form-item label="练习题目 (可视化编辑)" path="questions">
    <QuestionEditor v-model:value="formData.questions" />
  </n-form-item>
</template>
