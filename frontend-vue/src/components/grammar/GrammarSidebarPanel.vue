<script setup>
import { computed } from 'vue'
import { NButton, NIcon, NProgress } from 'naive-ui'
import {
  BarChart3,
  CheckCircle2,
  HelpCircle,
  Settings,
  Sparkles,
  Flame,
  Play
} from 'lucide-vue-next'

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

const selectedTopicTitle = computed(
  () => props.grammarTopics.find(topic => topic.id === props.selectedTopic)?.title || '未选择主题'
)

const answeredCount = computed(
  () =>
    props.userAnswers.filter(answer => answer?.selected !== null && answer?.selected !== undefined)
      .length
)

const selectedModeTitle = computed(
  () => props.practiceModes.find(mode => mode.id === props.selectedMode)?.title || '未选择'
)

const selectedDifficultyTitle = computed(
  () => props.difficulties.find(level => level.id === props.selectedDifficulty)?.title || '未选择'
)
</script>

<template>
  <div class="sidebar-shell">
    <section class="rail-block rail-block--status">
      <div class="status-top-accent"></div>
      <div class="section-heading">
        <n-icon :component="BarChart3" />
        <span>学习状态追踪</span>
      </div>

      <div class="status-head">
        <div>
          <h3>
            今日特训 <strong>{{ props.stats.timeSpentToday }}</strong> 分钟
          </h3>
          <p>掌握度根据作答正确率实时动态推演计算。</p>
        </div>
        <div class="level-chip">
          <Flame :size="14" class="chip-flame" />
          <span>Lv. {{ props.stats.grammarLevel }}</span>
        </div>
      </div>

      <div class="mastery-panel">
        <div class="mastery-row">
          <span>语法掌握度</span>
          <strong>{{ props.stats.grammarMastery }}%</strong>
        </div>
        <n-progress
          type="line"
          :percentage="props.stats.grammarMastery"
          :height="8"
          color="#f97316"
          rail-color="rgba(255, 255, 255, 0.08)"
          :show-indicator="false"
          border-radius="999"
        />
      </div>

      <div class="metric-grid">
        <div class="metric-item">
          <span>累计答题</span>
          <strong>{{ props.stats.totalQuestions }} <small>题</small></strong>
        </div>
        <div class="metric-item">
          <span>平均正确率</span>
          <strong>{{ props.stats.averageAccuracy }}%</strong>
        </div>
      </div>
    </section>

    <section v-if="!props.isStarted" class="rail-block rail-block--config">
      <div class="section-heading config">
        <n-icon :component="Settings" />
        <span>特训配置方案</span>
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
        <div class="mode-list">
          <button
            v-for="mode in props.practiceModes"
            :key="mode.id"
            type="button"
            class="mode-row"
            :class="{ active: props.selectedMode === mode.id }"
            @click="emit('select-mode', mode.id)"
          >
            <div class="mode-row-main">
              <n-icon :component="mode.icon" :color="mode.color" size="18" />
              <span>{{ mode.title }}</span>
            </div>
            <small>{{ mode.desc }}</small>
            <span v-if="props.selectedMode === mode.id" class="mode-active-dot"></span>
          </button>
        </div>
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
        size="large"
        class="action-btn glow-btn"
        :loading="props.isLoading"
        @click="emit('start-practice')"
      >
        <template #icon>
          <Play :size="18" />
        </template>
        开始语法特训
      </n-button>
    </section>

    <section v-else class="rail-block rail-block--active">
      <div class="section-heading">
        <n-icon :component="HelpCircle" />
        <span>实时作答进度</span>
      </div>

      <div class="summary-stack">
        <div class="summary-row">
          <span>主题</span>
          <strong>{{ selectedTopicTitle }}</strong>
        </div>
        <div class="summary-row">
          <span>进度</span>
          <strong>{{ answeredCount }} / {{ props.totalQuestions }}</strong>
        </div>
        <div class="summary-row">
          <span>状态</span>
          <strong :class="props.isSubmitted ? 'status-done' : 'status-ongoing'">
            {{ props.isSubmitted ? '已提交批改' : '答题中' }}
          </strong>
        </div>
      </div>

      <n-button
        v-if="!props.isSubmitted && !props.showResult"
        block
        type="primary"
        class="action-btn glow-btn action-btn--submit"
        @click="emit('submit-practice')"
      >
        <template #icon>
          <Sparkles :size="18" />
        </template>
        提交批改答卷
      </n-button>

      <div class="nav-wrap">
        <div class="nav-header">
          <span>题号导航</span>
          <small>点击直达任意题目</small>
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
              size="15"
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
  gap: 18px;
}

.rail-block {
  position: relative;
  overflow: hidden;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.status-top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f97316;
}

.section-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--tone-orange);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading.config {
  color: var(--tone-emerald);
}

.status-head {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.status-head h3 {
  margin: 0 0 6px;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-color);
}

