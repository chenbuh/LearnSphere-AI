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
        <div class="intro-left">
          <span class="setup-kicker">
            <span class="kicker-dot"></span>
            测试设置
          </span>
          <h2>先定词库和题型，再开始本次词汇测试</h2>
          <p class="intro-desc">选好词库、题型、难度和题量后即可一键生成针对性模拟测试试卷。</p>
        </div>
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
              <div v-if="props.settings.examType === exam.value" class="exam-check-badge">
                <n-icon :component="CheckCircle2" />
              </div>
            </div>
            <strong>{{ exam.label }}</strong>
            <span class="exam-status-text">{{ props.settings.examType === exam.value ? '已选中词库' : '点击切换' }}</span>
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
        <p>确认设置后即可开始实时生成题目。</p>

        <div class="control-group">
          <label>难度级别</label>
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
          <label>测试题量</label>
          <div class="count-grid">
            <button
              v-for="count in props.counts"
              :key="count"
              type="button"
              class="count-card"
              :class="{ active: props.settings.count === count }"
              @click="emit('update-setting', 'count', count)"
            >
              <n-icon :component="Hash" class="hash-icon" />
              <strong>{{ count }}</strong>
              <span>题</span>
            </button>
          </div>
        </div>

        <div class="summary-panel">
          <div class="summary-row">
            <span>目标词库</span>
            <strong>{{ selectedExamLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>作答题型</span>
            <strong>{{ selectedModeLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>测试难度</span>
            <strong>{{ selectedDifficultyLabel }}</strong>
          </div>
          <div class="summary-row">
            <span>题目数量</span>
            <strong>{{ props.settings.count }} 题</strong>
          </div>
        </div>

        <p class="rail-note">
          开始后系统将为您即时抽题，支持随时跳题与交卷。
        </p>

        <n-button
          block
          type="primary"
          size="large"
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
  grid-template-columns: minmax(0, 1.16fr) minmax(320px, 0.84fr);
  gap: 24px;
  align-items: start;
}

.setup-stage,
.rail-panel {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.setup-stage {
  padding: 28px;
}

.setup-intro {
  margin-bottom: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.intro-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setup-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 3px 9px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: var(--tone-amber);
  font-size: 0.74rem;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  width: fit-content;
}

.kicker-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #f59e0b;
}

.setup-intro h2 {
  margin: 0;
  font-size: clamp(1.4rem, 2vw, 1.85rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--text-color);
}

.intro-desc {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.92rem;
  line-height: 1.6;
}

.setting-section + .setting-section {
  margin-top: 28px;
  padding-top: 26px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.section-heading,
.rail-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--tone-amber);
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

.exam-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.32);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.exam-card:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.35);
  background: rgba(30, 41, 59, 0.5);
}

.exam-card.active {
  border-color: rgba(30, 107, 82, 0.55);
  background: var(--card-bg);
}

.exam-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.exam-icon {
  font-size: 1.35rem;
  line-height: 1;
}

.exam-check-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--brand);
}

.exam-card strong {
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 750;
}

.exam-status-text {
  color: var(--secondary-text);
  font-size: 0.78rem;
  font-weight: 500;
}

.exam-card.active .exam-status-text {
  color: var(--brand);
  font-weight: 600;
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
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.32);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-row:hover {
  transform: translateY(-2px);
  border-color: rgba(30, 107, 82, 0.35);
  background: rgba(30, 41, 59, 0.5);
}

.mode-row.active {
  border-color: rgba(30, 107, 82, 0.55);
  background: var(--card-bg);
  border-left: 3px solid #5fa88b;
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
  width: 42px;
  height: 42px;
  border-radius: var(--radius-lg);
  background: rgba(30, 107, 82, 0.16);
  border: 1px solid rgba(30, 107, 82, 0.3);
  color: #8cc3ad;
  flex-shrink: 0;
}

.mode-copy strong {
  color: var(--text-color);
  font-size: 1.05rem;
  font-weight: 750;
}

.mode-copy p {
  margin: 4px 0 0;
  color: var(--secondary-text);
  line-height: 1.5;
  font-size: 0.88rem;
}

