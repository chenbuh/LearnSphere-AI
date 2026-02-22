<template>
  <div class="learning-progress">
    <!-- 头部 -->
    <div class="progress-header">
      <div class="header-left">
        <n-icon :component="Target" size="16" color="#10b981" />
        <span>学习进度</span>
      </div>
      <div class="header-right">
        <n-tag size="tiny" :type="goalStatus.type">
          {{ goalStatus.text }}
        </n-tag>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        >
          <transition name="progress-shine">
            <div v-if="progressPercentage > 0" class="progress-shine"></div>
          </transition>
        </div>
      </div>
      <div class="progress-text">{{ progressPercentage }}%</div>
    </div>

    <!-- 学习目标列表 -->
    <div class="goals-list">
      <transition-group name="goal-item">
        <div
          v-for="(goal, index) in displayGoals"
          :key="goal.id || index"
          :class="['goal-item', { completed: goal.completed }]"
        >
          <div class="goal-checkbox">
            <n-checkbox
              :checked="goal.completed"
              :disabled="goal.completed || goal.locked"
              @update:checked="toggleGoal(goal, index)"
            />
          </div>

          <div class="goal-content">
            <div class="goal-title">{{ goal.title }}</div>
            <div class="goal-description">{{ goal.description }}</div>

            <!-- 目标进度 -->
            <div v-if="goal.progress !== undefined" class="goal-progress">
              <n-progress
                type="line"
                :percentage="goal.progress"
                :show-indicator="false"
                :height="4"
                :rail-color="goal.completed ? '#10b981' : '#374151'"
                :color="goal.completed ? '#10b981' : '#8b5cf6'"
              />
            </div>
          </div>

          <!-- 目标奖励 -->
          <div v-if="goal.reward" class="goal-reward">
            <n-tooltip trigger="hover">
              <template #trigger>
                <div class="reward-badge">
                  <n-icon :component="Award" size="14" color="#fbbf24" />
                  <span>+{{ goal.reward.xp }}</span>
                </div>
              </template>
              <span>完成奖励: {{ goal.reward.xp }} XP</span>
            </n-tooltip>
          </div>

          <!-- 锁定状态 -->
          <div v-if="goal.locked" class="goal-lock">
            <n-icon :component="Lock" size="14" color="#6b7280" />
          </div>
        </div>
      </transition-group>
    </div>

    <!-- 学习统计 -->
    <div class="learning-stats">
      <div class="stat-item">
        <n-icon :component="Clock" size="14" color="#60a5fa" />
        <span>{{ formatTime(sessionTime) }}</span>
        <span class="stat-label">本次学习</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <n-icon :component="Flame" size="14" color="#f97316" />
        <span>{{ streak }} 天</span>
        <span class="stat-label">连续学习</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <n-icon :component="Star" size="14" color="#fbbf24" />
        <span>{{ totalXP }}</span>
        <span class="stat-label">总经验</span>
      </div>
    </div>

    <!-- 里程碑提示 -->
    <transition name="milestone">
      <div v-if="showMilestone" class="milestone-alert">
        <div class="milestone-icon">
          <n-icon :component="Trophy" size="24" color="#fbbf24" />
        </div>
        <div class="milestone-content">
          <div class="milestone-title">{{ milestoneTitle }}</div>
          <div class="milestone-description">{{ milestoneDescription }}</div>
        </div>
        <n-button
          size="tiny"
          type="primary"
          @click="dismissMilestone"
        >
          太棒了！
        </n-button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  NIcon, NTag, NCheckbox, NProgress, NTooltip, NButton
} from 'naive-ui'
import {
  Target, Award, Lock, Clock, Flame, Star, Trophy
} from 'lucide-vue-next'

