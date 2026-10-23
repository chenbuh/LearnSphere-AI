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
  ChevronRight,
  Compass,
  Zap
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
    grammar: '#5fa88b',
    writing: '#f59e0b',
    speaking: '#fb7185'
  }
  return colors[type] || '#94a3b8'
}

// R7：文字/图标色单独走主题令牌，原始亮色只用于背景与边框
const getTaskTone = (type) => {
  const tones = {
    vocabulary: 'var(--tone-emerald)',
    reading: 'var(--tone-blue)',
    listening: 'var(--tone-cyan)',
    grammar: 'var(--tone-emerald)',
    writing: 'var(--tone-amber)',
    speaking: 'var(--tone-pink)'
  }
  return tones[type] || 'var(--secondary-text)'
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
          <div class="empty-halo-wrap">
            <div class="empty-halo-ring outer"></div>
            <div class="empty-halo-ring inner"></div>
            <div class="empty-orb">
              <Compass :size="36" />
            </div>
          </div>

          <div class="empty-kicker">
            <span class="kicker-dot"></span>
            <span>AI 驱动 · 智能备战轨道</span>
          </div>

          <h1 class="empty-title">开启专属自适应备考计划</h1>
          <p class="empty-copy">
            设定目标词汇量与备考倒计时，系统将每日动态生成词汇记忆、真题阅读与专项练习任务，高效抵抗遗忘曲线。
          </p>

          <div class="empty-actions">
            <n-button type="primary" size="large" class="primary-btn glow-btn" @click="router.push('/study-plan/create')">
              <template #icon><Sparkles :size="18" /></template>
              立即创建学习计划
            </n-button>
            <n-button size="large" class="secondary-btn" @click="router.push('/vocabulary')">
              <template #icon><BookOpen :size="18" /></template>
              先去自主背词
            </n-button>
          </div>

          <div class="plan-feature-grid">
            <div class="feature-card">
              <div class="feature-icon-box emerald">
                <Calendar :size="22" />
              </div>
              <div class="feature-info">
                <h4>自适应每日排期</h4>
                <p>根据考试剩余天数动态分配每日任务量，平滑任务节奏，告别临考突击与拖延。</p>
              </div>
            </div>

            <div class="feature-card">
              <div class="feature-icon-box sky">
                <Target :size="22" />
              </div>
              <div class="feature-info">
                <h4>多维能力闭环</h4>
                <p>覆盖新词攻克、真题速读、语法练习与弱项错题重练，全方位构筑英语核心能力。</p>
              </div>
            </div>

            <div class="feature-card">
              <div class="feature-icon-box amber">
                <Flame :size="22" />
              </div>
              <div class="feature-info">
                <h4>每日打卡激励</h4>
                <p>连胜天数勋章与双倍积分机制，实时追踪学习投入度，让每一天的坚持都清晰可见。</p>
              </div>
            </div>
          </div>

          <div class="empty-tip-bar">
            <Zap :size="15" />
            <span>创建计划大约只需 1 分钟，后续随时可以在“学习计划”中调整强度与偏好。</span>
          </div>
        </section>
      </template>

      <template v-else>
        <header class="board-hero">
          <div class="hero-copy">
            <div class="board-badge">
              <span class="badge-dot"></span>
              <span>今日作战指挥台 · 实时动态同步</span>
            </div>
            <h1>{{ greeting }}，{{ userStore.nickname || '学习者' }}</h1>
            <p class="hero-subtitle">{{ todayDate }} · 当前学习计划正在平稳运转中，每日任务助你保持最佳手感。</p>

            <div class="hero-metrics">
              <div class="metric-chip">
                <Flame :size="16" class="metric-icon flame" />
                <span>已坚持 <strong>{{ streakDays }}</strong> 天</span>
              </div>
              <div class="metric-chip">
                <Award :size="16" class="metric-icon award" />
                <span>今日已得 <strong>{{ earnedPoints }}</strong> 积分</span>
              </div>
              <div class="metric-chip">
                <Clock3 :size="16" class="metric-icon clock" />
                <span>计划周期：{{ planRangeText }}</span>
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
              color="#1e6b52"
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
                  :style="{ background: getTaskColor(task.taskType) }"
                ></div>

                <div
                  class="task-icon"
                  :style="{
                    color: getTaskTone(task.taskType),
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
                        color: getTaskTone(task.taskType)
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
              <h3>今天暂无待执行任务</h3>
              <p>如果你刚调整过计划，稍后刷新即可获取；也可随时前往词库自习或刷题复盘！</p>
              <div class="task-empty-actions">
                <n-button size="small" class="empty-sub-btn" @click="router.push('/vocabulary')">
                  <template #icon><BookOpen :size="14" /></template>
                  去背单词
                </n-button>
                <n-button size="small" class="empty-sub-btn" @click="router.push('/review')">
                  <template #icon><Sparkles :size="14" /></template>
                  错题复盘
                </n-button>
              </div>
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
                  color="#1e6b52"
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
  --page-bg: #0b0f19;
  --panel-bg: var(--card-bg);
  --panel-soft: rgba(30, 41, 59, 0.65);
  --panel-strong: rgba(30, 41, 59, 0.95);
  --line: rgba(255, 255, 255, 0.08);
  --line-strong: rgba(30, 107, 82, 0.35);
  --text-main: #f8fafc;
  --text-soft: #cbd5e1;
  --text-faint: #94a3b8;
  --accent: #1e6b52;
  --accent-soft: rgba(30, 107, 82, 0.16);
  --accent-glow: rgba(30, 107, 82, 0.35);
  --success: #34d399;
  --success-soft: rgba(52, 211, 153, 0.14);
  max-width: 1360px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 96px);
  color: var(--text-main);
}

