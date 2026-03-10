<template>
  <div class="side-settings">
    <div class="setting-section">
      <h3><n-icon :component="Clock" color="#eab308" /> 限时训练</h3>
      <div class="pill-options">
        <div
          v-for="time in timeLimits"
          :key="time.value"
          class="pill-option"
          :class="{ active: settings.timeLimit === time.value }"
          @click="emit('update-setting', 'timeLimit', time.value)"
        >
          {{ time.label }}
        </div>
      </div>
    </div>

    <div class="tips-box">
      <h4>💡 训练贴士</h4>
      <p>建议在电脑端进行写作训练，以模拟真实考场输入体验。AI 将从词汇、语法、逻辑三个维度提供评分。</p>
    </div>

    <n-divider />

    <n-button
      type="primary"
      size="large"
      block
      round
      class="start-btn"
      @click="emit('generate')"
    >
      <template #icon><n-icon :component="Rocket" /></template>
      生成题目
    </n-button>
  </div>
</template>

<script setup>
import { NButton, NDivider, NIcon } from 'naive-ui'
import { Clock, Rocket } from 'lucide-vue-next'

defineProps({
  settings: {
    type: Object,
    required: true
  },
  timeLimits: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-setting', 'generate'])
</script>

<style scoped>
.side-settings {
  background: var(--accent-fill);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid var(--card-border);
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: var(--text-color);
}

.pill-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill-option {
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--secondary-text);
  white-space: nowrap;
  transition: var(--theme-transition);
}

.pill-option.active {
  background: #f97316;
  color: white;
  border-color: #f97316;
}

.tips-box {
  margin-top: 24px;
  padding: 16px;
  background: var(--accent-fill);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.tips-box h4 {
  margin-bottom: 8px;
  color: var(--text-color);
}

.start-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
}
</style>