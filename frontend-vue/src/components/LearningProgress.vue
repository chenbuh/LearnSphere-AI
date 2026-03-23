<template>
  <div class="learning-progress" :class="{ embedded }">
    <header v-if="!embedded" class="progress-header">
      <div class="header-copy">
        <div class="title-row">
          <n-icon :component="Target" size="16" color="#6366f1" />
          <span>任务清单</span>
        </div>
        <p>{{ statusDescription }}</p>
      </div>

      <n-tag size="small" round :type="goalStatus.type">
        {{ goalStatus.text }}
      </n-tag>
    </header>

    <section class="progress-summary">
      <div class="summary-ring">
        <strong>{{ progressPercentage }}%</strong>
        <span>完成度</span>
      </div>

      <div class="summary-stats">
        <article class="summary-stat">
          <small>本次学习</small>
          <strong>{{ formatTime(sessionTime) }}</strong>
        </article>
        <article class="summary-stat">
          <small>连续学习</small>
          <strong>{{ streak }} 天</strong>
        </article>
        <article class="summary-stat">
          <small>累计经验</small>
          <strong>{{ totalXP }}</strong>
        </article>
      </div>
    </section>

    <div class="task-list">
      <transition-group name="goal-item">
        <article
          v-for="(goal, index) in displayGoals"
          :key="goal.id || index"
          :class="['task-item', { completed: goal.completed }]"
        >
          <div class="task-marker">
            <n-icon
              v-if="goal.completed"
              :component="CheckCircle"
              size="18"
              color="#10b981"
            />
            <div v-else class="task-dot"></div>
          </div>

          <div class="task-main">
            <div class="task-title-row">
              <strong>{{ goal.title }}</strong>
              <span>{{ Math.round(goal.progress || 0) }}%</span>
            </div>

            <p>{{ goal.description }}</p>

            <n-progress
              type="line"
              :percentage="Math.round(goal.progress || 0)"
              :show-indicator="false"
              :height="5"
              :rail-color="goal.completed ? 'rgba(16, 185, 129, 0.16)' : 'rgba(148, 163, 184, 0.18)'"
              :color="goal.completed ? '#10b981' : '#6366f1'"
            />

            <div class="task-meta">
              <span>{{ goal.completed ? '已完成' : '进行中' }}</span>
              <span v-if="goal.reward">+{{ goal.reward.xp }} 经验</span>
            </div>
          </div>
        </article>
      </transition-group>
    </div>

    <transition name="milestone">
      <div v-if="showMilestone" class="milestone-alert">
        <div class="milestone-icon">
          <n-icon :component="Trophy" size="22" color="#f59e0b" />
        </div>
        <div class="milestone-content">
          <strong>{{ milestoneTitle }}</strong>
          <p>{{ milestoneDescription }}</p>
        </div>
        <n-button size="tiny" type="primary" @click="dismissMilestone">
          收到
        </n-button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { NButton, NIcon, NProgress, NTag } from 'naive-ui'
import { CheckCircle, Target, Trophy } from 'lucide-vue-next'

