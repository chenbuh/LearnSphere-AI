<script setup>
import { NFormItem, NInput, NSelect, NSpace } from 'naive-ui'
import QuestionEditor from '@/components/QuestionEditor.vue'

defineProps({
  formData: {
    type: Object,
    required: true
  },
  listeningTypeOptions: {
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
  <n-form-item label="标题" path="title">
    <n-input v-model:value="formData.title" placeholder="输入内容标题" />
  </n-form-item>

  <n-space item-style="flex: 1">
    <n-form-item label="听力类型" path="type">
      <n-select v-model:value="formData.type" :options="listeningTypeOptions" />
    </n-form-item>
    <n-form-item label="难度等级" path="difficulty">
      <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
    </n-form-item>
  </n-space>

  <n-form-item label="听力原文/脚本" path="script">
    <n-input
      v-model:value="formData.script"
      type="textarea"
      placeholder="输入原文内容"
      :autosize="{ minRows: 5, maxRows: 15 }"
    />
  </n-form-item>

  <n-form-item label="题目 (可视化编辑)" path="questions">
    <QuestionEditor v-model:value="formData.questions" />
  </n-form-item>

  <n-form-item label="来源 (可选)" path="source">
    <n-input v-model:value="formData.source" placeholder="如：TED, BBC" />
  </n-form-item>
</template>