const props = defineProps({
  // 学习目标列表
  goals: {
    type: Array,
    default: () => []
  },
  // 当前会话进度
  progress: {
    type: Number,
    default: 0
  },
  // 本次学习时长（秒）
  sessionTime: {
    type: Number,
    default: 0
  },
  // 连续学习天数
  streak: {
    type: Number,
    default: 0
  },
  // 总经验值
  totalXP: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['toggle-goal', 'complete-milestone'])

const showMilestone = ref(false)
const milestoneTitle = ref('')
const milestoneDescription = ref('')

// 显示的目标列表（最多显示 4 个）
const displayGoals = computed(() => {
  return props.goals.slice(0, 4)
})

// 进度百分比
const progressPercentage = computed(() => {
  return Math.min(Math.max(props.progress, 0), 100)
})

// 目标状态
const goalStatus = computed(() => {
  const completedCount = props.goals.filter(g => g.completed).length
  const totalCount = props.goals.length

  if (completedCount === totalCount && totalCount > 0) {
    return { type: 'success', text: '已完成' }
  } else if (completedCount / totalCount >= 0.5) {
    return { type: 'warning', text: '进行中' }
  } else {
    return { type: 'info', text: '开始学习' }
  }
})

// 格式化时间
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}分钟`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
}

// 切换目标完成状态
function toggleGoal(goal, index) {
  emit('toggle-goal', { goal, index })

  // 检查是否完成所有目标
  checkMilestone()
}

// 检查里程碑
function checkMilestone() {
  const completedCount = props.goals.filter(g => g.completed).length
  const totalCount = props.goals.length

  // 所有目标完成
  if (completedCount === totalCount && totalCount > 0) {
    milestoneTitle.value = '🎉 恭喜！'
    milestoneDescription.value = '你已完成所有学习目标！'
    showMilestone.value = true
  }
  // 完成一半目标
  else if (completedCount / totalCount >= 0.5 && !props.halfWayMilestoneShown) {
    milestoneTitle.value = '👍 进展不错！'
    milestoneDescription.value = '已完成一半的学习目标，继续加油！'
    showMilestone.value = true
  }
}

// 关闭里程碑提示
function dismissMilestone() {
  emit('complete-milestone', {
    title: milestoneTitle.value,
    description: milestoneDescription.value
  })
  showMilestone.value = false
}

// 监听进度变化，自动检查里程碑
watch(() => props.progress, (newProgress) => {
  if (newProgress >= 100 && !showMilestone.value) {
    milestoneTitle.value = '🏆 里程碑达成！'
    milestoneDescription.value = '恭喜你完成本次学习！'
    showMilestone.value = true
  }
})
</script>

<style scoped>
.learning-progress {
  background: rgba(17, 24, 39, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

/* 头部 */
.progress-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #d4d4d8;
  font-weight: 500;
}

/* 进度条 */
.progress-bar-container {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 3px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  min-width: 40px;
  text-align: right;
}

/* 目标列表 */
.goals-list {
  padding: 12px 16px;
  max-height: 240px;
  overflow-y: auto;
}

.goal-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.goal-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.goal-item.completed {
  opacity: 0.7;
  border-color: rgba(16, 185, 129, 0.3);
}

.goal-checkbox {
  padding-top: 2px;
}

.goal-content {
  flex: 1;
  min-width: 0;
}

.goal-title {
  font-size: 13px;
  font-weight: 500;
  color: #d4d4d8;
  margin-bottom: 2px;
}

.goal-item.completed .goal-title {
  text-decoration: line-through;
  color: #71717a;
}

.goal-description {
  font-size: 11px;
  color: #71717a;
  line-height: 1.4;
}

.goal-progress {
  margin-top: 8px;
}

.goal-reward {
  padding-top: 2px;
}

.reward-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(251, 191, 36, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #fbbf24;
  font-weight: 500;
}

.goal-lock {
  padding-top: 2px;
  color: #6b7280;
}

/* 学习统计 */
.learning-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-item span:first-of-type {
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
}

.stat-label {
  font-size: 11px;
  color: #71717a;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
}

/* 里程碑提示 */
.milestone-alert {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.3);
  margin-bottom: 12px;
  white-space: nowrap;
}

.milestone-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.milestone-content {
  flex: 1;
}

.milestone-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}

.milestone-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
}

/* 动画 */
.goal-item-enter-active,
.goal-item-leave-active {
  transition: all 0.3s ease;
}

.goal-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.goal-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.milestone-enter-active,
.milestone-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.milestone-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.8) translateY(20px);
}

.milestone-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.8);
}

/* 滚动条样式 */
.goals-list::-webkit-scrollbar {
  width: 4px;
}

.goals-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.goals-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.goals-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .learning-stats {
    padding: 10px 12px;
  }

  .stat-item span:first-of-type {
    font-size: 13px;
  }

  .stat-label {
    font-size: 10px;
  }

  .milestone-alert {
    left: 16px;
    right: 16px;
    transform: none;
    white-space: normal;
  }
}
</style>
