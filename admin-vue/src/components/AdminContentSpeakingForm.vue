<script setup>
import { NFormItem, NInput, NSelect, NSpace } from 'naive-ui'

defineProps({
  formData: {
    type: Object,
    required: true
  },
  speakingTypeOptions: {
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
  <n-form-item label="话题标题" path="title">
    <n-input v-model:value="formData.title" placeholder="输入话题标题" />
  </n-form-item>

  <n-space item-style="flex: 1">
    <n-form-item label="口语类型" path="type">
      <n-select v-model:value="formData.type" :options="speakingTypeOptions" />
    </n-form-item>
    <n-form-item label="难度" path="difficulty">
      <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
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
</template>
