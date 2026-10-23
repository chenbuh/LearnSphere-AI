<script setup>
import { Save } from 'lucide-vue-next'
import { NButton, NForm, NFormItem, NIcon, NInputNumber } from 'naive-ui'

defineProps({
  configs: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save-quota-cost'])

const modules = [
  { key: 'quota_cost_reading', label: '阅读理解生成' },
  { key: 'quota_cost_writing_topic', label: '写作题目生成' },
  { key: 'quota_cost_writing_eval', label: '写作批改' },
  { key: 'quota_cost_listening', label: '听力生成' },
  { key: 'quota_cost_grammar', label: '语法生成' },
  { key: 'quota_cost_speaking_topic', label: '口语生成' },
  { key: 'quota_cost_speaking_eval', label: '口语评测' },
  { key: 'quota_cost_error_analysis', label: '错题深度分析' },
  { key: 'quota_cost_speaking_mock', label: '口语1V1模考' },
  { key: 'quota_cost_mock_exam', label: '模拟考试生成' }
]
</script>

<template>
  <section class="ls-panel settings-panel">
    <header class="ls-panel__head">
      <h2 class="ls-panel__title">模块额度消耗 <span class="ls-panel__count">每次调用扣除次数</span></h2>
    </header>
    <div class="ls-panel__body settings-body">
      <n-form label-placement="left" label-width="120" label-align="left" :show-feedback="false" class="quota-grid">
        <n-form-item v-for="item in modules" :key="item.key" :label="item.label">
          <n-input-number v-model:value="configs[item.key]" :min="1" :max="20" class="settings-number">
            <template #suffix>次</template>
          </n-input-number>
        </n-form-item>
      </n-form>
    </div>
    <footer class="ls-panel__foot">
      <n-button type="primary" secondary @click="emit('save-quota-cost')">
        <template #icon>
          <n-icon :component="Save" />
        </template>
        保存消耗设置
      </n-button>
    </footer>
  </section>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
}

.settings-body {
  flex: 1;
}

/* Two equal columns. Column gap 60px = 20px panel gutter + 2 x 20px body padding, so the
   second column starts at the same x as the right-hand panels above. */
.quota-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 60px;
}

.settings-number {
  width: 180px;
}

.settings-number :deep(.n-input__suffix) {
  color: var(--ink-3);
  font-size: 12px;
}

@media (max-width: 1100px) {
  .quota-grid {
    grid-template-columns: 1fr;
  }
}
</style>
