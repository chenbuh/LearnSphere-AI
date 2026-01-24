<template>
  <div class="study-plan-container">
    <div class="max-w-6xl mx-auto">
      <!-- 头部概览 -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div class="animate-fade-in-left">
          <h1 class="text-4xl font-black text-white mb-2">我的学习计划</h1>
          <p class="text-gray-400 text-lg">基于 AI 算法为您量身定制的备考路线图</p>
        </div>
        <div class="flex gap-4 animate-fade-in-right">
          <n-button type="primary" size="large" round secondary @click="router.push('/daily-tasks')">
            <template #icon><Clock :size="20" /></template>
            今日任务
          </n-button>
          <n-button type="warning" size="large" round class="glow-button" @click="router.push('/study-plan/create')">
            <template #icon><RotateCcw :size="20" /></template>
            重置计划
          </n-button>
        </div>
      </header>

      <n-spin :show="loading">
        <template v-if="!currentPlan && !loading">
          <div class="empty-state-card py-20 text-center">
            <div class="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar :size="48" class="text-gray-500" />
            </div>
            <h2 class="text-2xl font-bold text-white mb-4">开启您的智能学习之旅</h2>
            <p class="text-gray-400 max-w-md mx-auto mb-8">
              您还没有制定学习计划。告诉我们您的目标，AI 将为您生成最优的学习路线。
            </p>
            <n-button type="primary" size="large" round class="px-10" @click="router.push('/study-plan/create')">
              立即创建计划
            </n-button>
          </div>
        </template>

        <template v-else-if="currentPlan">
          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- 左侧：主要进度与卡片 -->
            <div class="lg:col-span-3 space-y-8">
              <!-- 核心指标卡 -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="stat-card-premium bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">目标考试</p>
                      <h3 class="text-2xl font-black text-white">{{ getExamLabel(currentPlan.examType) }}</h3>
                    </div>
                    <div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <GraduationCap :size="24" />
                    </div>
                  </div>
                  <div class="mt-4 flex items-center gap-2">
                    <n-tag size="small" type="primary" round>{{ currentPlan.targetScore }} 分目标</n-tag>
                  </div>
                </div>

                <div class="stat-card-premium bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">已坚持学习</p>
                      <h3 class="text-2xl font-black text-white">{{ currentPlan.daysPassed || 0 }} <span class="text-sm font-normal text-emerald-400/60">天</span></h3>
                    </div>
                    <div class="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Flame :size="24" />
                    </div>
                  </div>
                  <div class="mt-4 flex items-center gap-2">
                    <n-progress type="line" :percentage="Math.round((currentPlan.daysPassed / currentPlan.durationDays) * 100)" :show-indicator="false" color="#10b981" :height="4" />
                  </div>
                </div>

                <div class="stat-card-premium bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-xs text-amber-300 font-bold uppercase tracking-wider mb-1">预计结束</p>
                      <h3 class="text-2xl font-black text-white">{{ formatEndDate(currentPlan.createTime, currentPlan.durationDays) }}</h3>
                    </div>
                    <div class="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                      <Target :size="24" />
                    </div>
                  </div>
                  <p class="mt-4 text-xs text-amber-400/60">剩余 {{ currentPlan.durationDays - (currentPlan.daysPassed || 0) }} 天</p>
                </div>
              </div>

              <!-- 学习路线图 (Roadmap) -->
              <div class="main-card p-8">
                <div class="flex items-center justify-between mb-10">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp class="text-indigo-400" />
                    学习路线图
                  </h3>
                  <div class="flex items-center gap-4">
                     <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-emerald-500"></div> <span class="text-xs text-gray-500">已完成</span></div>
                     <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-indigo-500"></div> <span class="text-xs text-gray-500">进行中</span></div>
                     <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-white/10"></div> <span class="text-xs text-gray-500">锁定</span></div>
                  </div>
                </div>

                <div class="roadmap-container">
                   <div v-for="(phase, index) in phases" :key="index" class="roadmap-phase" :class="{ 'completed': phase.completed, 'active': phase.active }">
                      <div class="phase-marker">
                         <div class="marker-circle">
                            <Check v-if="phase.completed" :size="16" stroke-width="4" />
                            <span v-else>{{ index + 1 }}</span>
                         </div>
                         <div v-if="index < phases.length - 1" class="marker-line"></div>
                      </div>
                      <div class="phase-content">
                         <h4 class="text-white font-bold">{{ phase.title }}</h4>
                         <p class="text-gray-500 text-sm mb-3">{{ phase.desc }}</p>
                         <div class="flex flex-wrap gap-2">
                            <n-tag v-for="tag in phase.tags" :key="tag" size="tiny" :bordered="false" class="opacity-60">{{ tag }}</n-tag>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <!-- 右侧：侧边信息 -->
            <div class="space-y-6">
              <!-- 能力分析 -->
              <div class="main-card p-6">
                <h3 class="text-md font-bold text-white mb-6 flex items-center gap-2">
                  <Brain :size="18" class="text-purple-400" />
                  当前能力评估
                </h3>
                <div class="space-y-5">
                   <div v-for="skill in skills" :key="skill.label">
                      <div class="flex justify-between text-xs mb-1.5">
                         <span class="text-gray-400">{{ skill.label }}</span>
                         <span class="text-white font-bold">{{ skill.value }}%</span>
                      </div>
                      <n-progress type="line" :percentage="skill.value" :color="skill.color" :show-indicator="false" :height="4" round />
                   </div>
                </div>
                <n-button block secondary class="mt-8" size="small" @click="router.push('/analysis')">
                  查看详细报告
                </n-button>
              </div>

              <!-- 每日成就奖励 -->
              <div class="main-card p-6 bg-gradient-to-b from-white/5 to-transparent">
                <h3 class="text-md font-bold text-white mb-4">完成任务奖励</h3>
                <div class="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 mb-3">
                   <div class="p-2 bg-yellow-400/20 rounded-lg text-yellow-400">
                      <Zap :size="20" />
                   </div>
                   <div>
                      <p class="text-white font-bold text-sm">+50 XP</p>
                      <p class="text-gray-500 text-[10px]">每个今日任务</p>
                   </div>
                </div>
                <div class="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                   <div class="p-2 bg-indigo-400/20 rounded-lg text-indigo-400">
                      <Award :size="20" />
                   </div>
                   <div>
                      <p class="text-white font-bold text-sm">+200 XP</p>
                      <p class="text-gray-500 text-[10px]">全部今日任务</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </n-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NProgress, NTag, NSpin, useMessage } from 'naive-ui'
