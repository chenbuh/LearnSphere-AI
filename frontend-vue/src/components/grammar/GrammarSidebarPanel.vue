<script setup>
import { computed } from 'vue'
import { NButton, NCard, NProgress } from 'naive-ui'
import { BarChart3, HelpCircle, Settings } from 'lucide-vue-next'

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

const selectedTopicTitle = computed(() => {
  return props.grammarTopics.find(topic => topic.id === props.selectedTopic)?.title || '-'
})
</script>

<template>
  <div class="sidebar-panel-inner">
    <n-card class="sidebar-card user-stats" :bordered="false" size="small">
      <div class="widget-header">
        <div class="icon-wrap purple">
          <n-icon :component="BarChart3" />
        </div>
        <div>
          <h3>学习状态</h3>
          <p>今日已练习 {{ props.stats.timeSpentToday }} 分钟</p>
        </div>
      </div>
      <div class="stats-body">
        <div class="progress-section">
          <div class="labels">
            <span>语法掌握度</span>
            <span>Level {{ props.stats.grammarLevel }}</span>
          </div>
          <n-progress type="line" :percentage="props.stats.grammarMastery" :height="6" color="#d946ef" rail-color="rgba(255,255,255,0.1)" :show-indicator="false" />
        </div>
        <div class="mini-stats">
          <div class="mini-stat">
            <div class="num">{{ props.stats.totalQuestions }}</div>
            <div class="lbl">累计答题</div>
          </div>
          <div class="mini-stat">
            <div class="num success">{{ props.stats.averageAccuracy }}%</div>
            <div class="lbl">平均正确率</div>
          </div>
        </div>
      </div>
    </n-card>

    <n-card v-if="!props.isStarted" class="sidebar-card config-panel" :bordered="false" size="small">
      <h3>
        <n-icon :component="Settings" class="title-icon" />
        练习配置
      </h3>

      <div class="config-group">
        <label>模式选择</label>
        <div class="mode-list">
          <div
            v-for="mode in props.practiceModes"
            :key="mode.id"
            class="mode-item"
            :class="{ active: props.selectedMode === mode.id }"
            @click="emit('select-mode', mode.id)"
          >
            <n-icon :component="mode.icon" :color="mode.color" />
            <span>{{ mode.title }}</span>
            <div v-if="props.selectedMode === mode.id" class="radio-dot"></div>
          </div>
        </div>
      </div>

      <div class="config-group">
        <label>难度设定</label>
        <div class="diff-tabs">
          <div
            v-for="diff in props.difficulties"
            :key="diff.id"
            class="diff-tab"
            :class="{ active: props.selectedDifficulty === diff.id }"
            @click="emit('select-difficulty', diff.id)"
          >
            {{ diff.title }}
          </div>
        </div>
      </div>

      <n-button
        block
        type="primary"
        color="#db2777"
        size="large"
        class="start-btn"
        :loading="props.isLoading"
        @click="emit('start-practice')"
      >
        开始练习
      </n-button>
    </n-card>

    <n-card v-else class="sidebar-card current-task" :bordered="false" size="small">
      <div class="sidebar-title-row">
        <h3>
          <n-icon :component="HelpCircle" class="title-icon" />
          当前任务
        </h3>
        <n-button v-if="!props.isSubmitted && !props.showResult" size="tiny" type="primary" color="#db2777" @click="emit('submit-practice')">
          提交批改
        </n-button>
      </div>
      <div class="task-info">
        <div class="info-box">
          <span class="lbl">正在攻克知识点</span>
          <span class="val">{{ selectedTopicTitle }}</span>
        </div>

        <div class="question-nav">
          <span class="lbl">本组题目</span>
          <div class="nav-grid">
            <div
              v-for="n in props.totalQuestions"
              :key="n"
              class="nav-item"
              :class="{
                active: n - 1 === props.currentQuestionIndex,
                answered: props.userAnswers[n - 1]?.selected !== null,
                'is-correct': props.isSubmitted && props.userAnswers[n - 1]?.correct === true,
                'is-wrong': props.isSubmitted && props.userAnswers[n - 1]?.correct === false
              }"
              @click="emit('go-to-question', n - 1)"
            >
              {{ n }}
            </div>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<style scoped>
.sidebar-panel-inner {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--card-border);
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.icon-wrap {
  padding: 8px;
  border-radius: 8px;
  background: var(--accent-fill);
}

.icon-wrap.purple {
  color: #d946ef;
  background: rgba(217, 70, 239, 0.1);
}

.widget-header h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

.widget-header p {
  font-size: 0.8rem;
  color: #a1a1aa;
  margin: 0;
}

.labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #a1a1aa;
  margin-bottom: 4px;
}

.mini-stats {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.mini-stat {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.mini-stat .num {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.mini-stat .num.success {
  color: #4ade80;
}

.mini-stat .lbl {
  font-size: 0.7rem;
  color: #71717a;
  text-transform: uppercase;
}

.config-panel h3,
.current-task h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: var(--text-color);
}

.sidebar-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.config-group {
  margin-bottom: 24px;
}

.config-group label {
  display: block;
  font-size: 0.75rem;
  color: var(--secondary-text);
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.mode-item {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-color);
  transition: var(--theme-transition);
  margin-bottom: 8px;
}

.mode-item:hover {
  background: var(--accent-fill);
}

.mode-item.active {
  background: var(--accent-fill);
  border-color: rgba(99, 102, 241, 0.4);
}

.radio-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #db2777;
  margin-left: auto;
}

.diff-tabs {
  display: flex;
  gap: 8px;
}

.diff-tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--secondary-text);
  border: 1px solid transparent;
  transition: var(--theme-transition);
}

.diff-tab:hover {
  background: var(--accent-fill);
}

.diff-tab.active {
  background: var(--accent-fill);
  border-color: rgba(99, 102, 241, 0.4);
  color: var(--text-color);
}

.start-btn {
  font-weight: 700;
  margin-top: 16px;
}

.info-box {
  background: var(--accent-fill);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--card-border);
  margin-bottom: 16px;
}

.info-box .lbl {
  display: block;
  font-size: 0.75rem;
  color: var(--secondary-text);
  margin-bottom: 4px;
}

.info-box .val {
  font-size: 1rem;
  color: var(--text-color);
  font-weight: 700;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.nav-item {
  aspect-ratio: 1;
  border-radius: 6px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--secondary-text);
  cursor: pointer;
  transition: var(--theme-transition);
}

.nav-item:hover {
  background: var(--accent-fill);
  color: var(--text-color);
}

.nav-item.active {
  border: 2px solid #db2777;
  color: var(--text-color);
  z-index: 1;
}

.nav-item.answered {
  background: var(--accent-fill);
  color: var(--text-color);
}

.nav-item.is-correct {
  background: rgba(34, 197, 94, 0.4) !important;
  color: #fff;
  border: none;
}

.nav-item.is-wrong {
  background: rgba(239, 68, 68, 0.4) !important;
  color: #fff;
  border: none;
}

@media (max-width: 768px) {
  .config-panel {
    padding: 12px !important;
  }

  .config-group {
    margin-bottom: 12px !important;
  }

  .current-task {
    padding: 12px !important;
  }

  .nav-grid {
    grid-template-columns: repeat(6, 1fr) !important;
    gap: 6px !important;
  }

  .nav-item {
    font-size: 0.75rem !important;
    padding: 4px !important;
  }
}
</style>
