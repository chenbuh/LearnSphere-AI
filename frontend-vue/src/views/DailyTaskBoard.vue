<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NCard, NProgress, NButton, NTag, NEmpty, NSpin, NGrid, NGridItem, 
  useMessage, NLayout, NLayoutContent, NDivider, NAvatar, NBadge, NTooltip
} from 'naive-ui'
import { 
  CheckCircle, Circle, Calendar, TrendingUp, Award, 
  ArrowRight, Flame, Star, Zap, BookOpen, User, Trophy,
  Clock, Target
} from 'lucide-vue-next'
import { studyPlanApi } from '@/api/studyPlan'
import { useUserStore } from '@/stores/user'
import confetti from 'canvas-confetti'

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()
const loading = ref(false)

// Data
const currentPlan = ref(null)
const todayTasks = ref([])
const completingTaskId = ref(null)
const weekDays = ref([])

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

// Load Data
const loadData = async () => {
  loading.value = true
  try {
    const planRes = await studyPlanApi.getCurrentPlan()
    currentPlan.value = planRes.data
    
    if (currentPlan.value) {
      const tasksRes = await studyPlanApi.getTodayTasks()
      todayTasks.value = tasksRes.data || []
    }
    
    // Generate week days (simulated for now, centering on today)
    generateWeekDays()
  } catch (error) {
    console.error('[StudyPlan] Load failed:', error)
    message.error('加载学习数据失败，请重试')
  } finally {
    loading.value = false
  }
}

const generateWeekDays = () => {
  const days = []
  const today = new Date()
  // Generate current week (Mon-Sun)
  const currentDay = today.getDay() || 7 // 1-7
  const monday = new Date(today)
  monday.setDate(today.getDate() - currentDay + 1)
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const isToday = d.toDateString() === today.toDateString()
    const isPast = d < today
    // Mock status for visual demo
    let status = 'future' // future, current, done, missed
    if (isToday) status = 'current'
    else if (isPast) status = i % 2 === 0 ? 'done' : 'missed' // Random mock
    
    // Override mock if it's strictly future
    if (d > today) status = 'future'
    
    days.push({
      date: d,
      dayName: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      dayNum: d.getDate(),
      status: isToday ? 'current' : (status === 'done' ? 'done' : 'future') // Simplify for now
    })
  }
  weekDays.value = days
}

onMounted(() => {
  loadData()
})

// Actions
const startTask = (task) => {
  // 根据任务类型跳转到对应的学习页面
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

const completeTask = async (task) => {
  if (task.isCompleted) return
  
  completingTaskId.value = task.id
  try {
    // Artificial delay for better UX feeling
    await new Promise(r => setTimeout(r, 600))
    
    await studyPlanApi.completeTask(task.id, task.targetCount)
    task.isCompleted = true
    task.completedCount = task.targetCount
    
    message.success('任务完成！获得 50 积分', {
      icon: () => h(Star, { color: '#eab308' })
    })
    
    // Check if all completed for celebration effect
    if (completionRate.value === 100) {
      triggerConfetti()
    }
  } catch (error) {
    console.error('[Task] Complete failed:', error)
    message.error('操作失败，请重试')
  } finally {
    completingTaskId.value = null
  }
}

// Computed
const stats = computed(() => {
  if (!todayTasks.value.length) return { total: 0, completed: 0, remaining: 0 }
  const completed = todayTasks.value.filter(t => t.isCompleted).length
  return {
    total: todayTasks.value.length,
    completed,
    remaining: todayTasks.value.length - completed
  }
})

const displayTasks = computed(() => todayTasks.value.map((task) => {
  const normalizedTaskName = taskNameMap[task.taskType]?.[task.taskName] || task.taskName || `${getTaskLabel(task.taskType)}练习`
  return {
    ...task,
    displayTaskName: normalizedTaskName
  }
}))

const completionRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.completed / stats.value.total) * 100)
})

const todayDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// Helpers
const getTaskIcon = (type) => {
  const icons = {
    vocabulary: BookOpen,
    reading: Calendar,
    listening: Zap,
    grammar: CheckCircle,
    writing: Star,
    speaking: Flame
  }
  return icons[type] || Circle
}

const getTaskColor = (type) => {
  const colors = {
    vocabulary: '#10b981', // Emerald
    reading: '#3b82f6',    // Blue
    listening: '#f59e0b',  // Amber
    grammar: '#8b5cf6',    // Violet
    writing: '#ef4444',    // Red
    speaking: '#f97316'    // Orange
  }
  return colors[type] || '#71717a'
}

