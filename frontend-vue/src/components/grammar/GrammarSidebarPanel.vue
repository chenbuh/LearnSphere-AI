<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NProgress } from 'naive-ui'
import { BarChart3, CheckCircle2, HelpCircle, Settings } from 'lucide-vue-next'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({
      timeSpentToday: 0,
      grammarMastery: 0,
      grammarLevel: 1,
      totalQuestions: 0,
      averageAccuracy: 0
    })
  },
  isStarted: {
    type: Boolean,
    default: false
  },
  showResult: {
    type: Boolean,
    default: false
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  selectedTopic: {
    type: Number,
    default: 0
  },
  grammarTopics: {
    type: Array,
    default: () => []
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  userAnswers: {
    type: Array,
    default: () => []
  },
  practiceModes: {
    type: Array,
    default: () => []
  },
  selectedMode: {
    type: String,
    default: ''
  },
  difficulties: {
    type: Array,
    default: () => []
  },
  selectedDifficulty: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'select-mode',
  'select-difficulty',
  'start-practice',
  'submit-practice',
  'go-to-question'
])

const selectedTopicTitle = computed(() => (
  props.grammarTopics.find(topic => topic.id === props.selectedTopic)?.title || '未选择主题'
))

const answeredCount = computed(() => (
  props.userAnswers.filter(answer => answer?.selected !== null && answer?.selected !== undefined).length
))

const selectedModeTitle = computed(() => (
  props.practiceModes.find(mode => mode.id === props.selectedMode)?.title || '未选择'
))

const selectedDifficultyTitle = computed(() => (
  props.difficulties.find(level => level.id === props.selectedDifficulty)?.title || '未选择'
))
</script>

<template>
  <div class="sidebar-shell">
    <section class="rail-block rail-block--status">
      <div class="section-heading">
        <n-icon :component="BarChart3" />
        <span>学习状态</span>
      </div>

      <div class="status-head">
        <div>
          <h3>今天已经练习 {{ props.stats.timeSpentToday }} 分钟</h3>
          <p>随时查看掌握度、练习进度和快捷操作。</p>
        </div>
        <div class="level-chip">Lv. {{ props.stats.grammarLevel }}</div>
      </div>

      <div class="mastery-panel">
        <div class="mastery-row">
          <span>语法掌握度</span>
          <strong>{{ props.stats.grammarMastery }}%</strong>
        </div>
        <n-progress
          type="line"
          :percentage="props.stats.grammarMastery"
          :height="7"
          color="#f97316"
          rail-color="rgba(148, 163, 184, 0.16)"
          :show-indicator="false"
        />
      </div>

      <div class="metric-grid">
        <div class="metric-item">
          <span>累计答题</span>
          <strong>{{ props.stats.totalQuestions }}</strong>
        </div>
        <div class="metric-item">
          <span>平均正确率</span>
          <strong>{{ props.stats.averageAccuracy }}%</strong>
        </div>
      </div>
    </section>

    <section v-if="!props.isStarted" class="rail-block">
      <div class="section-heading">
        <n-icon :component="Settings" />
        <span>练习配置</span>
      </div>

      <div class="summary-stack">
        <div class="summary-row">
          <span>当前主题</span>
          <strong>{{ selectedTopicTitle }}</strong>
        </div>
        <div class="summary-row">
          <span>模式</span>
          <strong>{{ selectedModeTitle }}</strong>
        </div>
        <div class="summary-row">
          <span>难度</span>
          <strong>{{ selectedDifficultyTitle }}</strong>
        </div>
      </div>

      <div class="control-group">
        <label>模式选择</label>
        <button
          v-for="mode in props.practiceModes"
          :key="mode.id"
          type="button"
          class="mode-row"
          :class="{ active: props.selectedMode === mode.id }"
          @click="emit('select-mode', mode.id)"
        >
          <div class="mode-row-main">
            <n-icon :component="mode.icon" :color="mode.color" />
            <span>{{ mode.title }}</span>
          </div>
          <small>{{ mode.desc }}</small>
        </button>
      </div>

      <div class="control-group">
        <label>难度设定</label>
        <div class="difficulty-row">
          <button
            v-for="diff in props.difficulties"
            :key="diff.id"
            type="button"
            class="difficulty-chip"
            :class="{ active: props.selectedDifficulty === diff.id }"
            @click="emit('select-difficulty', diff.id)"
          >
            {{ diff.title }}
          </button>
        </div>
      </div>

      <n-button
        block
        type="primary"
        color="#f97316"
        size="large"
        class="action-btn"
        :loading="props.isLoading"
        @click="emit('start-practice')"
      >
        开始练习
      </n-button>
    </section>

    <section v-else class="rail-block">
      <div class="section-heading">
        <n-icon :component="HelpCircle" />
        <span>当前任务</span>
      </div>

      <div class="summary-stack">
        <div class="summary-row">
          <span>主题</span>
          <strong>{{ selectedTopicTitle }}</strong>
        </div>
        <div class="summary-row">
          <span>进度</span>
          <strong>{{ answeredCount }}/{{ props.totalQuestions }}</strong>
        </div>
        <div class="summary-row">
          <span>状态</span>
          <strong>{{ props.isSubmitted ? '已提交' : '答题中' }}</strong>
        </div>
      </div>

      <n-button
        v-if="!props.isSubmitted && !props.showResult"
        block
        type="primary"
        color="#f97316"
        class="action-btn action-btn--submit"
        @click="emit('submit-practice')"
      >
        提交批改
      </n-button>

      <div class="nav-wrap">
        <div class="nav-header">
          <span>题号导航</span>
          <small>可直接跳转</small>
        </div>
        <div class="nav-grid">
          <button
            v-for="n in props.totalQuestions"
            :key="n"
            type="button"
            class="nav-item"
            :class="{
              active: n - 1 === props.currentQuestionIndex,
              answered: props.userAnswers[n - 1]?.selected !== null,
              'is-correct': props.isSubmitted && props.userAnswers[n - 1]?.correct === true,
              'is-wrong': props.isSubmitted && props.userAnswers[n - 1]?.correct === false
            }"
            @click="emit('go-to-question', n - 1)"
          >
            <n-icon
              v-if="props.isSubmitted && props.userAnswers[n - 1]?.correct === true"
              :component="CheckCircle2"
              size="14"
            />
            <span v-else>{{ n }}</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sidebar-shell {
  display: grid;
  gap: 16px;
}

