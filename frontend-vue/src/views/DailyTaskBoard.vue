<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NProgress, NButton, NTag, NSpin, useMessage } from 'naive-ui'
import {
  CheckCircle,
  Circle,
  Calendar,
  Award,
  ArrowRight,
  Flame,
  BookOpen,
  Trophy,
  Clock3,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-vue-next'
import { studyPlanApi } from '@/api/studyPlan'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const loading = ref(false)
const currentPlan = ref(null)
const todayTasks = ref([])

const taskNameMap = {
  vocabulary: {
    '学习新单词': '学习新单词',
    'Learn new words': '学习新单词',
    'Vocabulary Practice': '词汇练习',
    'Vocabulary Review': '词汇复习'
  },
  reading: {
    '阅读文章': '阅读文章',
    'Read articles': '阅读文章',
    'Reading Practice': '阅读练习'
  },
  listening: {
    '听力练习（分钟）': '听力练习',
    'Listening Practice (Minutes)': '听力练习',
    'Listening Practice': '听力练习'
  },
  grammar: {
    '语法练习题': '语法练习',
    'Grammar Exercises': '语法练习',
    'Grammar Practice': '语法练习'
  },
  writing: {
    'Writing Practice': '写作练习',
    '写作练习': '写作练习'
  },
  speaking: {
    'Speaking Practice': '口语练习',
    '口语练习': '口语练习'
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const planRes = await studyPlanApi.getCurrentPlan()
    currentPlan.value = planRes.data

    if (currentPlan.value) {
      const tasksRes = await studyPlanApi.getTodayTasks()
      todayTasks.value = tasksRes.data || []
    } else {
      todayTasks.value = []
    }
  } catch (error) {
    console.error('[StudyPlan] Load failed:', error)
    message.error('加载学习数据失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const startTask = (task) => {
  const routeMap = {
    vocabulary: '/vocabulary',
    reading: '/reading',
    listening: '/listening',
    grammar: '/grammar',
    writing: '/writing',
    speaking: '/speaking'
  }

  const route = routeMap[task.taskType]
  if (route) {
    router.push(route)
  } else {
    message.warning('该功能正在开发中')
  }
}

const stats = computed(() => {
  if (!todayTasks.value.length) {
    return { total: 0, completed: 0, remaining: 0 }
  }

  const completed = todayTasks.value.filter(task => task.isCompleted).length
  return {
    total: todayTasks.value.length,
    completed,
    remaining: todayTasks.value.length - completed
  }
})

const displayTasks = computed(() => todayTasks.value.map((task) => {
  const normalizedTaskName = taskNameMap[task.taskType]?.[task.taskName] || task.taskName || `${getTaskLabel(task.taskType)}练习`
  const progress = task.targetCount > 0
    ? Math.min(100, Math.round(((task.completedCount || 0) / task.targetCount) * 100))
    : (task.isCompleted ? 100 : 0)

  return {
    ...task,
    progress,
    displayTaskName: normalizedTaskName
  }
}))

const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.completed / stats.value.total) * 100)
})

const todayDate = computed(() => new Date().toLocaleDateString('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const normalizeDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

const isSameDay = (left, right) => {
  if (!left || !right) return false
  return left.getTime() === right.getTime()
}

const weekDays = computed(() => {
  const days = []
  const today = normalizeDate(new Date())
  const currentDay = today.getDay() || 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - currentDay + 1)

  const planStart = normalizeDate(currentPlan.value?.startDate)
  const planEnd = normalizeDate(currentPlan.value?.endDate)

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    date.setHours(0, 0, 0, 0)

    const isToday = isSameDay(date, today)
    const inPlan = Boolean(
      (!planStart || date >= planStart) &&
      (!planEnd || date <= planEnd)
    )

    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      dayName: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][index],
      dayNum: date.getDate(),
      isToday,
      inPlan,
      hasTasks: isToday && todayTasks.value.length > 0
    })
  }

  return days
})