.mode-state {
  color: var(--secondary-text);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.mode-row.active .mode-state {
  color: var(--brand);
}

.setup-rail {
  position: sticky;
  top: 92px;
}

.rail-panel {
  padding: 24px;
}

.rail-panel--focus {
  background: var(--card-bg);
}

.rail-panel h3 {
  margin: 0 0 8px;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.35;
  color: var(--text-color);
}

.rail-panel > p {
  margin: 0;
  color: var(--secondary-text);
  font-size: 0.88rem;
  line-height: 1.55;
}

.control-group {
  margin-top: 22px;
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
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.4);
  color: var(--secondary-text);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-button:hover {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(30, 107, 82, 0.3);
  color: var(--text-color);
}

.pill-button.active {
  background: var(--card-bg);
  border-color: rgba(95, 168, 139, 0.5);
  color: var(--text-color);
}

.count-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.count-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.35);
  color: var(--secondary-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.count-card .hash-icon {
  color: var(--secondary-text);
}

.count-card strong {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-color);
  font-variant-numeric: tabular-nums;
}

.count-card span {
  font-size: 0.82rem;
  color: var(--secondary-text);
}

.count-card:hover {
  transform: translateY(-1px);
  border-color: rgba(30, 107, 82, 0.3);
  background: rgba(30, 41, 59, 0.55);
}

.count-card.active {
  background: transparent;
  border-color: rgba(30, 107, 82, 0.55);
}

.count-card.active .hash-icon {
  color: var(--brand);
}

.summary-panel {
  display: grid;
  gap: 8px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(30, 41, 59, 0.3);
}

.summary-row span {
  color: var(--secondary-text);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.summary-row strong {
  color: var(--text-color);
  font-size: 0.95rem;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}

.rail-note {
  margin-top: 16px !important;
  color: var(--secondary-text);
  font-size: 0.84rem;
  line-height: 1.5;
}

.start-button {
  margin-top: 18px;
  font-weight: 750;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--brand) !important;
  transition: all 0.22s ease;
  /* 品牌实心底：必须用品牌前景色，否则继承正文色只有 ~2.5:1 */
  color: var(--brand-ink);
}

.start-button:hover {
  transform: translateY(-2px);
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
    border-radius: var(--radius-lg);
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

  html[data-theme='light'] .setup-stage,
  html[data-theme='light'] .rail-panel {
    border-color: rgba(203, 213, 225, 0.82);
  }

  html[data-theme='light'] .rail-panel--focus {
    background:
      radial-gradient(circle at top right, var(--tone-orange-soft), transparent 36%),
      var(--card-bg);
  }

  html[data-theme='light'] .setup-intro,
  html[data-theme='light'] .setting-section + .setting-section,
  html[data-theme='light'] .summary-panel {
    border-color: rgba(226, 232, 240, 0.92);
  }

  html[data-theme='light'] .exam-card,
  html[data-theme='light'] .mode-row,
  html[data-theme='light'] .pill-button,
  html[data-theme='light'] .count-card,
  html[data-theme='light'] .summary-row {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
  }

  html[data-theme='light'] .exam-card.active,
  html[data-theme='light'] .mode-row.active,
  html[data-theme='light'] .pill-button.active,
  html[data-theme='light'] .count-card.active {
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
    border-radius: var(--radius-lg);
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
  html[data-theme='light'] .setup-stage,
  html[data-theme='light'] .rail-panel {
    border-color: rgba(203, 213, 225, 0.82);
  }

  html[data-theme='light'] .rail-panel--focus {
    background:
      radial-gradient(circle at top right, var(--tone-orange-soft), transparent 36%),
      var(--card-bg);
  }

  html[data-theme='light'] .setup-intro,
  html[data-theme='light'] .setting-section + .setting-section,
  html[data-theme='light'] .summary-panel {
    border-color: rgba(226, 232, 240, 0.92);
  }

  html[data-theme='light'] .exam-card,
  html[data-theme='light'] .mode-row,
  html[data-theme='light'] .pill-button,
  html[data-theme='light'] .count-card,
  html[data-theme='light'] .summary-row {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
  }

  html[data-theme='light'] .exam-card.active,
  html[data-theme='light'] .mode-row.active,
  html[data-theme='light'] .pill-button.active,
  html[data-theme='light'] .count-card.active {
    border-color: rgba(251, 146, 60, 0.44);
  }
}
</style>