import { 
  Calendar, RotateCcw, Clock, GraduationCap, Flame, 
  Target, TrendingUp, Check, Brain, Award, Zap, ArrowRight 
} from 'lucide-vue-next'
import { studyPlanApi } from '@/api/studyPlan'

const router = useRouter()
const message = useMessage()
const loading = ref(true)
const currentPlan = ref(null)

const phases = ref([
  { title: '基础夯实阶段', desc: '核心词汇突破及基础语法体系梳理。', tags: ['CET-4 核心词', '基本句式'], completed: true, active: false },
  { title: '强化进阶阶段', desc: '各题型解题技巧掌握及中高难度材料阅读。', tags: ['阅读技巧', '听力辨音'], completed: false, active: true },
  { title: '真题实战阶段', desc: '全真模拟测试，查漏补缺，提升应试节奏感。', tags: ['历年真题', '作文模板'], completed: false, active: false },
  { title: '考前冲刺阶段', desc: '高频考点点睛，错题回顾及心理状态调整。', tags: ['考前押题', '心态管理'], completed: false, active: false }
])

const skills = ref([
  { label: '词汇总量', value: 65, color: '#6366f1' },
  { label: '听力理解', value: 42, color: '#f59e0b' },
  { label: '阅读速度', value: 78, color: '#10b981' },
  { label: '写作表达', value: 55, color: '#ef4444' }
])

const loadData = async () => {
  loading.value = true
  try {
    const res = await studyPlanApi.getCurrentPlan()
    if (res.code === 200) {
      currentPlan.value = res.data
      // 在实际业务中，这里可以根据 plan 的阶段 (currentLevel/totalLevel) 动态更新 phases 数组的状态
    }
  } catch (e) {
    console.error('Failed to load study plan', e)
  } finally {
    loading.value = false
  }
}

const getExamLabel = (type) => {
  const map = { 'cet4': '大学英语四级', 'cet6': '大学英语六级', 'ielts': '雅思 IELTS', 'toefl': '托福 TOEFL' }
  return map[type] || '英语考试备考'
}

/**
 * 计算计划结束日期
 * @param {string} createTime 创建时间
 * @param {number} duration 持续天数
 */
const formatEndDate = (createTime, duration) => {
  if (!createTime) return '---'
  const date = new Date(createTime)
  date.setDate(date.getDate() + duration)
  return (date.getMonth() + 1) + '月' + date.getDate() + '日'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.study-plan-container {
  padding: 40px 24px;
  min-height: 100vh;
}

.main-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
}

.stat-card-premium {
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s;
}
.stat-card-premium:hover {
  transform: translateY(-5px);
}

.empty-state-card {
  background: rgba(30, 41, 59, 0.2);
  border: 2px dashed rgba(255, 255, 255, 0.05);
  border-radius: 32px;
}

/* Roadmap Styles */
.roadmap-container {
  padding-left: 20px;
}
.roadmap-phase {
  display: flex;
  gap: 24px;
  position: relative;
}
.phase-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.marker-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #71717a;
  font-weight: 800;
  font-size: 14px;
  z-index: 2;
  transition: all 0.3s;
}
.marker-line {
  width: 2px;
  flex-grow: 1;
  background: rgba(255, 255, 255, 0.05);
  margin: 4px 0;
}

.roadmap-phase.completed .marker-circle {
  background: #10b981;
  border-color: #10b981;
  color: white;
}
.roadmap-phase.completed .marker-line {
  background: #10b981;
}

.roadmap-phase.active .marker-circle {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
}

.phase-content {
  padding-bottom: 48px;
}

/* Animations */
.animate-fade-in-left {
  animation: fadeInLeft 0.8s ease-out;
}
.animate-fade-in-right {
  animation: fadeInRight 0.8s ease-out;
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.glow-button {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  border: none;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}
.glow-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}
</style>