.status-head h3 strong {
  color: var(--tone-orange);
  font-size: 1.25rem;
  font-weight: 900;
}

.status-head p {
  margin: 0;
  color: var(--secondary-text);
  line-height: 1.55;
  font-size: 0.82rem;
}

.level-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(251, 191, 36, 0.35);
  background: rgba(251, 191, 36, 0.12);
  color: var(--tone-amber);
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
}

.chip-flame {
  color: var(--tone-orange);
}

.mastery-panel {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
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
.control-group label {
  color: var(--secondary-text);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mastery-row strong {
  color: var(--tone-orange);
  font-size: 1.15rem;
  font-weight: 900;
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
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
}

.metric-item {
  display: grid;
  gap: 4px;
}

.metric-item strong,
.summary-row strong {
  color: var(--text-color);
  font-size: 1.15rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.metric-item strong small {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--secondary-text);
  margin-left: 2px;
}

.summary-stack {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.status-done {
  color: var(--tone-emerald) !important;
}

.status-ongoing {
  color: var(--brand) !important;
}

.control-group {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.mode-list {
  display: grid;
  gap: 8px;
}

.mode-row {
  position: relative;
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.025);
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.mode-row:hover {
  transform: translateY(-1px);
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(255, 255, 255, 0.05);
}

.mode-row.active {
  border-color: rgba(249, 115, 22, 0.6);
  background: transparent;
}

.mode-row-main {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-color);
  font-weight: 800;
  font-size: 0.94rem;
}

.mode-row small {
  color: var(--secondary-text);
  font-size: 0.8rem;
  line-height: 1.45;
}

.mode-active-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f97316;
}

.difficulty-row {
  display: flex;
  gap: 8px;
}

.difficulty-chip {
  flex: 1;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  color: var(--secondary-text);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.difficulty-chip:hover {
  border-color: rgba(249, 115, 22, 0.35);
  color: var(--text-color);
}

.difficulty-chip.active {
  border-color: rgba(249, 115, 22, 0.6);
  background: rgba(249, 115, 22, 0.14);
  color: var(--tone-orange);
}

.action-btn {
  font-weight: 800;
  height: 46px;
  border-radius: var(--radius-lg);
  border: none;
}

.glow-btn {
  background: #f97316 !important;
  color: #40200a !important;
  transition: all 0.25s ease;
}

.glow-btn:hover {
  transform: translateY(-2px);
}

.action-btn--submit {
  margin-bottom: 20px;
}

/* ================== 题号导航 (Nav Grid) ================== */
.nav-wrap {
  display: grid;
  gap: 12px;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-color);
  font-size: 0.85rem;
  font-weight: 800;
}

.nav-header small {
  color: var(--secondary-text);
  font-size: 0.75rem;
  font-weight: 500;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.nav-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--secondary-text);
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-item:hover {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(255, 255, 255, 0.06);
}

.nav-item.active {
  border-color: var(--tone-orange);
  background: rgba(249, 115, 22, 0.14);
  color: var(--tone-orange);
}

.nav-item.answered {
  border-color: rgba(30, 107, 82, 0.4);
  background: rgba(30, 107, 82, 0.1);
  color: var(--brand);
}

.nav-item.is-correct {
  border-color: rgba(52, 211, 153, 0.5);
  background: rgba(52, 211, 153, 0.14);
  color: var(--tone-emerald);
}

.nav-item.is-wrong {
  border-color: rgba(248, 113, 113, 0.5);
  background: rgba(248, 113, 113, 0.14);
  color: var(--tone-red);
}

/* ================== 浅色模式适配 (Light Theme) ================== */
html[data-theme='light'] .rail-block {
  border-color: rgba(148, 163, 184, 0.18);
}

html[data-theme='light'] .status-head h3,
html[data-theme='light'] .mode-row-main,
html[data-theme='light'] .metric-item strong,
html[data-theme='light'] .summary-row strong,
html[data-theme='light'] .nav-header {
  color: var(--text-color);
}

html[data-theme='light'] .status-head p,
html[data-theme='light'] .mode-row small {
  color: var(--secondary-text);
}

html[data-theme='light'] .mastery-panel,
html[data-theme='light'] .metric-item,
html[data-theme='light'] .summary-row,
html[data-theme='light'] .mode-row,
html[data-theme='light'] .difficulty-chip,
html[data-theme='light'] .nav-item {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.92);
}

html[data-theme='light'] .mode-row:hover,
html[data-theme='light'] .difficulty-chip:hover {
  background: #ffffff;
  border-color: rgba(249, 115, 22, 0.35);
}

html[data-theme='light'] .mode-row.active {
  background: rgba(255, 237, 213, 0.8);
  border-color: rgba(249, 115, 22, 0.55);
}

html[data-theme='light'] .difficulty-chip.active {
  background: rgba(255, 237, 213, 0.9);
  border-color: rgba(249, 115, 22, 0.55);
  color: var(--tone-orange);
}
</style>