:global(html[data-theme='light'] .daily-task-board) {
  --page-bg: #f8fafc;
  --panel-bg: var(--card-bg);
  --panel-soft: rgba(241, 245, 249, 0.9);
  --panel-strong: #ffffff;
  --line: rgba(148, 163, 184, 0.18);
  --line-strong: rgba(30, 107, 82, 0.24);
  --text-main: #0f172a;
  --text-soft: #475569;
  --text-faint: #64748b;
  --accent: #1e6b52;
  --accent-soft: rgba(30, 107, 82, 0.08);
  --accent-glow: rgba(30, 107, 82, 0.2);
  --success: #059669;
  --success-soft: rgba(5, 150, 105, 0.1);
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
}

:global(html[data-theme='light'] .board-hero),
:global(html[data-theme='light'] .week-panel),
:global(html[data-theme='light'] .task-panel),
:global(html[data-theme='light'] .side-block),
:global(html[data-theme='light'] .empty-shell) {
  background: var(--panel-bg);
}

.board-hero::before,
.week-panel::before,
.task-panel::before,
.side-block::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--card-bg);
  pointer-events: none;
}

:global(html[data-theme='light'] .board-hero::before),
:global(html[data-theme='light'] .week-panel::before),
:global(html[data-theme='light'] .task-panel::before),
:global(html[data-theme='light'] .side-block::before) {
  background: var(--card-bg);
}

/* ================== 空状态 (Empty Shell) ================== */
.empty-shell {
  min-height: 72vh;
  border-radius: var(--radius-lg);
  padding: 64px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: transparent;
  animation: heroEnter 0.55s ease-out;
}

.empty-halo-wrap {
  position: relative;
  width: 104px;
  height: 104px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-halo-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
}

.empty-halo-ring.outer {
  inset: -14px;
  border: 1.5px dashed rgba(30, 107, 82, 0.35);
  animation: spinRing 26s linear infinite;
}

.empty-halo-ring.inner {
  inset: -6px;
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.empty-orb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(140, 195, 173, 0.35);
  /* R3：浅色档绿在浅色主题几乎不可见，改用随主题切换的令牌 */
  color: var(--tone-emerald);
}

:global(html[data-theme='light'] .empty-orb) {
  background: rgba(224, 231, 255, 0.85);
  color: var(--tone-emerald);
  border-color: rgba(30, 107, 82, 0.25);
}