const todayFocusText = computed(() => {
  if (!currentPlan.value) return '先创建计划，系统才会为你生成当日任务。'
  if (stats.value.total === 0) return '今天暂未生成任务，可以前往学习计划重新安排节奏。'
  if (completionRate.value === 100) return '今天的任务已经完成，可以继续做拓展练习或复盘错题。'
  return `今天还剩 ${stats.value.remaining} 项任务，建议优先处理未完成模块。`
})

const planRangeText = computed(() => {
  const start = currentPlan.value?.startDate
  const end = currentPlan.value?.endDate
  if (!start || !end) return '未提供计划区间'
  return `${start} - ${end}`
})

const streakDays = computed(() => currentPlan.value?.daysPassed || 0)
const earnedPoints = computed(() => stats.value.completed * 50)

const getTaskIcon = (type) => {
  const icons = {
    vocabulary: BookOpen,
    reading: Calendar,
    listening: Sparkles,
    grammar: CheckCircle,
    writing: Award,
    speaking: Flame
  }
  return icons[type] || Circle
}

const getTaskColor = (type) => {
  const colors = {
    vocabulary: '#34d399',
    reading: '#60a5fa',
    listening: '#38bdf8',
    grammar: '#a78bfa',
    writing: '#f59e0b',
    speaking: '#fb7185'
  }
  return colors[type] || '#94a3b8'
}

const getTaskLabel = (type) => {
  const labels = {
    vocabulary: '词汇',
    reading: '阅读',
    listening: '听力',
    grammar: '语法',
    writing: '写作',
    speaking: '口语'
  }
  return labels[type] || '通用'
}
</script>

