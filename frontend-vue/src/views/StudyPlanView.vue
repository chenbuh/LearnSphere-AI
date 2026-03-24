<template>
  <div class="study-plan-container">
    <div class="max-w-6xl mx-auto">
      <!-- 头部概览 -->
      <header class="study-plan-header flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div class="study-plan-intro animate-fade-in-left">
          <h1 class="text-4xl font-black page-title mb-2">我的学习计划</h1>
          <p class="page-caption text-lg">基于 AI 算法为您量身定制的备考路线图</p>
        </div>
        <div class="study-plan-actions flex gap-4 animate-fade-in-right">
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
            <h2 class="text-2xl font-bold empty-title mb-4">开启您的智能学习之旅</h2>
            <p class="empty-caption max-w-md mx-auto mb-8">
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
                  <div class="metric-card-head flex justify-between items-start">
                    <div class="metric-card-copy">
                      <p class="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">目标考试</p>
                      <h3 class="text-2xl font-black metric-value">{{ getExamLabel(currentPlan.examType) }}</h3>
                    </div>
                    <div class="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                      <GraduationCap :size="24" />
                    </div>
                  </div>
                  <div class="metric-card-footer mt-4 flex items-center gap-2">
                    <n-tag size="small" type="primary" round>{{ currentPlan.targetScore }} 分目标</n-tag>
                  </div>
                </div>

                <div class="stat-card-premium bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <div class="metric-card-head flex justify-between items-start">
                    <div class="metric-card-copy">
                      <p class="text-xs text-emerald-300 font-bold uppercase tracking-wider mb-1">已坚持学习</p>
                      <h3 class="text-2xl font-black metric-value">{{ currentPlan.daysPassed || 0 }} <span class="text-sm font-normal text-emerald-400/60">天</span></h3>
                    </div>
                    <div class="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Flame :size="24" />
                    </div>
                  </div>
                  <div class="metric-card-footer mt-4 flex items-center gap-2">
                    <n-progress type="line" :percentage="Math.round((currentPlan.daysPassed / currentPlan.durationDays) * 100)" :show-indicator="false" color="#10b981" :height="4" />
                  </div>
                </div>

                <div class="stat-card-premium bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                  <div class="metric-card-head flex justify-between items-start">
                    <div class="metric-card-copy">
                      <p class="text-xs text-amber-300 font-bold uppercase tracking-wider mb-1">预计结束</p>
                      <h3 class="text-2xl font-black metric-value">{{ formatEndDate(currentPlan.createTime, currentPlan.durationDays) }}</h3>
                    </div>
                    <div class="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                      <Target :size="24" />
                    </div>
                  </div>
                  <p class="mt-4 text-xs text-amber-400/60 metric-note">剩余 {{ currentPlan.durationDays - (currentPlan.daysPassed || 0) }} 天</p>
                </div>
              </div>

              <!-- 学习路线图 (Roadmap) -->
              <div class="main-card p-8">
                <div class="roadmap-head flex items-center justify-between mb-10">
                  <h3 class="text-xl font-bold section-heading flex items-center gap-2">
                    <TrendingUp class="text-indigo-400" />
                    学习路线图
                  </h3>
                  <div class="roadmap-legend flex items-center gap-4">
                     <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-emerald-500"></div> <span class="text-xs legend-label">已完成</span></div>
                     <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-indigo-500"></div> <span class="text-xs legend-label">进行中</span></div>
                     <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-white/10"></div> <span class="text-xs legend-label">锁定</span></div>
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
                         <h4 class="phase-title font-bold">{{ phase.title }}</h4>
                         <p class="phase-desc text-sm mb-3">{{ phase.desc }}</p>
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
                <h3 class="text-md font-bold side-heading mb-6 flex items-center gap-2">
                  <Brain :size="18" class="text-purple-400" />
                  当前能力评估
                </h3>
                <div class="space-y-5">
                   <div v-for="skill in skills" :key="skill.label">
                      <div class="skill-row flex justify-between text-xs mb-1.5">
                         <span class="skill-label">{{ skill.label }}</span>
                         <span class="skill-value font-bold">{{ skill.value }}%</span>
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
                <h3 class="text-md font-bold side-heading mb-4">完成任务奖励</h3>
                <div class="reward-item flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5 mb-3">
                   <div class="p-2 bg-yellow-400/20 rounded-lg text-yellow-400">
                      <Zap :size="20" />
                   </div>
                   <div class="reward-copy">
                      <p class="reward-title font-bold text-sm">+50 XP</p>
                      <p class="reward-note text-[10px]">每个今日任务</p>
                   </div>
                </div>
                <div class="reward-item flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                   <div class="p-2 bg-indigo-400/20 rounded-lg text-indigo-400">
                      <Award :size="20" />
                   </div>
                   <div class="reward-copy">
                      <p class="reward-title font-bold text-sm">+200 XP</p>
                      <p class="reward-note text-[10px]">全部今日任务</p>
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
import { getExamTypeLabel } from '@/constants/examTypes'

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
  return getExamTypeLabel(type, '英语考试备考')
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
  padding: 40px max(24px, env(safe-area-inset-right)) calc(40px + env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
  min-height: 100vh;
}