.empty-orb.small {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
}

.empty-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(140, 195, 173, 0.25);
  /* R3：浅绿文字在浅色主题下不可读，改用主题令牌 */
  color: var(--tone-emerald);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 16px;
}

:global(html[data-theme='light'] .empty-kicker) {
  background: rgba(30, 107, 82, 0.08);
  border-color: rgba(30, 107, 82, 0.2);
  color: var(--tone-emerald);
}

.kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  animation: pulseDot 2s ease-in-out infinite;
}

.empty-title {
  font-size: clamp(2.1rem, 3.2vw, 2.9rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0;
  background: none;
  color: inherit;
}

:global(html[data-theme='light'] .empty-title) {
  background: none;
  color: inherit;
}

.empty-copy {
  max-width: 620px;
  margin: 14px auto 0;
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-soft);
}

.empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 32px;
}

.glow-btn {
  min-width: 176px;
  height: 48px;
  font-size: 15px;
  font-weight: 700;
  border-radius: var(--radius-lg);
  background: var(--brand) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: all 0.25s ease;
}

.glow-btn:hover {
  transform: translateY(-2px);
}

.secondary-btn {
  min-width: 150px;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: var(--text-main) !important;
  transition: all 0.25s ease;
}

:global(html[data-theme='light'] .secondary-btn) {
  background: rgba(0, 0, 0, 0.03) !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateY(-2px);
}

.plan-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  max-width: 980px;
  width: 100%;
  margin-top: 48px;
  text-align: left;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

:global(html[data-theme='light'] .feature-card) {
  background: rgba(248, 250, 252, 0.95);
  border-color: rgba(148, 163, 184, 0.18);
}

.feature-card:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(30, 107, 82, 0.3);
}

.feature-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.feature-icon-box.emerald {
  background: rgba(52, 211, 153, 0.14);
  color: var(--tone-emerald);
  border: 1px solid rgba(52, 211, 153, 0.25);
}

.feature-icon-box.sky {
  background: rgba(30, 107, 82, 0.14);
  color: var(--brand);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.feature-icon-box.amber {
  background: rgba(251, 191, 36, 0.14);
  color: var(--tone-amber);
  border: 1px solid rgba(251, 191, 36, 0.25);
}

.feature-info h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}

.feature-info p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-soft);
}

.empty-tip-bar {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 36px;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-faint);
  font-size: 12px;
}

.empty-tip-bar svg {
  color: var(--tone-amber);
}

/* ================== 看板顶部 (Board Hero) ================== */
.board-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.85fr);
  gap: 28px;
  padding: 30px 32px;
  border-radius: var(--radius-lg);
  animation: heroEnter 0.55s ease-out;
}

.board-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(30, 107, 82, 0.12);
  border: 1px solid rgba(30, 107, 82, 0.25);
  /* R3：同上，浅绿文字在浅色主题不可读 */
  color: var(--tone-emerald);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

:global(html[data-theme='light'] .board-badge) {
  background: rgba(30, 107, 82, 0.08);
  border-color: rgba(30, 107, 82, 0.2);
  color: var(--tone-emerald);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
}

.hero-copy h1 {
  font-size: clamp(2rem, 2.7vw, 3rem);
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin: 0;
  color: var(--text-main);
}

.hero-subtitle {
  margin: 12px 0 0;
  max-width: 700px;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--text-soft);
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
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-soft);
  font-size: 13.5px;
}

:global(html[data-theme='light'] .metric-chip) {
  background: rgba(248, 250, 252, 0.96);
  border-color: rgba(148, 163, 184, 0.2);
}

.metric-chip strong {
  color: var(--text-main);
  font-weight: 800;
}

.metric-icon.flame { color: var(--tone-orange); }
.metric-icon.award { color: var(--tone-amber); }
.metric-icon.clock { color: var(--tone-blue); }