<template>
  <div class="daily-task-board">
    <n-spin :show="loading">
      <template v-if="!currentPlan && !loading">
        <section class="empty-shell">
          <div class="empty-orb">
            <Calendar :size="34" />
          </div>
          <p class="eyebrow">每日任务</p>
          <h1>还没有学习计划</h1>
          <p class="empty-copy">先确定考试目标和学习周期，系统才会按天生成真实任务。</p>
          <n-button type="primary" size="large" class="primary-btn" @click="router.push('/study-plan/create')">
            创建学习计划
          </n-button>
        </section>
      </template>

      <template v-else>
        <header class="board-hero">
          <div class="hero-copy">
            <p class="eyebrow">今日概览</p>
            <h1>{{ greeting }}，{{ userStore.nickname || '学习者' }}</h1>
            <p class="hero-subtitle">{{ todayDate }}，所有数据都来自你当前计划和今日任务。</p>

            <div class="hero-metrics">
              <div class="metric-chip">
                <Flame :size="16" />
                <span>已坚持 {{ streakDays }} 天</span>
              </div>
              <div class="metric-chip">
                <Award :size="16" />
                <span>今日已得 {{ earnedPoints }} 积分</span>
              </div>
              <div class="metric-chip">
                <Clock3 :size="16" />
                <span>{{ planRangeText }}</span>
              </div>
            </div>
          </div>

          <div class="hero-progress">
            <div class="hero-progress-head">
              <span>今日完成度</span>
              <strong>{{ completionRate }}%</strong>
            </div>
            <n-progress
              type="line"
              :percentage="completionRate"
              color="#6366f1"
              rail-color="rgba(148, 163, 184, 0.18)"
              :show-indicator="false"
              :height="10"
              border-radius="999"
            />
            <div class="hero-progress-meta">
              <span>{{ stats.completed }} / {{ stats.total }} 已完成</span>
              <span>{{ stats.remaining }} 项待处理</span>
            </div>
          </div>
        </header>

        <section class="week-panel">
          <div class="panel-heading">
            <div>
              <h2>本周计划视图</h2>
              <p>本周任务会按你的真实学习计划自动更新。</p>
            </div>
            <span class="panel-note">计划区间内高亮</span>
          </div>

          <div class="week-strip">
            <div
              v-for="day in weekDays"
              :key="day.key"
              class="week-day"
              :class="{
                'is-today': day.isToday,
                'is-in-plan': day.inPlan,
                'has-tasks': day.hasTasks
              }"
            >
              <span class="week-day-name">{{ day.dayName }}</span>
              <span class="week-day-number">{{ day.dayNum }}</span>
              <span class="week-day-state">
                <template v-if="day.isToday && day.hasTasks">今日任务</template>
                <template v-else-if="day.isToday">今天</template>
                <template v-else-if="day.inPlan">计划内</template>
                <template v-else>空档</template>
              </span>
            </div>
          </div>
        </section>

        <div class="board-grid">
          <main class="task-panel">
            <div class="panel-heading">
              <div>
                <h2>今日任务</h2>
                <p>从当前计划自动生成，直接进入对应模块继续学习。</p>
              </div>
              <span class="panel-note">{{ stats.completed }}/{{ stats.total }} 完成</span>
            </div>

            <div v-if="displayTasks.length" class="task-list">
              <article
                v-for="task in displayTasks"
                :key="task.id"
                class="task-row"
                :class="{ completed: task.isCompleted }"
              >
                <div
                  class="task-accent"
                  :style="{ background: `linear-gradient(180deg, ${getTaskColor(task.taskType)}, transparent)` }"
                ></div>

                <div
                  class="task-icon"
                  :style="{
                    color: getTaskColor(task.taskType),
                    background: `${getTaskColor(task.taskType)}1a`
                  }"
                >
                  <component :is="getTaskIcon(task.taskType)" :size="22" />
                </div>

                <div class="task-body">
                  <div class="task-title-row">
                    <h3>{{ task.displayTaskName }}</h3>
                    <n-tag
                      size="small"
                      :bordered="false"
                      class="task-tag"
                      :style="{
                        background: `${getTaskColor(task.taskType)}1a`,
                        color: getTaskColor(task.taskType)
                      }"
                    >
                      {{ getTaskLabel(task.taskType) }}
                    </n-tag>
                  </div>

                  <div class="task-meta">
                    <span>目标 {{ task.targetCount }}</span>
                    <span>当前 {{ task.completedCount || 0 }}</span>
                    <span v-if="task.isCompleted" class="done-text">已完成</span>
                  </div>

                  <n-progress
                    type="line"
                    :percentage="task.progress"
                    :color="getTaskColor(task.taskType)"
                    rail-color="rgba(148, 163, 184, 0.14)"
                    :show-indicator="false"
                    :height="6"
                    border-radius="999"
                  />
                </div>

                <div class="task-action">
                  <div v-if="task.isCompleted" class="task-done-badge">
                    <CheckCircle :size="18" />
                    <span>完成</span>
                  </div>
                  <n-button
                    v-else
                    class="primary-btn subtle"
                    @click="startTask(task)"
                  >
                    开始学习
                    <template #icon>
                      <ArrowRight :size="16" />
                    </template>
                  </n-button>
                </div>
              </article>
            </div>

            <div v-else class="task-empty">
              <div class="empty-orb small">
                <Target :size="26" />
              </div>
              <h3>今天没有待执行任务</h3>
              <p>如果你刚调整过计划，稍后刷新即可看到新的任务安排。</p>
            </div>
          </main>

          <aside class="side-panel">
            <section class="side-block progress-block">
              <div class="panel-heading compact">
                <div>
                  <h2>完成概览</h2>
                  <p>按今日任务实时汇总</p>
                </div>
              </div>

              <div class="progress-ring-wrap">
                <n-progress
                  type="circle"
                  :percentage="completionRate"
                  color="#6366f1"
                  rail-color="rgba(148, 163, 184, 0.14)"
                  :stroke-width="10"
                  :size="156"
                >
                  <div class="circle-content">
                    <strong>{{ completionRate }}%</strong>
                    <span>已完成</span>
                  </div>
                </n-progress>
              </div>

              <div class="summary-grid">
                <div>
                  <strong>{{ stats.completed }}</strong>
                  <span>完成任务</span>
                </div>
                <div>
                  <strong>{{ stats.remaining }}</strong>
                  <span>剩余任务</span>
                </div>
                <div>
                  <strong>{{ stats.total }}</strong>
                  <span>今日总数</span>
                </div>
                <div>
                  <strong>{{ earnedPoints }}</strong>
                  <span>累计积分</span>
                </div>
              </div>
            </section>

            <section class="side-block utility-block">
              <div class="panel-heading compact">
                <div>
                  <h2>今日提示</h2>
                  <p>基于真实任务状态生成</p>
                </div>
              </div>

              <div class="utility-list">
                <div class="utility-item">
                  <Sparkles :size="16" />
                  <span>{{ todayFocusText }}</span>
                </div>
                <div class="utility-item">
                  <Calendar :size="16" />
                  <span>当前计划区间：{{ planRangeText }}</span>
                </div>
                <div class="utility-item">
                  <ChevronRight :size="16" />
                  <span>完成任务后，这里的进度会自动更新。</span>
                </div>
              </div>
            </section>

            <section class="side-block trophy-block" v-if="completionRate === 100">
              <div class="trophy-icon">
                <Trophy :size="22" />
              </div>
              <div>
                <h3>今日任务已清空</h3>
                <p>状态已同步完成，你可以继续做扩展训练或复盘错题。</p>
              </div>
            </section>
          </aside>
        </div>
      </template>
    </n-spin>
  </div>