.rail-block {
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(15, 23, 42, 0.2)),
    rgba(15, 23, 42, 0.18);
}

.rail-block--status {
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.14), transparent 36%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.46), rgba(15, 23, 42, 0.24));
}

.section-heading {
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

.status-head {
  display: flex;
  gap: 12px;
  align-items: start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.status-head h3 {
  margin: 0 0 8px;
  font-size: 1.05rem;
  color: var(--text-color);
}

.status-head p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.6;
  font-size: 0.9rem;
}

.level-chip {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.12);
  color: #fdba74;
  font-weight: 700;
  white-space: nowrap;
}

.mastery-panel {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.16);
}

.mastery-row,
.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mastery-row {
  margin-bottom: 10px;
}

.mastery-row span,
.summary-row span,
.metric-item span,
.nav-header small,
.control-group label {
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mastery-row strong,
.summary-row strong,
.metric-item strong,
.nav-header span {
  color: var(--text-color);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.metric-item,
.summary-row {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(15, 23, 42, 0.16);
}

.metric-item {
  display: grid;
  gap: 4px;
}

.metric-item strong {
  font-size: 1rem;
}

.summary-stack {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.control-group {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
}

.mode-row {
  display: grid;
  gap: 6px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.16);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.mode-row:hover {
  transform: translateY(-1px);
  border-color: rgba(249, 115, 22, 0.28);
}

.mode-row.active {
  border-color: rgba(249, 115, 22, 0.55);
  background: rgba(249, 115, 22, 0.1);
}

.mode-row-main {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
  font-weight: 700;
}

.mode-row small {
  color: var(--secondary-text);
  line-height: 1.45;
}

.difficulty-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.difficulty-chip {
  flex: 1 1 calc(50% - 4px);
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.16);
  color: var(--secondary-text);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.difficulty-chip.active {
  border-color: rgba(249, 115, 22, 0.55);
  background: rgba(249, 115, 22, 0.12);
  color: var(--text-color);
}

.action-btn {
  font-weight: 700;
}

.action-btn--submit {
  margin-bottom: 16px;
}

.nav-wrap {
  padding-top: 2px;
}

.nav-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.nav-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.16);
  color: var(--secondary-text);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.nav-item:hover {
  transform: translateY(-1px);
  border-color: rgba(249, 115, 22, 0.28);
  color: var(--text-color);
}

.nav-item.active {
  border-color: rgba(249, 115, 22, 0.65);
  background: rgba(249, 115, 22, 0.12);
  color: var(--text-color);
}

.nav-item.answered {
  background: rgba(148, 163, 184, 0.14);
  color: var(--text-color);
}

.nav-item.is-correct {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.18);
  color: #86efac;
}

.nav-item.is-wrong {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.18);
  color: #fca5a5;
}