.hero-progress {
  align-self: stretch;
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(30, 107, 82, 0.25);
  background: var(--card-bg);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

:global(html[data-theme='light'] .hero-progress) {
  border-color: rgba(30, 107, 82, 0.16);
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
  font-weight: 600;
}

.hero-progress-head strong {
  color: var(--tone-emerald);
  font-size: 34px;
  line-height: 1;
  font-weight: 900;
}

:global(html[data-theme='light'] .hero-progress-head strong) {
  color: var(--tone-emerald);
}

.hero-progress-meta {
  margin-top: 14px;
  color: var(--text-faint);
  font-size: 13px;
}

/* ================== 本周计划视图 (Week Panel) ================== */
.week-panel,
.task-panel {
  border-radius: var(--radius-lg);
}

.week-panel {
  margin-top: 24px;
  padding: 24px 26px;
}

.panel-heading {
  gap: 16px;
  margin-bottom: 20px;
}

.panel-heading.compact {
  margin-bottom: 18px;
}

.panel-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.01em;
}

.panel-heading p {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--text-soft);
}

.panel-note {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
  color: var(--text-faint);
  font-size: 12px;
}

:global(html[data-theme='light'] .panel-note) {
  background: rgba(248, 250, 252, 0.96);
}

.week-strip {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
}

.week-day {
  min-height: 120px;
  padding: 16px 14px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.025);
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

:global(html[data-theme='light'] .week-day) {
  background: rgba(248, 250, 252, 0.96);
  border-color: rgba(148, 163, 184, 0.12);
}

.week-day:hover,
.task-row:hover {
  transform: translateY(-2px);
}

.week-day.is-in-plan {
  border-color: rgba(30, 107, 82, 0.25);
  background: rgba(30, 107, 82, 0.08);
}

.week-day.is-today {
  border-color: rgba(30, 107, 82, 0.55);
  background: var(--card-bg);
}

:global(html[data-theme='light'] .week-day.is-today) {
  background: var(--card-bg);
}

/* R3：#cfe3da 在浅色主题浅底上不可读，改用随主题切换的 emerald 令牌 */
.week-day.has-tasks .week-day-state {
  color: var(--tone-emerald);
  font-weight: 600;
}

.week-day-name,
.week-day-state {
  display: block;
}

.week-day-name {
  color: var(--text-faint);
  font-size: 12px;
  font-weight: 500;
}

.week-day-number {
  display: block;
  margin-top: 14px;
  font-size: 32px;
  line-height: 1;
  font-weight: 900;
  color: var(--text-main);
}

.week-day-state {
  margin-top: 14px;
  font-size: 12px;
  color: var(--text-soft);
}

/* ================== 下半看板网格 (Board Grid) ================== */
.board-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(320px, 0.95fr);
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
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
  transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
}

:global(html[data-theme='light'] .task-row) {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(148, 163, 184, 0.14);
}

.task-row:hover {
  border-color: var(--line-strong);
  background: rgba(255, 255, 255, 0.05);
}

:global(html[data-theme='light'] .task-row:hover) {
  background: rgba(248, 250, 252, 0.98);
}

.task-row.completed {
  border-color: rgba(52, 211, 153, 0.2);
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
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:global(html[data-theme='light'] .task-icon) {
  border-color: rgba(148, 163, 184, 0.15);
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
  font-size: 17.5px;
  font-weight: 800;
  color: var(--text-main);
}

.task-tag {
  flex-shrink: 0;
  font-weight: 600;
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
  font-weight: 700;
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
  border-radius: var(--radius-lg);
  background: var(--brand);
  font-weight: 600;
  /* 品牌实心底：必须用品牌前景色，否则继承正文色只有 ~2.5:1 */
  color: var(--brand-ink);
}

.primary-btn.subtle {
  box-shadow: none;
}

.task-done-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 999px;
  color: var(--tone-emerald);
  background: rgba(52, 211, 153, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.25);
  font-size: 13px;
  font-weight: 700;
}

.task-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 320px;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--line);
  background: rgba(255, 255, 255, 0.02);
  padding: 30px;
}

:global(html[data-theme='light'] .task-empty) {
  background: rgba(248, 250, 252, 0.9);
}