.study-plan-header,
.study-plan-intro,
.study-plan-actions,
.roadmap-head,
.roadmap-legend,
.metric-card-head,
.metric-card-copy,
.metric-card-footer,
.skill-row,
.reward-item,
.reward-copy,
.phase-content {
  min-width: 0;
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

.page-title,
.empty-title,
.metric-value,
.section-heading,
.phase-title,
.side-heading,
.skill-value,
.reward-title {
  color: #f8fafc;
}

.page-title,
.metric-value {
  overflow-wrap: anywhere;
}

.page-caption,
.empty-caption,
.legend-label,
.phase-title,
.phase-desc,
.skill-label,
.skill-value,
.reward-title,
.reward-note,
.metric-note {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.page-caption,
.empty-caption,
.legend-label,
.phase-desc,
.skill-label,
.reward-note,
.metric-note {
  color: #94a3b8;
}

.metric-card-head {
  gap: 12px;
}

.metric-card-copy {
  flex: 1;
}

.metric-card-footer {
  min-width: 0;
  flex-wrap: wrap;
}

.metric-card-footer :deep(.n-tag) {
  max-width: 100%;
}

/* Roadmap Styles */
.roadmap-container {
  padding-left: 20px;
}

.roadmap-legend > div {
  min-width: 0;
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

.reward-copy {
  min-width: 0;
  flex: 1;
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

:global(html[data-theme='light'] .study-plan-container) {
  color: #182132;
}

:global(html[data-theme='light'] .page-title),
:global(html[data-theme='light'] .empty-title),
:global(html[data-theme='light'] .metric-value),
:global(html[data-theme='light'] .section-heading),
:global(html[data-theme='light'] .phase-title),
:global(html[data-theme='light'] .side-heading),
:global(html[data-theme='light'] .skill-value),
:global(html[data-theme='light'] .reward-title) {
  color: #0f172a !important;
}

:global(html[data-theme='light'] .page-caption),
:global(html[data-theme='light'] .empty-caption),
:global(html[data-theme='light'] .legend-label),
:global(html[data-theme='light'] .phase-desc),
:global(html[data-theme='light'] .skill-label),
:global(html[data-theme='light'] .reward-note),
:global(html[data-theme='light'] .metric-note) {
  color: #64748b !important;
}

:global(html[data-theme='light'] .study-plan-container .text-white),
:global(html[data-theme='light'] .study-plan-container h1),
:global(html[data-theme='light'] .study-plan-container h3),
:global(html[data-theme='light'] .study-plan-container h4) {
  color: #0f172a !important;
}

:global(html[data-theme='light'] .study-plan-container .text-gray-400),
:global(html[data-theme='light'] .study-plan-container .text-gray-500),
:global(html[data-theme='light'] .study-plan-container .text-gray-200) {
  color: #64748b !important;
}

:global(html[data-theme='light'] .study-plan-container .text-indigo-300),
:global(html[data-theme='light'] .study-plan-container .text-indigo-400) {
  color: #4f46e5 !important;
}

:global(html[data-theme='light'] .study-plan-container .text-amber-300),
:global(html[data-theme='light'] .study-plan-container .text-amber-400) {
  color: #d97706 !important;
}

:global(html[data-theme='light'] .main-card) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  backdrop-filter: blur(16px);
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .stat-card-premium) {
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

:global(html[data-theme='light'] .stat-card-premium.bg-gradient-to-br.from-indigo-500\/20.to-purple-500\/20) {
  background: linear-gradient(135deg, rgba(224, 231, 255, 0.9), rgba(243, 232, 255, 0.9));
}

:global(html[data-theme='light'] .stat-card-premium.bg-gradient-to-br.from-emerald-500\/20.to-teal-500\/20) {
  background: linear-gradient(135deg, rgba(209, 250, 229, 0.88), rgba(204, 251, 241, 0.9));
}

:global(html[data-theme='light'] .stat-card-premium.bg-gradient-to-br.from-amber-500\/20.to-orange-500\/20) {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.92), rgba(255, 237, 213, 0.92));
}

:global(html[data-theme='light'] .empty-state-card) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light'] .empty-state-card .bg-white\/5) {
  background: rgba(241, 245, 249, 0.96) !important;
}

:global(html[data-theme='light'] .empty-state-card .text-gray-500) {
  color: #94a3b8 !important;
}

:global(html[data-theme='light'] .roadmap-phase .marker-circle) {
  background: rgba(241, 245, 249, 0.96);
  border-color: rgba(148, 163, 184, 0.18);
  color: #64748b;
}

:global(html[data-theme='light'] .roadmap-phase .marker-line) {
  background: rgba(203, 213, 225, 0.9);
}

:global(html[data-theme='light'] .roadmap-phase.active .marker-circle) {
  box-shadow: 0 0 18px rgba(99, 102, 241, 0.18);
}

:global(html[data-theme='light'] .main-card .bg-white\/5),
:global(html[data-theme='light'] .main-card .bg-black\/40),
:global(html[data-theme='light'] .main-card .bg-black\/20),
:global(html[data-theme='light'] .main-card .bg-gradient-to-b.from-white\/5.to-transparent) {
  background: rgba(248, 250, 252, 0.94) !important;
}

:global(html[data-theme='light'] .main-card .border-white\/5),
:global(html[data-theme='light'] .main-card .border-white\/10) {
  border-color: rgba(148, 163, 184, 0.14) !important;
}

:global(html[data-theme='light'] .main-card .text-yellow-400),
:global(html[data-theme='light'] .main-card .text-indigo-200) {
  color: #f59e0b !important;
}

:global(html[data-theme='light'] .main-card .text-shadow) {
  color: #4338ca !important;
}

:global(html[data-theme='light'] .premium-progress-container) {
  background: rgba(226, 232, 240, 0.95) !important;
  border-color: rgba(148, 163, 184, 0.16) !important;
}

@media (max-width: 768px) {
  .study-plan-container {
    padding: 20px max(12px, env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
    min-height: auto;
  }

  .study-plan-header {
    margin-bottom: 24px;
  }

  .study-plan-actions {
    width: 100%;
    flex-direction: column;
  }

  .study-plan-actions :deep(.n-button) {
    width: 100%;
    min-height: 46px;
  }

  .metric-card-head,
  .skill-row,
  .reward-item {
    gap: 10px;
  }

  .main-card,
  .empty-state-card {
    border-radius: 20px;
  }

  .stat-card-premium {
    padding: 18px;
    border-radius: 18px;
  }

  .roadmap-container {
    padding-left: 0;
  }

  .roadmap-head {
    gap: 14px;
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 20px;
  }

  .roadmap-legend {
    width: 100%;
    flex-wrap: wrap;
    gap: 10px 14px;
  }

  .roadmap-legend > div {
    flex: 1 1 150px;
  }

  .roadmap-phase {
    gap: 14px;
  }

  .marker-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .phase-content {
    padding-bottom: 28px;
  }

  .page-title {
    font-size: 1.8rem;
    line-height: 1.12;
  }

  .page-caption {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .metric-value {
    line-height: 1.18;
  }
}

@media (max-width: 480px) {
  .study-plan-container {
    padding: 16px max(8px, env(safe-area-inset-right)) calc(24px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
  }

  .main-card.p-8 {
    padding: 20px 16px !important;
  }

  .main-card.p-6 {
    padding: 18px 16px !important;
  }

  .empty-state-card {
    padding: 56px 18px !important;
    border-radius: 24px;
  }

  .page-title {
    font-size: 1.55rem;
  }

  .page-caption {
    font-size: 0.88rem;
  }

  .study-plan-actions {
    gap: 10px;
  }

  .stat-card-premium {
    padding: 16px;
    border-radius: 16px;
  }

  .empty-state-card :deep(.n-button) {
    width: 100%;
  }

  .metric-card-head {
    gap: 8px;
  }

  .metric-card-copy {
    flex: 1;
  }

  .metric-card-footer {
    flex-wrap: wrap;
  }

  .metric-card-footer :deep(.n-tag) {
    white-space: normal;
    height: auto;
    line-height: 1.35;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .reward-item {
    align-items: flex-start;
    gap: 12px;
  }

  .roadmap-phase {
    gap: 10px;
  }

  .phase-content {
    padding-bottom: 22px;
  }
}

@media (max-width: 360px) {
  .study-plan-container {
    padding: 14px max(8px, env(safe-area-inset-right)) calc(20px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
  }

  .study-plan-actions {
    gap: 8px;
  }

  .study-plan-actions :deep(.n-button) {
    min-height: 42px;
  }

  .main-card.p-8,
  .main-card.p-6 {
    padding: 16px 14px !important;
  }

  .stat-card-premium {
    padding: 14px;
    border-radius: 18px;
  }

  .page-title {
    font-size: 1.42rem;
  }

  .page-caption,
  .empty-caption {
    font-size: 0.82rem;
  }

  .metric-value {
    font-size: 1.24rem;
    line-height: 1.15;
  }

  .roadmap-legend {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 10px;
  }

  .roadmap-legend > div:last-child {
    grid-column: 1 / -1;
  }

  .metric-note {
    font-size: 11px;
    line-height: 1.5;
  }

  .phase-title {
    font-size: 0.95rem;
    line-height: 1.35;
  }

  .phase-desc {
    font-size: 0.8rem;
    line-height: 1.5;
  }

  .phase-content {
    padding-bottom: 18px;
  }

  .reward-item {
    gap: 10px;
    padding: 12px !important;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .study-plan-container {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }

  .study-plan-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .study-plan-actions :deep(.n-button) {
    flex: 1 1 220px;
  }

  .roadmap-legend {
    gap: 8px 12px;
  }

  .roadmap-legend > div {
    flex: 1 1 120px;
  }

  .phase-content {
    padding-bottom: 20px;
  }
}
</style>