</template>

<style scoped>
.daily-task-board {
  --page-bg: var(--bg-color);
  --panel-bg: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 247, 251, 0.98));
  --panel-soft: rgba(241, 245, 249, 0.9);
  --panel-strong: rgba(255, 255, 255, 0.98);
  --line: rgba(148, 163, 184, 0.2);
  --line-strong: rgba(99, 102, 241, 0.22);
  --text-main: var(--text-color);
  --text-soft: var(--secondary-text);
  --text-faint: #94a3b8;
  --accent: #6366f1;
  --accent-soft: rgba(99, 102, 241, 0.1);
  --success: #059669;
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 96px);
  color: var(--text-main);
}

:global(html[data-theme='dark'] .daily-task-board) {
  --panel-bg: linear-gradient(180deg, rgba(42, 47, 65, 0.98), rgba(27, 31, 44, 0.96));
  --panel-soft: rgba(36, 40, 54, 0.8);
  --panel-strong: rgba(46, 51, 70, 0.98);
  --line: rgba(255, 255, 255, 0.08);
  --line-strong: rgba(99, 102, 241, 0.28);
  --text-main: var(--text-color);
  --text-soft: var(--secondary-text);
  --text-faint: #8d96ad;
  --accent-soft: rgba(99, 102, 241, 0.16);
  --success: #34d399;
}

.board-hero,
.week-panel,
.task-panel,
.side-block,
.empty-shell {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--panel-bg);
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='dark'] .board-hero),
:global(html[data-theme='dark'] .week-panel),
:global(html[data-theme='dark'] .task-panel),
:global(html[data-theme='dark'] .side-block),
:global(html[data-theme='dark'] .empty-shell) {
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.32);
}

.board-hero::before,
.week-panel::before,
.task-panel::before,
.side-block::before,
.empty-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 28%),
    linear-gradient(180deg, rgba(99, 102, 241, 0.02), transparent 36%);
  pointer-events: none;
}

:global(html[data-theme='dark'] .board-hero::before),
:global(html[data-theme='dark'] .week-panel::before),
:global(html[data-theme='dark'] .task-panel::before),
:global(html[data-theme='dark'] .side-block::before),
:global(html[data-theme='dark'] .empty-shell::before) {
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.015), transparent 36%);
}

.board-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.8fr);
  gap: 28px;
  padding: 30px 32px;
  border-radius: 28px;
  animation: heroEnter 0.55s ease-out;
}