.task-empty h3 {
  margin: 14px 0 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--text-main);
}

.task-empty p {
  margin: 8px 0 0;
  font-size: 13px;
  max-width: 420px;
  color: var(--text-soft);
}

.task-empty-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.empty-sub-btn {
  border-radius: var(--radius-md);
  font-size: 13px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--line);
  color: var(--text-main);
}

:global(html[data-theme='light'] .empty-sub-btn) {
  background: rgba(0, 0, 0, 0.04);
}

/* ================== 侧边栏 (Side Panel) ================== */
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.side-block {
  padding: 24px;
  border-radius: var(--radius-lg);
}

.progress-ring-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 20px;
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
  font-weight: 900;
}

.circle-content span {
  color: var(--text-faint);
  font-size: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-grid div {
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
}

:global(html[data-theme='light'] .summary-grid div) {
  background: rgba(248, 250, 252, 0.96);
  border-color: rgba(148, 163, 184, 0.12);
}

.summary-grid strong {
  display: block;
  color: var(--text-main);
  font-size: 24px;
  font-weight: 900;
}

.summary-grid span {
  display: block;
  margin-top: 4px;
  color: var(--text-faint);
  font-size: 12px;
}

.utility-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.utility-item {
  align-items: flex-start;
  gap: 10px;
  padding: 13px 15px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.03);
}

:global(html[data-theme='light'] .utility-item) {
  background: rgba(248, 250, 252, 0.92);
  border-color: rgba(148, 163, 184, 0.12);
}

/* R3：#8cc3ad 在浅色主题白底上不足 3:1，改用随主题切换的 emerald 令牌 */
.utility-item svg,
.trophy-icon {
  color: var(--tone-emerald);
  flex-shrink: 0;
  margin-top: 2px;
}

.utility-item span {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-soft);
}

.trophy-block {
  gap: 14px;
  padding: 18px 20px;
  border-color: rgba(245, 158, 11, 0.25);
  background: var(--card-bg);
}

:global(html[data-theme='light'] .trophy-block) {
  border-color: rgba(245, 158, 11, 0.25);
}

.trophy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: rgba(245, 158, 11, 0.16);
  color: var(--tone-amber);
}

.trophy-block h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main);
}

.trophy-block p {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--text-soft);
}

/* ================== 动效 (Animations) ================== */
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

@keyframes spinRing {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulseDot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.55;
    transform: scale(0.85);
  }
}

/* ================== 响应式适配 (Responsive) ================== */
@media (max-width: 1180px) {
  .board-hero,
  .board-grid {
    grid-template-columns: 1fr;
  }

  .hero-progress {
    max-width: 460px;
  }

  .plan-feature-grid {
    grid-template-columns: 1fr;
    max-width: 580px;
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
    border-radius: var(--radius-lg);
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

  .empty-actions {
    flex-direction: column;
    width: 100%;
  }

  .glow-btn,
  .secondary-btn {
    width: 100%;
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
    border-radius: var(--radius-lg);
  }

  .board-hero {
    padding: 18px 16px;
  }

  .week-panel,
  .task-panel {
    padding: 16px 14px;
  }

  .hero-copy h1,
  .empty-title {
    font-size: 1.68rem;
  }

  .week-strip {
    grid-template-columns: repeat(7, minmax(68px, 1fr));
    gap: 8px;
  }

  .week-day {
    padding: 12px 8px;
    border-radius: var(--radius-lg);
  }

  .week-day-name,
  .week-day-state {
    font-size: 11px;
  }

  .week-day-number {
    font-size: 20px;
  }

  .task-row {
    grid-template-columns: 4px 42px minmax(0, 1fr);
    gap: 12px;
    padding: 14px 12px 14px 0;
    border-radius: var(--radius-lg);
  }

  .task-icon {
    width: 42px;
    height: 42px;
    border-radius: var(--radius-lg);
  }

  .task-title-row h3 {
    font-size: 16px;
  }

  .empty-shell {
    padding: 36px 16px;
  }
}
</style>
