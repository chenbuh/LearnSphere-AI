<script setup>
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { BookOpen, CheckCircle2, Hash, Sparkles, Target } from 'lucide-vue-next'

const props = defineProps({
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

const selectedExamLabel = computed(() => (
  props.examTypes.find(item => item.value === props.settings.examType)?.label || props.settings.examType
))

const selectedModeLabel = computed(() => (
  props.testModes.find(item => item.value === props.settings.mode)?.label || props.settings.mode
))

const selectedDifficultyLabel = computed(() => (
  props.difficulties.find(item => item.value === props.settings.difficulty)?.label || props.settings.difficulty
))
</script>

<template>
  <section class="setup-shell">
    <div class="setup-stage">
      <div class="setup-intro">
        <div>
          <p class="setup-kicker">测试设置</p>
          <h2>先定词库和题型，再开始本次词汇测试</h2>
        </div>
        <p>选好词库、题型、难度和题量后开始测试。</p>
      </div>

      <div class="setting-section">
        <div class="section-heading">
          <n-icon :component="BookOpen" />
          <span>考试词库</span>
        </div>
        <div class="exam-grid">
          <button
            v-for="exam in props.examTypes"
            :key="exam.value"
            type="button"
            class="exam-card"
            :class="{ active: props.settings.examType === exam.value }"
            @click="emit('update-setting', 'examType', exam.value)"
          >
            <div class="exam-top">
              <span class="exam-icon">{{ exam.icon }}</span>
              <n-icon
                v-if="props.settings.examType === exam.value"
                :component="CheckCircle2"
                class="exam-check"
              />
            </div>
            <strong>{{ exam.label }}</strong>
            <span>{{ props.settings.examType === exam.value ? '当前词库' : '点击切换' }}</span>
          </button>
        </div>
      </div>

      <div class="setting-section">
        <div class="section-heading">
          <n-icon :component="Target" />
          <span>测试题型</span>
        </div>
        <div class="mode-list">
          <button
            v-for="mode in props.testModes"
            :key="mode.value"
            type="button"
            class="mode-row"
            :class="{ active: props.settings.mode === mode.value }"
            @click="emit('update-setting', 'mode', mode.value)"
          >
            <div class="mode-main">
              <div class="mode-icon">
                <n-icon :component="mode.icon" />
              </div>
              <div class="mode-copy">
                <strong>{{ mode.label }}</strong>
                <p>{{ mode.desc }}</p>
              </div>
            </div>
            <span class="mode-state">{{ props.settings.mode === mode.value ? '已选中' : '可切换' }}</span>
          </button>
        </div>
      </div>
    </div>

    <aside class="setup-rail">
      <div class="rail-panel rail-panel--focus">
        <div class="rail-heading">
          <n-icon :component="Sparkles" />
          <span>开始测试</span>
        </div>
        <h3>确认难度和题量后开始测试</h3>
        <p>确认设置后即可开始。</p>

        <div class="control-group">
          <label>难度</label>
          <div class="pill-row">
            <button
              v-for="difficulty in props.difficulties"
              :key="difficulty.value"
              type="button"
              class="pill-button"
              :class="{ active: props.settings.difficulty === difficulty.value }"
              @click="emit('update-setting', 'difficulty', difficulty.value)"
            >
              {{ difficulty.label }}
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>题量</label>
          <div class="count-grid">
            <button
              v-for="count in props.counts"
              :key="count"
              type="button"
              class="count-card"
              :class="{ active: props.settings.count === count }"
              @click="emit('update-setting', 'count', count)"
            >
              <n-icon :component="Hash" />
              <strong>{{ count }}</strong>
              <span>题</span>
            </button>
          </div>
        </div>

        <div class="summary-panel">
          <div class="summary-row">
            <span>词库</span>
            <strong>{{ selectedExamLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>题型</span>
            <strong>{{ selectedModeLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>难度</span>
            <strong>{{ selectedDifficultyLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>题量</span>
            <strong>{{ props.settings.count }} 题</strong>
          </div>
        </div>

        <p class="rail-note">
          开始后可查看题目、进度和跳题导航。
        </p>

        <n-button
          block
          type="primary"
          size="large"
          color="#f97316"
          class="start-button"
          :loading="props.loading"
          @click="emit('start')"
        >
          开始生成试卷
        </n-button>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.setup-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.14fr) minmax(310px, 0.86fr);
  gap: 24px;
  align-items: start;
}

.setup-stage,
.rail-panel {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 26px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.44), rgba(15, 23, 42, 0.2)),
    rgba(15, 23, 42, 0.18);
}

.setup-stage {
  padding: 28px;
}

.setup-intro {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: end;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.setup-kicker {
  margin: 0 0 10px;
  color: #fb923c;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.setup-intro h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.1;
  color: var(--text-color);
}

.setup-intro p:last-child {
  max-width: 31rem;
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.7;
}

.setting-section + .setting-section {
  margin-top: 28px;
  padding-top: 26px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.section-heading,
.rail-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  color: #fb923c;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.exam-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.exam-card,
.mode-row,
.pill-button,
.count-card {
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.16);
  color: inherit;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.exam-card {
  display: grid;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  text-align: left;
  cursor: pointer;
}

.exam-card:hover,
.mode-row:hover,
.count-card:hover {
  transform: translateY(-1px);
  border-color: rgba(249, 115, 22, 0.34);
}

.exam-card.active,
.mode-row.active,
.pill-button.active,
.count-card.active {
  border-color: rgba(249, 115, 22, 0.58);
  background:
    linear-gradient(180deg, rgba(249, 115, 22, 0.14), rgba(15, 23, 42, 0.2)),
    rgba(15, 23, 42, 0.18);
}

.exam-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.exam-icon {
  font-size: 1.4rem;
}

.exam-check {
  color: #fb923c;
}

.exam-card strong,
.mode-copy strong,
.summary-row strong,
.count-card strong {
  color: var(--text-color);
}

.exam-card span:last-child {
  color: var(--secondary-text);
  font-size: 0.8rem;
}

.mode-list {
  display: grid;
  gap: 12px;
}

.mode-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  padding: 16px 18px;
  border-radius: 20px;
  cursor: pointer;
  text-align: left;
}

.mode-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.mode-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(249, 115, 22, 0.14);
  color: #fb923c;
  flex-shrink: 0;
}

.mode-copy {
  min-width: 0;
}

.mode-copy p {
  margin: 6px 0 0;
  color: var(--secondary-text);
  line-height: 1.55;
  font-size: 0.9rem;
}

.mode-state {
  color: var(--secondary-text);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.setup-rail {
  position: sticky;
  top: 92px;
}

.rail-panel {
  padding: 22px;
}

.rail-panel--focus {
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.14), transparent 36%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.46), rgba(15, 23, 42, 0.24));
}

.rail-panel h3 {
  margin: 0 0 10px;
  font-size: 1.16rem;
  line-height: 1.45;
  color: var(--text-color);
}

.rail-panel > p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.65;
}

.control-group {
  margin-top: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 10px;
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill-button {
  flex: 1 1 calc(50% - 4px);
  min-width: 0;
  padding: 10px 12px;
  border-radius: 999px;
  cursor: pointer;
  color: var(--secondary-text);
}

.count-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.count-card {
  display: grid;
  gap: 6px;
  align-items: center;
  justify-items: start;
  padding: 14px 16px;
  border-radius: 18px;
  cursor: pointer;
}

.count-card span {
  color: var(--secondary-text);
  font-size: 0.82rem;
}

.summary-panel {
  display: grid;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.16);
}

.summary-row span {
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rail-note {
  margin-top: 18px !important;
  font-size: 0.88rem;
}

.start-button {
  margin-top: 18px;
  font-weight: 700;
}

@media (max-width: 1120px) {
  .setup-shell {
    grid-template-columns: 1fr;
  }

  .setup-rail {
    position: static;
    top: auto;
  }
}

@media (max-width: 768px) {
  .setup-stage,
  .rail-panel {
    border-radius: 20px;
  }

  .setup-stage {
    padding: 18px;
  }

  .setup-intro {
    flex-direction: column;
    align-items: start;
    gap: 12px;
    margin-bottom: 18px;
    padding-bottom: 18px;
  }

  .exam-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mode-row {
    flex-direction: column;
    align-items: start;
  }

  .mode-state {
    white-space: normal;
  }

  .rail-panel {
    padding: 18px;
  }

  :global(html[data-theme='light'] .setup-stage),
  :global(html[data-theme='light'] .rail-panel) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 16px 30px rgba(148, 163, 184, 0.1);
  }

  :global(html[data-theme='light'] .rail-panel--focus) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.14), transparent 36%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .setup-intro),
  :global(html[data-theme='light'] .setting-section + .setting-section),
  :global(html[data-theme='light'] .summary-panel) {
    border-color: rgba(226, 232, 240, 0.92);
  }

  :global(html[data-theme='light'] .exam-card),
  :global(html[data-theme='light'] .mode-row),
  :global(html[data-theme='light'] .pill-button),
  :global(html[data-theme='light'] .count-card),
  :global(html[data-theme='light'] .summary-row) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
    box-shadow: 0 8px 18px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .exam-card.active),
  :global(html[data-theme='light'] .mode-row.active),
  :global(html[data-theme='light'] .pill-button.active),
  :global(html[data-theme='light'] .count-card.active) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.98));
    border-color: rgba(251, 146, 60, 0.44);
  }
}

