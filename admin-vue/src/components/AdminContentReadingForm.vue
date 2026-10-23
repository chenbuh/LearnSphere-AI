<script setup>
import { NFormItem, NInput, NInputNumber, NSelect } from 'naive-ui'
import QuestionEditor from '@/components/QuestionEditor.vue'

defineProps({
  formData: {
    type: Object,
    required: true
  },
  readingCategoryOptions: {
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

  <div class="form-row">
    <n-form-item label="文章分类" path="category">
      <n-select v-model:value="formData.category" :options="readingCategoryOptions" />
    </n-form-item>
    <n-form-item label="难度等级" path="difficulty">
      <n-select v-model:value="formData.difficulty" :options="difficultyOptions" />
    </n-form-item>
    <n-form-item label="词数" path="wordCount">
      <n-input-number v-model:value="formData.wordCount" :min="0" />
    </n-form-item>
  </div>

  <n-form-item label="文章正文" path="content">
    <n-input
      v-model:value="formData.content"
      type="textarea"
      placeholder="输入正文内容"
      :autosize="{ minRows: 5, maxRows: 15 }"
    />
  </n-form-item>

  <n-form-item label="题目 (可视化编辑)" path="questions">
    <QuestionEditor v-model:value="formData.questions" />
  </n-form-item>

  <n-form-item label="来源 (可选)" path="source">
    <n-input v-model:value="formData.source" placeholder="如：Economist, NYT" />
  </n-form-item>
</template>

<style scoped>
/* Script / passage textarea is read for long stretches: white page, ink text, 1.7 leading.
   Mirror and placeholder share the line-height so autosize measures correctly. */
:deep(.n-input .n-input__textarea-el),
:deep(.n-input .n-input__textarea-mirror),
:deep(.n-input .n-input__placeholder) {
  line-height: 1.7;
}

:deep(.n-input .n-input__textarea-el) {
  color: var(--ink);
}

/* Side-by-side fields share one row: equal-width columns, same top edge. */
.form-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