.hero-copy h1,
.empty-shell h1,
.task-empty h3,
.trophy-block h3 {
  margin: 0;
  color: var(--text-main);
}

.eyebrow {
  margin: 0 0 10px;
  color: #a5b4fc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero-copy h1 {
  font-size: clamp(2rem, 2.7vw, 3rem);
  line-height: 1.05;
  font-weight: 900;
}

.hero-subtitle,
.panel-heading p,
.task-empty p,
.empty-copy,
.utility-item span,
.trophy-block p {
  color: var(--text-soft);
}

.hero-subtitle {
  margin: 14px 0 0;
  max-width: 700px;
  font-size: 15px;
}

.hero-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.96);
  color: var(--text-main);
}

:global(html[data-theme='dark'] .metric-chip) {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
}

.hero-progress {
  align-self: stretch;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(99, 102, 241, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 251, 0.98));
}

:global(html[data-theme='dark'] .hero-progress) {
  border: 1px solid rgba(99, 102, 241, 0.16);
  background:
    linear-gradient(180deg, rgba(35, 40, 58, 0.96), rgba(26, 29, 46, 0.9));
}

.hero-progress-head,
.hero-progress-meta,
.panel-heading,
.task-title-row,
.task-meta,
.summary-grid,
.utility-item,
.trophy-block {
  display: flex;
  align-items: center;
}

.hero-progress-head,
.hero-progress-meta,
.panel-heading,
.task-title-row,
.task-meta,
.summary-grid {
  justify-content: space-between;
}

.hero-progress-head {
  margin-bottom: 16px;
  color: var(--text-soft);
  font-size: 14px;
}

.hero-progress-head strong {
  color: var(--text-main);
  font-size: 32px;
  line-height: 1;
}

.hero-progress-meta {
  margin-top: 12px;
  color: var(--text-faint);
  font-size: 13px;
}

.week-panel,
.task-panel {
  border-radius: 26px;
}

.week-panel {
  margin-top: 24px;
  padding: 24px 26px;
}

.panel-heading {
  gap: 16px;
  margin-bottom: 18px;
}

.panel-heading.compact {
  margin-bottom: 20px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
}

.panel-heading p {
  margin: 6px 0 0;
  font-size: 13px;
}

.panel-note {
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid var(--line);
  color: var(--text-faint);
  font-size: 12px;
}

:global(html[data-theme='dark'] .panel-note) {
  background: rgba(255, 255, 255, 0.04);
}

.week-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}

.week-day {
  min-height: 116px;
  padding: 16px 14px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(248, 250, 252, 0.96);
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

:global(html[data-theme='dark'] .week-day) {
  background: rgba(255, 255, 255, 0.035);
}

.week-day:hover,
.task-row:hover {
  transform: translateY(-2px);
}

.week-day.is-in-plan {
  border-color: rgba(99, 102, 241, 0.18);
  background: rgba(99, 102, 241, 0.08);
}

:global(html[data-theme='light'] .week-day.is-in-plan) {
  background: rgba(99, 102, 241, 0.06);
}

.week-day.is-today {
  border-color: rgba(99, 102, 241, 0.42);
  background:
    linear-gradient(180deg, rgba(224, 231, 255, 0.96), rgba(238, 242, 255, 0.98));
  box-shadow: 0 18px 34px rgba(99, 102, 241, 0.1);
}

:global(html[data-theme='dark'] .week-day.is-today) {
  background:
    linear-gradient(180deg, rgba(67, 56, 202, 0.34), rgba(32, 38, 60, 0.94));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 20px 40px rgba(5, 10, 22, 0.22);
}

.week-day.has-tasks .week-day-state {
  color: #c7d2fe;
}

.week-day-name,
.week-day-state {
  display: block;
}

.week-day-name {
  color: var(--text-faint);
  font-size: 12px;
}

.week-day-number {
  display: block;
  margin-top: 14px;
  font-size: 34px;
  line-height: 1;
  font-weight: 800;
  color: var(--text-main);
}

.week-day-state {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-soft);
}

