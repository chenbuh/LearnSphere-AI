<script setup>
import { NButton, NCard, NDivider, NGrid, NGridItem, NIcon } from 'naive-ui'
import { BookOpen, Brain, Clock, Rocket, Target } from 'lucide-vue-next'

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  settings: {
    type: Object,
    required: true
  },
  examTypes: {
    type: Array,
    default: () => []
  },
  testModes: {
    type: Array,
    default: () => []
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  counts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update-setting', 'start'])

const updateSetting = (key, value) => {
  emit('update-setting', key, value)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>词汇能力测试</h1>
      <p>定制专属测试计划，精准定位词汇量等级</p>
    </div>

    <div class="setup-container">
      <n-card class="setup-card" :bordered="false" size="huge">
        <n-grid x-gap="40" y-gap="40" cols="1 800:3" responsive="screen">
          <n-grid-item span="2">
            <div class="setting-section">
              <h3><n-icon :component="BookOpen" color="#6366f1" /> 目标词汇库</h3>
              <div class="grid-options exam-type-grid">
                <div
                  v-for="type in examTypes"
                  :key="type.value"
                  class="option-card"
                  :class="{ active: settings.examType === type.value }"
                  @click="updateSetting('examType', type.value)"
                >
                  <span class="option-icon">{{ type.icon }}</span>
                  <span class="option-label">{{ type.label }}</span>
                </div>
              </div>
            </div>

            <div class="setting-section">
              <h3><n-icon :component="Target" color="#a855f7" /> 测试模式</h3>
              <div class="grid-options mode-grid">
                <div
                  v-for="mode in testModes"
                  :key="mode.value"
                  class="option-card mode-card"
                  :class="{ active: settings.mode === mode.value }"
                  @click="updateSetting('mode', mode.value)"
                >
                  <div class="mode-icon-wrapper">
                    <n-icon :component="mode.icon" />
                  </div>
                  <div class="mode-info">
                    <div class="option-label">{{ mode.label }}</div>
                    <div class="option-desc">{{ mode.desc }}</div>
                  </div>
                </div>
              </div>
            </div>
          </n-grid-item>

          <n-grid-item>
            <div class="side-settings">
              <div class="setting-section">
                <h3><n-icon :component="Brain" color="#eab308" /> 难度等级</h3>
                <div class="pill-options">
                  <div
                    v-for="difficulty in difficulties"
                    :key="difficulty.value"
                    class="pill-option"
                    :class="{ active: settings.difficulty === difficulty.value }"
                    @click="updateSetting('difficulty', difficulty.value)"
                  >
                    {{ difficulty.label }}
                  </div>
                </div>
              </div>

              <div class="setting-section">
                <h3><n-icon :component="Clock" color="#10b981" /> 题目数量</h3>
                <div class="pill-options">
                  <div
                    v-for="count in counts"
                    :key="count"
                    class="pill-option"
                    :class="{ active: settings.count === count }"
                    @click="updateSetting('count', count)"
                  >
                    {{ count }}
                  </div>
                </div>
              </div>

              <n-divider />

              <n-button
                type="primary"
                size="large"
                block
                round
                class="start-btn"
                :loading="loading"
                @click="emit('start')"
              >
                <template #icon><n-icon :component="Rocket" /></template>
                开始挑战
              </n-button>
            </div>
          </n-grid-item>
        </n-grid>
      </n-card>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-header h1 {
  margin-bottom: 12px;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(120deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #a1a1aa;
}

.setup-card {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
}

:global(.dark-mode) .setup-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.setting-section {
  margin-bottom: 32px;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #18181b;
  font-size: 1.1rem;
}

:global(.dark-mode) .setting-section h3 {
  color: #e4e4e7;
}

.grid-options {
  display: grid;
  gap: 16px;
}

.exam-type-grid {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}

.mode-grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  cursor: pointer;
  text-align: center;
  transition: all 0.3s;
}

:global(.dark-mode) .option-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.option-card:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
}

.option-card.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #6366f1;
  color: #fff;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}

.option-icon {
  margin-bottom: 8px;
  font-size: 2rem;
}

.option-label {
  font-size: 0.95rem;
  font-weight: 600;
}

.mode-card {
  flex-direction: row;
  justify-content: flex-start;
  padding: 12px 16px;
  text-align: left;
}

.mode-icon-wrapper {
  display: flex;
  padding: 8px;
  margin-right: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
}

:global(.dark-mode) .mode-icon-wrapper {
  background: rgba(255, 255, 255, 0.05);
}

.mode-card.active .mode-icon-wrapper {
  background: #6366f1;
  color: white;
}

.option-desc {
  margin-top: 2px;
  color: #52525b;
  font-size: 0.75rem;
}

:global(.dark-mode) .option-desc {
  color: #a1a1aa;
}

.side-settings {
  padding: 24px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.02);
}

:global(.dark-mode) .side-settings {
  background: rgba(255, 255, 255, 0.02);
}

.pill-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill-option {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  color: #52525b;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;
  white-space: nowrap;
}

:global(.dark-mode) .pill-option {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #a1a1aa;
}

.pill-option.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.start-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
}
</style>