:global(html[data-theme='light'] .rail-block) {
  border-color: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    radial-gradient(circle at top right, rgba(251, 146, 60, 0.08), transparent 42%);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .rail-block--status) {
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.12), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
}

:global(html[data-theme='light'] .mastery-panel),
:global(html[data-theme='light'] .metric-item),
:global(html[data-theme='light'] .summary-row),
:global(html[data-theme='light'] .mode-row),
:global(html[data-theme='light'] .difficulty-chip),
:global(html[data-theme='light'] .nav-item) {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.84);
}

:global(html[data-theme='light'] .mode-row.active),
:global(html[data-theme='light'] .difficulty-chip.active),
:global(html[data-theme='light'] .nav-item.active) {
  background: rgba(255, 237, 213, 0.84);
}

:global(html[data-theme='light'] .nav-item.answered) {
  background: rgba(226, 232, 240, 0.72);
}

@media (max-width: 768px) {
  .rail-block {
    padding: 16px;
    border-radius: 18px;
  }

  .status-head {
    flex-direction: column;
  }

  .level-chip {
    align-self: start;
  }

  .difficulty-chip {
    flex-basis: calc(50% - 4px);
  }

  .nav-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 6px;
  }

  :global(html[data-theme='light'] .rail-block) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 16px 30px rgba(148, 163, 184, 0.1);
  }

  :global(html[data-theme='light'] .rail-block--status) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.14), transparent 38%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .mastery-panel),
  :global(html[data-theme='light'] .metric-item),
  :global(html[data-theme='light'] .summary-row),
  :global(html[data-theme='light'] .mode-row),
  :global(html[data-theme='light'] .difficulty-chip),
  :global(html[data-theme='light'] .nav-item) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
    color: #475569;
  }

  :global(html[data-theme='light'] .mode-row.active),
  :global(html[data-theme='light'] .difficulty-chip.active),
  :global(html[data-theme='light'] .nav-item.active) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.98));
    border-color: rgba(251, 146, 60, 0.44);
    color: #0f172a;
  }

  :global(html[data-theme='light'] .nav-item.answered) {
    background: rgba(241, 245, 249, 0.98);
    color: #0f172a;
  }

  :global(html[data-theme='light'] .nav-item.is-correct) {
    background: rgba(220, 252, 231, 0.95);
    color: #166534;
    border-color: rgba(34, 197, 94, 0.32);
  }

  :global(html[data-theme='light'] .nav-item.is-wrong) {
    background: rgba(254, 226, 226, 0.95);
    color: #b91c1c;
    border-color: rgba(239, 68, 68, 0.28);
  }
}

@media (min-width: 769px) {
  :global(html[data-theme='light'] .rail-block) {
    border-color: rgba(203, 213, 225, 0.82);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96)),
      #ffffff;
    box-shadow: 0 18px 40px rgba(148, 163, 184, 0.12);
  }

  :global(html[data-theme='light'] .rail-block--status) {
    background:
      radial-gradient(circle at top right, rgba(251, 146, 60, 0.16), transparent 38%),
      linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 255, 255, 0.96));
  }

  :global(html[data-theme='light'] .metric-item),
  :global(html[data-theme='light'] .summary-row),
  :global(html[data-theme='light'] .mode-row),
  :global(html[data-theme='light'] .difficulty-chip),
  :global(html[data-theme='light'] .nav-item) {
    border-color: rgba(203, 213, 225, 0.78);
    background: rgba(248, 250, 252, 0.95);
    color: #475569;
  }

  :global(html[data-theme='light'] .mode-row:hover),
  :global(html[data-theme='light'] .difficulty-chip:hover),
  :global(html[data-theme='light'] .nav-item:hover) {
    background: rgba(255, 247, 237, 0.96);
    border-color: rgba(251, 146, 60, 0.34);
  }

  :global(html[data-theme='light'] .mode-row.active),
  :global(html[data-theme='light'] .difficulty-chip.active),
  :global(html[data-theme='light'] .nav-item.active) {
    background: linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 255, 255, 0.98));
    border-color: rgba(251, 146, 60, 0.44);
    color: #0f172a;
  }

  :global(html[data-theme='light'] .nav-item.answered) {
    background: rgba(241, 245, 249, 0.98);
    color: #0f172a;
  }

  :global(html[data-theme='light'] .nav-item.is-correct) {
    background: rgba(220, 252, 231, 0.95);
    color: #166534;
    border-color: rgba(34, 197, 94, 0.32);
  }

  :global(html[data-theme='light'] .nav-item.is-wrong) {
    background: rgba(254, 226, 226, 0.95);
    color: #b91c1c;
    border-color: rgba(239, 68, 68, 0.28);
  }
}
</style>