const getTaskLabel = (type) => {
  const labels = {
    vocabulary: '词汇', reading: '阅读', listening: '听力',
    grammar: '语法', writing: '写作', speaking: '口语'
  }
  return labels[type] || '通用'
}

// Celebration effect
const showCelebration = ref(false)
const triggerConfetti = () => {
  showCelebration.value = true
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8b5cf6', '#6366f1', '#f59e0b', '#10b981']
  })
  setTimeout(() => showCelebration.value = false, 5000)
}
</script>

<template>
  <div class="daily-task-board">
    <!-- Header Section -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in-down">
      <div>
         <h1 class="text-3xl font-black text-white flex items-center gap-3 mb-2 daily-greeting">
            <span>{{ greeting }}，{{ userStore.nickname || '学习者' }}</span>
            <span class="text-2xl animate-wave">👋</span>
         </h1>
         <p class="text-gray-400 daily-subtitle">
           今天是 {{ todayDate }}，保持专注，继续前进！
         </p>
      </div>
      
      <div class="mt-4 md:mt-0 flex gap-4">
        <div class="glass-pill">
           <Flame class="text-orange-500" :size="18" />
           <span class="font-bold text-white">3 天连胜</span>
        </div>
        <div class="glass-pill">
           <Award class="text-yellow-400" :size="18" />
           <span class="font-bold text-white">{{ stats.completed * 50 }} 积分</span>
        </div>
      </div>
    </header>

    <div class="relative z-20">
        <n-spin :show="loading">
          <template v-if="!currentPlan && !loading">
            <div class="empty-state-glass">
              <Calendar :size="64" class="text-gray-600 mb-6" />
              <h3 class="text-xl font-bold text-white mb-2">暂无学习计划</h3>
              <p class="text-gray-400 mb-8">制定一个科学的计划是成功的开始</p>
              <n-button type="primary" size="large" round class="glow-button" @click="router.push('/study-plan/create')">
                立即创建计划
              </n-button>
            </div>
          </template>

          <template v-else>
            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <!-- Left Column: Tasks -->
              <div class="lg:col-span-2 space-y-6">
                <!-- Weekly Calendar Strip -->
                <div class="week-strip-glass p-4 rounded-2xl flex justify-between items-center mb-6">
                  <div 
                    v-for="(day, index) in weekDays" 
                    :key="index"
                    class="day-item flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300"
                    :class="{ 
                      'bg-violet-600 shadow-lg glow-active': day.status === 'current',
                      'bg-white/5': day.status !== 'current'
                    }"
                  >
                     <span class="text-xs font-medium" :class="day.status === 'current' ? 'text-white' : 'text-gray-400'">{{ day.dayName }}</span>
                     <div 
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border"
                        :class="{
                           'border-transparent bg-white text-violet-700': day.status === 'current',
                           'border-green-500/30 bg-green-500/10 text-green-500': day.status === 'done',
                           'border-transparent text-gray-500': day.status === 'future'
                        }"
                     >
                       <CheckCircle v-if="day.status === 'done'" :size="14" />
                       <span v-else>{{ day.dayNum }}</span>
                     </div>
                  </div>
                </div>

                <!-- Task List -->
                <div class="flex items-center justify-between mb-4">
                  <h2 class="text-xl font-bold text-white flex items-center gap-2">
                    <Target class="text-violet-400" />
                    今日任务
                  </h2>
                  <span class="text-sm text-gray-400">{{ stats.completed }}/{{ stats.total }} 完成</span>
                </div>

                <div class="space-y-4">
                   <transition-group name="list">
                      <div 
                        v-for="task in displayTasks" 
                        :key="task.id"
                        class="task-card group"
                        :class="{ 'completed': task.isCompleted }"
                      >
                        <!-- Left decoration bar -->
                         <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300"
                              :style="{ backgroundColor: task.isCompleted ? '#3f3f46' : getTaskColor(task.taskType) }"></div>
                        
                        <div class="p-5 w-full flex items-center gap-5 relative z-10">
                           <!-- Icon with glow -->
                           <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 relative overflow-hidden"
                                :style="{ 
                                  backgroundColor: (task.isCompleted ? '#27272a' : getTaskColor(task.taskType) + '15'),
                                  color: (task.isCompleted ? '#71717a' : getTaskColor(task.taskType))
                                }">
                              <component :is="getTaskIcon(task.taskType)" :size="24" class="relative z-10" />
                              <div class="absolute inset-0 opacity-20" 
                                   :style="{ backgroundColor: getTaskColor(task.taskType) }"></div>
                           </div>
    
                           <!-- Content -->
                           <div class="flex-1 min-w-0">
                              <div class="flex flex-wrap items-center gap-2 mb-1">
                                 <h3 class="text-lg font-bold text-white truncate transition-colors"
                                     :class="{ 'text-gray-500 line-through': task.isCompleted }">
                                    {{ task.displayTaskName }}
                                 </h3>
                                 <n-tag v-if="!task.isCompleted" size="small" round :bordered="false"
                                        :style="{ backgroundColor: getTaskColor(task.taskType) + '20', color: getTaskColor(task.taskType) }">
                                    {{ getTaskLabel(task.taskType) }}
                                 </n-tag>
                              </div>
                              <div class="flex items-center gap-4 text-sm">
                                <span class="text-gray-400 flex items-center gap-1.5">
                                   <Target :size="14" />
                                   目标: {{ task.targetCount }}
                                </span>
                                <span v-if="task.isCompleted" class="text-green-500 flex items-center gap-1">
                                  <CheckCircle :size="14" /> 已完成
                                </span>
                              </div>
                           </div>
    
                           <!-- Action Button -->
                           <div class="shrink-0">
                              <n-button 
                                v-if="!task.isCompleted"
                                color="#8b5cf6"
                                class="action-btn"
                                round
                                size="large"
                                @click="startTask(task)"
                              >
                                <span class="font-bold">开始学习</span>
                                <template #icon><ArrowRight :size="18" /></template>
                              </n-button>
                              
                              <div v-else class="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center animate-bounce-in border border-green-500/30">
                                 <CheckCircle :size="20" stroke-width="3" />
                              </div>
                           </div>
                        </div>
                      </div>
                   </transition-group>
                </div>
                
                <!-- Empty State for Tasks -->
                <div v-if="todayTasks.length === 0" class="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                   <div class="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Calendar :size="32" class="text-gray-500" />
                   </div>
                   <p class="text-gray-400">今日暂无任务，休息一下吧 ☕️</p>
                </div>

              </div>

              <!-- Right Column: Progress & Stats -->
              <div class="space-y-6">
                <!-- Main Progress Card -->
                <div class="stat-glass-card relative overflow-hidden group">
                   <div class="absolute top-0 right-0 p-32 bg-purple-600/20 blur-3xl -mr-16 -mt-16 pointer-events-none transition-all duration-500 group-hover:bg-purple-600/30"></div>
                   
                   <h3 class="text-gray-400 font-bold uppercase text-xs tracking-wider mb-6">今日完成度</h3>
                   
                   <div class="flex items-center justify-center relative mb-8">
                      <!-- Circular Progress -->
                      <n-progress
                        type="circle"
                        :percentage="completionRate"
                        color="#8b5cf6"
                        rail-color="rgba(255, 255, 255, 0.1)"
                        :stroke-width="10"
                        :size="160"
                      >
                        <div class="text-center">
                          <span class="text-4xl font-black text-white block">{{ completionRate }}<span class="text-lg opacity-60">%</span></span>
                          <span class="text-gray-400 text-xs mt-1 block">进度</span>
                        </div>
                      </n-progress>
                   </div>

                   <div class="grid grid-cols-2 gap-4">
                      <div class="bg-white/5 rounded-xl p-3 text-center">
                         <div class="text-2xl font-bold text-white">{{ stats.completed }}</div>
                         <div class="text-xs text-gray-500 uppercase mt-1">已完成</div>
                      </div>
                      <div class="bg-white/5 rounded-xl p-3 text-center">
                         <div class="text-2xl font-bold text-white">{{ stats.remaining }}</div>
                         <div class="text-xs text-gray-500 uppercase mt-1">待完成</div>
                      </div>
                   </div>
                   
                   <div v-if="completionRate === 100" class="mt-6 flex items-center justify-center gap-2 text-yellow-400 font-bold bg-yellow-500/10 py-3 rounded-xl animate-pulse">
                      <Trophy :size="20" />
                      全部完成!
                   </div>
                </div>

                <!-- Motivation Card -->
                <div class="stat-glass-card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                   <div class="flex items-start gap-4">
                      <div class="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                         <Zap class="text-indigo-400" :size="20" />
                      </div>
                      <div>
                         <h4 class="text-white font-bold mb-1">每日一句</h4>
                         <p class="text-gray-400 text-sm leading-relaxed italic">
                           "The journey of a thousand miles begins with one step."
                           <br/><span class="text-gray-500 not-italic mt-1 block">- Lao Tzu</span>
                         </p>
                      </div>
                   </div>
                </div>
              </div>
              
            </div>
          </template>
        </n-spin>
    </div>

    <!-- Celebration Overlay -->
    <Teleport to="body">
      <div v-if="showCelebration" class="fixed inset-0 z-[9999] flex items-center justify-center">
         <div class="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" @click="showCelebration = false"></div>
         <div class="relative bg-[#0f172a] border border-purple-500/30 p-10 rounded-3xl shadow-2xl text-center animate-scale-up max-w-sm mx-4">
            <div class="absolute -top-12 left-1/2 transform -translate-x-1/2">
               <div class="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-bounce">
                 <Trophy :size="48" class="text-white" />
               </div>
            </div>
            
            <div class="mt-10">
              <h2 class="text-3xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500">
                太棒了!
              </h2>
              <p class="text-gray-400 mb-8">
                你完成了今天所有的任务！<br/>离目标又近了一步。
              </p>
              
              <div class="flex items-center justify-center gap-2 mb-8 p-4 bg-white/5 rounded-2xl">
                 <Star class="text-yellow-400" fill="currentColor" />
                 <span class="text-xl font-bold text-white">+{{ stats.total * 50 }} 积分</span>
              </div>
  
              <n-button type="primary" size="large" round class="w-full bg-gradient-to-r from-violet-600 to-indigo-600 border-none hover:shadow-lg transition-all" @click="showCelebration = false">
                 继续保持
              </n-button>
            </div>
         </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.daily-task-board {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    min-height: 80vh;
}

