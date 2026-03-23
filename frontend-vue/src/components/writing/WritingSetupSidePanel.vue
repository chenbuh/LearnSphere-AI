<template>
  <div class="side-settings">
    <div class="rail-head">
      <p class="rail-kicker">生成入口</p>
      <h3 class="rail-title">确认参数后开始这次写作</h3>
      <p class="rail-caption">确认设置后即可生成本次写作题目。</p>
    </div>

    <div class="setting-section">
      <h3><n-icon :component="Gauge" color="#f97316" /> 写作难度</h3>
      <div class="pill-options pill-options--difficulty">
        <div
          v-for="difficulty in difficulties"
          :key="difficulty.value"
          class="pill-option"
          :class="{ active: settings.difficulty === difficulty.value }"
          @click="emit('update-setting', 'difficulty', difficulty.value)"
        >
          {{ difficulty.label }}
        </div>
      </div>
    </div>

    <div class="setting-section">
      <h3><n-icon :component="Clock" color="#fb923c" /> 限时训练</h3>
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

    <div class="selection-summary">
      <div class="summary-row">
        <span>考试类型</span>
        <strong>{{ selectedExamLabel }}</strong>
      </div>
      <div class="summary-row">
        <span>写作题型</span>
        <strong>{{ selectedModeLabel || '未选择' }}</strong>
      </div>
      <div class="summary-row">
        <span>写作难度</span>
        <strong>{{ selectedDifficultyLabel }}</strong>
      </div>
      <div class="summary-row">
        <span>训练时长</span>
        <strong>{{ selectedTimeLabel }}</strong>
      </div>
    </div>

    <p class="rail-note">提交后会生成本次写作分析。</p>

    <n-button
      type="primary"
      size="large"
      block
      class="start-btn"
      @click="emit('generate')"
    >
      <template #icon><n-icon :component="Rocket" /></template>
      生成题目
    </n-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { Clock, Gauge, Rocket } from 'lucide-vue-next'
import { getExamTypeLabel } from '@/constants/examTypes'

const emit = defineEmits(['update-setting', 'generate'])

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  selectedModeLabel: {
    type: String,
    default: ''
  },
  selectedDifficultyLabel: {
    type: String,
    default: '标准'
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  timeLimits: {
    type: Array,
    default: () => []
  }
})

const selectedTimeLabel = computed(() => (
  props.timeLimits.find(item => item.value === props.settings.timeLimit)?.label
  || (props.settings.timeLimit > 0 ? `${props.settings.timeLimit} 分钟` : '不限时')
))

const selectedExamLabel = computed(() => (
  getExamTypeLabel(props.settings.examType, '未选择')
))
</script>

<style scoped>
.side-settings {
  display: grid;
  gap: 18px;
  padding: 22px 20px;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.22);
}

.rail-head {
  display: grid;
  gap: 8px;
}

.rail-kicker {
  margin: 0;
  color: #fb923c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.rail-title {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.35;
  color: var(--text-color);
}

.rail-caption {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.9rem;
  line-height: 1.6;
}

.setting-section {
  display: grid;
  gap: 12px;
}

.setting-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  margin: 0;
  color: var(--text-color);
}

.pill-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.pill-option {
  text-align: center;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.12);
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--secondary-text);
  white-space: nowrap;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.pill-option.active {
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: white;
  border-color: transparent;
}

.selection-summary {
  display: grid;
  gap: 10px;
  padding: 16px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.summary-row strong {
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 700;
}

.rail-note {
  margin: 0;
  padding-top: 2px;
  font-size: 0.88rem;
  color: var(--secondary-text);
  line-height: 1.55;
}

.start-btn {
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 18px;
  background: linear-gradient(135deg, #fb923c, #f97316) !important;
  box-shadow: none;
}

:global(html[data-theme='light'] .side-settings) {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 40%);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
}

:global(html[data-theme='light'] .pill-option) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(148, 163, 184, 0.16);
  color: #64748b;
}

:global(html[data-theme='light'] .selection-summary) {
  border-color: rgba(148, 163, 184, 0.16);
}

:global(html[data-theme='light'] .rail-title),
:global(html[data-theme='light'] .setting-section h3),
:global(html[data-theme='light'] .summary-row strong) {
  color: #0f172a;
}

:global(html[data-theme='light'] .rail-caption),
:global(html[data-theme='light'] .rail-note),
:global(html[data-theme='light'] .summary-row) {
  color: #64748b;
}

@media (max-width: 900px) {
  .side-settings {
    padding: 10px 8px;
    border-radius: 16px;
  }

  .setting-section {
    margin-bottom: 14px;
  }

  .setting-section h3 {
    font-size: 0.92rem;
    margin-bottom: 8px;
  }

  .pill-options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }

  .pill-option {
    padding: 8px 8px;
    border-radius: 999px;
    font-size: 0.8rem;
  }

  .rail-note {
    font-size: 0.78rem;
    line-height: 1.45;
  }

  .start-btn {
    height: 44px;
    font-size: 0.9rem;
    border-radius: 14px;
  }
}
</style>