const props = defineProps({
  goals: {
    type: Array,
    default: () => []
  },
  progress: {
    type: Number,
    default: 0
  },
  sessionTime: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  totalXP: {
    type: Number,
    default: 0
  },
  embedded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['complete-milestone'])

const showMilestone = ref(false)
const milestoneTitle = ref('')
const milestoneDescription = ref('')

const displayGoals = computed(() => props.goals.slice(0, 4))

const progressPercentage = computed(() => {
  return Math.min(Math.max(props.progress, 0), 100)
})

const goalStatus = computed(() => {
  const totalCount = props.goals.length
  const completedCount = props.goals.filter(goal => goal.completed).length

  if (!totalCount) {
    return { type: 'default', text: '待开始' }
  }

  if (completedCount === totalCount) {
    return { type: 'success', text: '已完成' }
  }

  if (completedCount > 0) {
    return { type: 'warning', text: '进行中' }
  }

  return { type: 'info', text: '待开始' }
})

const statusDescription = computed(() => {
  const totalCount = props.goals.length
  const completedCount = props.goals.filter(goal => goal.completed).length

  if (!totalCount) {
    return '今天还没有生成任务，先开始一次学习吧。'
  }

  if (completedCount === totalCount) {
    return '今天的任务都完成了，可以去做一轮回顾或继续加练。'
  }

  return `已完成 ${completedCount} / ${totalCount} 项任务，继续把今天的学习节奏推进下去。`
})

function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds} 秒`
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} 分钟`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours} 小时 ${minutes} 分`
}

function checkMilestone() {
  const totalCount = props.goals.length
  const completedCount = props.goals.filter(goal => goal.completed).length

  if (!totalCount) {
    return
  }

  if (completedCount === totalCount) {
    milestoneTitle.value = '任务清单已完成'
    milestoneDescription.value = '你已经把当前学习任务都推进完了，继续保持这个节奏。'
    showMilestone.value = true
    return
  }

  if (completedCount >= Math.ceil(totalCount / 2) && !showMilestone.value) {
    milestoneTitle.value = '进度过半'
    milestoneDescription.value = '已经完成一半以上的任务，再推进一会儿就能收尾。'
    showMilestone.value = true
  }
}

function dismissMilestone() {
  emit('complete-milestone', {
    title: milestoneTitle.value,
    description: milestoneDescription.value
  })
  showMilestone.value = false
}

watch(
  () => props.goals,
  () => {
    checkMilestone()
  },
  { deep: true }
)

watch(
  () => props.progress,
  (value) => {
    if (value >= 100 && !showMilestone.value) {
      milestoneTitle.value = '任务全部收尾'
      milestoneDescription.value = '当前清单已经全部达成，记得顺手回顾重点内容。'
      showMilestone.value = true
    }
  }
)
</script>

<style scoped>
.learning-progress {
  --progress-shell: rgba(9, 15, 28, 0.96);
  --progress-section: rgba(255, 255, 255, 0.04);
  --progress-border: rgba(148, 163, 184, 0.14);
  --progress-text: #f8fafc;
  --progress-muted: rgba(148, 163, 184, 0.92);
  background: var(--progress-shell);
  height: 100%;
  position: relative;
  display: grid;
  grid-template-rows: auto auto 1fr;
}

.learning-progress.embedded {
  grid-template-rows: auto 1fr;
}

:global(html[data-theme='light'] .learning-progress) {
  --progress-shell: rgba(255, 255, 255, 0.98);
  --progress-section: rgba(248, 250, 252, 0.94);
  --progress-border: rgba(148, 163, 184, 0.18);
  --progress-text: #182132;
  --progress-muted: #64748b;
}

.progress-header {
  padding: 16px 18px 14px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid var(--progress-border);
}

.header-copy {
  display: grid;
  gap: 8px;
}

.title-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--progress-text);
  font-size: 14px;
  font-weight: 700;
}

.header-copy p {
  margin: 0;
  color: var(--progress-muted);
  font-size: 12px;
  line-height: 1.6;
}

.progress-summary {
  padding: 16px 18px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  border-bottom: 1px solid var(--progress-border);
}

.summary-ring {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(99, 102, 241, 0.18), rgba(99, 102, 241, 0.04));
  border: 1px solid rgba(99, 102, 241, 0.18);
  display: grid;
  place-items: center;
  text-align: center;
}

.summary-ring strong {
  display: block;
  color: var(--progress-text);
  font-size: 22px;
  line-height: 1;
}

.summary-ring span {
  color: var(--progress-muted);
  font-size: 11px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.summary-stat {
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--progress-section);
  border: 1px solid var(--progress-border);
  display: grid;
  gap: 6px;
}

.summary-stat small {
  color: var(--progress-muted);
  font-size: 11px;
}

.summary-stat strong {
  color: var(--progress-text);
  font-size: 15px;
  line-height: 1.4;
}

.task-list {
  padding: 16px 18px 18px;
  overflow-y: auto;
  display: grid;
  gap: 10px;
}

.task-item {
  padding: 14px;
  border-radius: 18px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  background: var(--progress-section);
  border: 1px solid var(--progress-border);
}

.task-item.completed {
  border-color: rgba(16, 185, 129, 0.24);
  background: rgba(16, 185, 129, 0.08);
}

.task-marker {
  padding-top: 3px;
}

.task-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 2px solid rgba(99, 102, 241, 0.28);
  background: rgba(99, 102, 241, 0.08);
}

.task-main {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.task-title-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
}

.task-title-row strong {
  color: var(--progress-text);
  font-size: 14px;
  line-height: 1.5;
}

.task-title-row span,
.task-meta {
  color: var(--progress-muted);
  font-size: 11px;
}

.task-main p {
  margin: 0;
  color: var(--progress-muted);
  line-height: 1.6;
  font-size: 12px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.milestone-alert {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  padding: 14px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #fff7ed, #fef3c7);
  border: 1px solid rgba(245, 158, 11, 0.22);
  box-shadow: 0 24px 40px -28px rgba(245, 158, 11, 0.48);
}

:global(html[data-theme='dark'] .milestone-alert) {
  background: linear-gradient(135deg, rgba(120, 53, 15, 0.92), rgba(146, 64, 14, 0.84));
  border-color: rgba(251, 191, 36, 0.18);
}

.milestone-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.4);
}

.milestone-content {
  flex: 1;
  display: grid;
  gap: 4px;
}

.milestone-content strong {
  color: #7c2d12;
  font-size: 14px;
}

.milestone-content p {
  margin: 0;
  color: rgba(124, 45, 18, 0.82);
  font-size: 12px;
  line-height: 1.5;
}

:global(html[data-theme='dark'] .milestone-content strong),
:global(html[data-theme='dark'] .milestone-content p) {
  color: #fff7ed;
}

.goal-item-enter-active,
.goal-item-leave-active,
.milestone-enter-active,
.milestone-leave-active {
  transition: all 0.28s ease;
}

.goal-item-enter-from,
.goal-item-leave-to,
.milestone-enter-from,
.milestone-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .progress-summary {
    grid-template-columns: 1fr;
  }

  .summary-ring {
    width: 100%;
    height: auto;
    padding: 18px 0;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .task-title-row,
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