@media (max-width: 480px) {
  .exam-grid,
  .count-grid {
    grid-template-columns: 1fr;
  }

  .pill-button {
    flex-basis: 100%;
  }

  .summary-panel {
    gap: 8px;
  }

  .summary-row {
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: 14px;
  }

  .summary-row strong {
    min-width: 0;
    max-width: 58%;
    text-align: right;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
}

@media (min-width: 769px) {
  :global(html[data-theme='light'] .setup-stage),
  :global(html[data-theme='light'] .rail-panel) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 18px 40px rgba(148, 163, 184, 0.12);
  }

  :global(html[data-theme='light'] .rail-panel--focus) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.14), transparent 36%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .setup-intro),
  :global(html[data-theme='light'] .setting-section + .setting-section),
  :global(html[data-theme='light'] .summary-panel) {
    border-color: rgba(226, 232, 240, 0.92);
  }

  :global(html[data-theme='light'] .exam-card),
  :global(html[data-theme='light'] .mode-row),
  :global(html[data-theme='light'] .pill-button),
  :global(html[data-theme='light'] .count-card),
  :global(html[data-theme='light'] .summary-row) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
    box-shadow: 0 10px 24px rgba(148, 163, 184, 0.08);
  }

  :global(html[data-theme='light'] .exam-card.active),
  :global(html[data-theme='light'] .mode-row.active),
  :global(html[data-theme='light'] .pill-button.active),
  :global(html[data-theme='light'] .count-card.active) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.98));
    border-color: rgba(251, 146, 60, 0.44);
  }
}
</style>