.board-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(320px, 0.9fr);
  gap: 24px;
  margin-top: 24px;
}

.task-panel {
  padding: 24px 26px 26px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.task-row {
  display: grid;
  grid-template-columns: 4px 56px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px 18px 18px 0;
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(255, 255, 255, 0.96);
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

:global(html[data-theme='dark'] .task-row) {
  background: rgba(255, 255, 255, 0.035);
}

.task-row:hover {
  border-color: var(--line-strong);
  background: rgba(248, 250, 252, 0.98);
}

:global(html[data-theme='dark'] .task-row:hover) {
  background: rgba(255, 255, 255, 0.05);
}

.task-row.completed {
  border-color: rgba(52, 211, 153, 0.14);
}

.task-accent {
  align-self: stretch;
  border-radius: 999px;
}

.task-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.task-body {
  min-width: 0;
}

.task-title-row {
  gap: 12px;
  align-items: flex-start;
}

.task-title-row h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
}

.task-tag {
  flex-shrink: 0;
}

.task-meta {
  gap: 14px;
  justify-content: flex-start;
  margin: 10px 0 12px;
  flex-wrap: wrap;
  color: var(--text-soft);
  font-size: 13px;
}

.done-text {
  color: var(--success);
}

.task-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 126px;
}

.primary-btn {
  min-width: 124px;
  height: 42px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.22);
}

.primary-btn.subtle {
  box-shadow: none;
}

.task-done-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 999px;
  color: var(--success);
  background: rgba(52, 211, 153, 0.12);
  border: 1px solid rgba(52, 211, 153, 0.16);
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-block {
  padding: 22px;
  border-radius: 24px;
}

.progress-ring-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 18px;
}

.circle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.circle-content strong {
  font-size: 34px;
  line-height: 1;
  color: var(--text-main);
}

.circle-content span,
.summary-grid span {
  color: var(--text-faint);
  font-size: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-grid div {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

:global(html[data-theme='light'] .summary-grid div) {
  background: rgba(248, 250, 252, 0.96);
}

.summary-grid strong {
  display: block;
  color: var(--text-main);
  font-size: 22px;
  font-weight: 800;
}

.summary-grid span {
  display: block;
  margin-top: 6px;
}

.utility-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.utility-item {
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  background: rgba(248, 250, 252, 0.92);
}

:global(html[data-theme='dark'] .utility-item) {
  background: rgba(255, 255, 255, 0.03);
}

.utility-item svg,
.trophy-icon {
  color: #a5b4fc;
  flex-shrink: 0;
}

.trophy-block {
  gap: 12px;
  padding: 18px 20px;
  border-color: rgba(245, 158, 11, 0.16);
  background:
    linear-gradient(180deg, rgba(51, 35, 9, 0.88), rgba(25, 19, 10, 0.92));
}

:global(html[data-theme='light'] .trophy-block) {
  border-color: rgba(245, 158, 11, 0.18);
  background:
    linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(254, 243, 199, 0.92));
}

.trophy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
}

.task-empty,
.empty-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.task-empty {
  min-height: 320px;
  border-radius: 22px;
  border: 1px dashed rgba(148, 163, 184, 0.14);
  background: rgba(248, 250, 252, 0.9);
}

:global(html[data-theme='dark'] .task-empty) {
  background: rgba(255, 255, 255, 0.025);
}

.empty-shell {
  min-height: 70vh;
  border-radius: 32px;
  padding: 40px 24px;
}

.empty-shell h1 {
  font-size: clamp(2rem, 3vw, 2.8rem);
}

.empty-copy,
.task-empty p {
  max-width: 520px;
  margin: 12px auto 0;
}

.empty-orb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 74px;
  margin-bottom: 18px;
  border-radius: 24px;
  color: #a5b4fc;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.18);
}

