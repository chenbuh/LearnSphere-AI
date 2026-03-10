<template>
  <n-card class="editor-card" :bordered="false" content-style="display: flex; flex-direction: column; height: 100%;">
    <n-input
      :value="essayContent"
      type="textarea"
      placeholder="在这里开始你的创作..."
      :autosize="{ minRows: 20, maxRows: 30 }"
      class="essay-editor-wrapper"
      @update:value="emit('update:essay-content', $event)"
    />

    <div class="editor-footer">
      <div class="stats flex items-center gap-6">
        <div class="stat-item">
          <span class="label">WORDS</span>
          <span class="value">{{ wordCount }}</span>
        </div>
        <div class="stat-item" v-if="settings.timeLimit > 0">
          <span class="label">TIME</span>
          <span class="value" :class="{ 'text-red-500': timeLeft < 60 }">{{ timeLeftDisplay }}</span>
        </div>
      </div>
      <div class="actions">
        <n-button
          type="primary"
          size="large"
          @click="emit('submit')"
          :disabled="wordCount < 10"
          class="submit-btn-premium"
          :loading="isLoading"
        >
          提交 AI 深度分析
        </n-button>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { NButton, NCard, NInput } from 'naive-ui'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  essayContent: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  timeLeft: {
    type: Number,
    default: 0
  },
  timeLeftDisplay: {
    type: String,
    default: '00:00'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:essay-content', 'submit'])
</script>

<style scoped>
.editor-card {
  flex: 1;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  transition: var(--theme-transition);
}

.essay-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

:deep(.w-e-text-container) {
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  line-height: 1.8;
}

:deep(.n-input__textarea-el) {
  height: 100% !important;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
  margin-top: 16px;
}

.stats {
  font-family: monospace;
  color: #71717a;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 12px;
}

.submit-btn-premium {
  height: 50px;
  padding: 0 40px;
  font-weight: 700;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
  transition: all 0.3s;
}

.submit-btn-premium:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item .label {
  font-size: 0.65rem;
  color: var(--secondary-text);
  letter-spacing: 1px;
}

.stat-item .value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-color);
  font-family: 'JetBrains Mono', monospace;
}
</style>