/* Glass Components */
.stat-glass-card {
  background: rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
:global(.dark-mode) .stat-glass-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.week-strip-glass {
  background: rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.05);
}
:global(.dark-mode) .week-strip-glass {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.empty-state-glass {
  background: rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(0, 0, 0, 0.05);
  border-radius: 32px;
  padding: 80px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
:global(.dark-mode) .empty-state-glass {
  background: rgba(30, 41, 59, 0.3);
  border: 2px dashed rgba(255, 255, 255, 0.05);
}

.glass-pill {
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 8px 16px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 8px;
}
:global(.dark-mode) .glass-pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Task Card Style */
.task-card {
  background: rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  display: flex;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
:global(.dark-mode) .task-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.task-card:hover {
  background: rgba(0, 0, 0, 0.06);
  border-color: rgba(99, 102, 241, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
:global(.dark-mode) .task-card:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.task-card.completed {
  opacity: 0.8;
  border: 1px solid transparent;
}

.glow-active {
  box-shadow: 0 0 15px rgba(124, 58, 237, 0.5);
}

/* Animations */
.animate-wave {
  animation: wave 2.5s infinite;
  transform-origin: 70% 70%;
  display: inline-block;
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

.animate-fly-in {
  animation: flyIn 0.5s ease-out forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.animate-bounce-in {
  animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes bounceIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}

.animate-scale-up {
  animation: scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes scaleUp {
  from { transform: scale(0.9) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

/* Responsive */
@media (max-width: 768px) {
  .daily-task-board { padding: 12px; }
  .task-card .p-5 { padding: 12px; }
  .text-3xl { font-size: 1.5rem; }
  .glass-pill { padding: 4px 10px; font-size: 0.8rem; }
  .day-item { min-width: 40px; padding: 4px !important; }
  .w-14 { width: 44px; height: 44px; }
  .action-btn { padding: 0 12px; height: 36px; font-size: 0.85rem; }
}

@media (max-width: 480px) {
  .week-strip-glass {
    overflow-x: auto;
    justify-content: flex-start;
    gap: 8px;
    padding: 8px;
  }
  .day-item {
    flex-shrink: 0;
  }
}

/* Light/Dark mode text override helper classes */
.daily-greeting { color: #18181b; }
:global(.dark-mode) .daily-greeting { color: #fff; }
.daily-subtitle { color: #52525b; }
:global(.dark-mode) .daily-subtitle { color: #9ca3af; }

/* In-template class adjustments - Targeting within Vue component */
/* Note: Since we can't easily change TW classes inside template string without replace_file, 
   we will override specific text colors via CSS selects based on parent classes added above */

.task-card h3 { color: #18181b; }
:global(.dark-mode) .task-card h3 { color: #fff; }

.text-gray-400 { color: #52525b; }
:global(.dark-mode) .text-gray-400 { color: #9ca3af; }

.glass-pill .text-white { color: #18181b; }
:global(.dark-mode) .glass-pill .text-white { color: #fff; }

.stat-glass-card .text-white { color: #18181b; }
:global(.dark-mode) .stat-glass-card .text-white { color: #fff; }

.day-item .text-white { color: #fff; } /* Active day text stays white */
.day-item .text-gray-400 { color: #52525b; }
:global(.dark-mode) .day-item .text-gray-400 { color: #9ca3af; }
</style>