:global(html[data-theme='light'] .empty-orb) {
  background: rgba(224, 231, 255, 0.78);
  color: #4f46e5;
  border-color: rgba(99, 102, 241, 0.22);
  box-shadow: 0 12px 28px rgba(99, 102, 241, 0.12);
}

.empty-orb.small {
  width: 58px;
  height: 58px;
  border-radius: 18px;
}

@keyframes heroEnter {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1180px) {
  .board-hero,
  .board-grid {
    grid-template-columns: 1fr;
  }

  .hero-progress {
    max-width: 420px;
  }
}

@media (max-width: 820px) {
  .daily-task-board {
    padding: 16px;
  }

  .board-hero,
  .week-panel,
  .task-panel,
  .side-block,
  .empty-shell {
    border-radius: 22px;
  }

  .board-hero {
    padding: 22px 20px;
  }

  .week-panel,
  .task-panel {
    padding: 20px;
  }

  .week-strip {
    grid-template-columns: repeat(7, minmax(80px, 1fr));
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .task-row {
    grid-template-columns: 4px 48px minmax(0, 1fr);
    padding-right: 14px;
  }

  .task-action {
    grid-column: 2 / -1;
    justify-content: flex-start;
    margin-top: 14px;
  }
}

@media (max-width: 560px) {
  .hero-copy h1 {
    font-size: 1.85rem;
  }

  .metric-chip {
    width: 100%;
    justify-content: center;
  }

  .task-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .daily-task-board {
    padding: 12px 10px 20px;
  }

  .board-hero,
  .week-panel,
  .task-panel,
  .side-block,
  .empty-shell {
    border-radius: 18px;
  }

  .board-hero {
    padding: 18px 16px;
  }

  .week-panel,
  .task-panel {
    padding: 16px 14px;
  }

  .hero-copy h1,
  .empty-shell h1 {
    font-size: 1.68rem;
  }

  .metric-chip {
    padding: 10px 12px;
  }

  .week-strip {
    grid-template-columns: repeat(7, minmax(68px, 1fr));
    gap: 8px;
  }

  .week-day {
    padding: 12px 8px;
    border-radius: 16px;
  }

  .week-day-name,
  .week-day-state {
    font-size: 11px;
  }

  .week-day-number {
    font-size: 18px;
  }

  .task-row {
    grid-template-columns: 4px 42px minmax(0, 1fr);
    gap: 12px;
    padding: 14px 12px 14px 0;
    border-radius: 18px;
  }

  .task-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
  }

  .task-title-row h3 {
    font-size: 16px;
  }

  .task-meta {
    gap: 8px;
    margin: 8px 0 10px;
    font-size: 12px;
  }

  .task-action {
    min-width: 0;
    width: 100%;
  }

  .primary-btn {
    width: 100%;
    min-width: 0;
  }

  .summary-grid div {
    padding: 12px;
  }

  .empty-shell {
    padding: 20px 16px;
  }

  .empty-orb {
    width: 64px;
    height: 64px;
    border-radius: 20px;
  }

  .empty-orb.small {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }
}

@media (max-width: 360px) {
  .daily-task-board {
    padding-left: 8px;
    padding-right: 8px;
  }

  .hero-copy h1,
  .empty-shell h1 {
    font-size: 1.52rem;
  }

  .week-strip {
    grid-template-columns: repeat(7, minmax(62px, 1fr));
  }

  .task-row {
    grid-template-columns: 4px 38px minmax(0, 1fr);
    gap: 10px;
  }

  .task-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
  }

  .task-title-row {
    gap: 8px;
  }

  .task-title-row h3 {
    font-size: 15px;
  }

  .task-meta {
    gap: 6px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .daily-task-board {
    padding-bottom: 14px;
  }

  .board-grid {
    gap: 18px;
  }

  .board-hero {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .week-panel,
  .task-panel {
    padding-top: 16px;
    padding-bottom: 16px;
  }
}
</style>
