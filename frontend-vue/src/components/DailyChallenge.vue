<template>
  <div class="daily-challenge">
    <!-- 头部 -->
    <div class="challenge-header">
      <div class="header-left">
        <div class="challenge-icon">
          <n-icon :component="targetIcon" size="24" color="#fbbf24" />
        </div>
        <div class="header-info">
          <h3 class="header-title">每日挑战</h3>
          <div class="header-subtitle">
            <span>{{ challenge.title }}</span>
            <span class="difficulty-badge" :class="challenge.difficulty">
              {{ difficultyText }}
            </span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <!-- 倒计时 -->
        <div class="countdown">
          <n-icon :component="Clock" size="14" color="#f97316" />
          <span>{{ timeRemaining }}</span>
        </div>
      </div>
    </div>

    <!-- 挑战进度 -->
    <div class="challenge-progress">
      <div class="progress-info">
        <span class="progress-label">挑战进度</span>
        <span class="progress-value">{{ challenge.progress }}/{{ challenge.target }}</span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        >
          <div class="progress-shine"></div>
        </div>
      </div>
      <div class="progress-percentage">{{ progressPercentage }}%</div>
    </div>

    <!-- 挑战描述 -->
    <div class="challenge-description">
      <p>{{ challenge.description }}</p>
    </div>

    <!-- 挑战任务列表 -->
    <div class="challenge-tasks">
      <div class="tasks-header">
        <n-icon :component="ListChecks" size="16" />
        <span>任务清单</span>
        <span class="tasks-count">{{ completedTasks }}/{{ challenge.tasks?.length || 0 }}</span>
      </div>
      <div class="tasks-list">
        <div
          v-for="(task, index) in challenge.tasks"
          :key="index"
          :class="['task-item', { completed: task.completed }]"
          @click="toggleTask(index)"
        >
          <div class="task-checkbox">
            <n-checkbox :checked="task.completed" @update:checked="toggleTask(index)" />
          </div>
          <div class="task-content">
            <div class="task-title">{{ task.title }}</div>
            <div class="task-reward" v-if="task.reward">
              <n-icon :component="Award" size="12" color="#fbbf24" />
              <span>+{{ task.reward.xp }} XP</span>
            </div>
          </div>
          <div class="task-status">
            <n-icon
              :component="task.completed ? CheckCircle : Circle"
              :size="20"
              :color="task.completed ? '#10b981' : '#6b7280'"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 奖励预览 -->
    <transition name="reward-expand">
      <div v-if="showRewards" class="challenge-rewards">
        <div class="rewards-header">
          <n-icon :component="Gift" size="16" color="#f472b6" />
          <span>完成奖励</span>
        </div>
        <div class="rewards-list">
          <div v-for="(reward, index) in challenge.rewards" :key="index" class="reward-item">
            <div class="reward-icon">
              <n-icon :component="getRewardIcon(reward.type)" size="20" />
            </div>
            <div class="reward-info">
              <div class="reward-name">{{ reward.name }}</div>
              <div class="reward-value">{{ reward.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 操作按钮 -->
    <div class="challenge-actions">
      <!-- 奖励预览切换 -->
      <n-button
        quaternary
        @click="showRewards = !showRewards"
        class="rewards-toggle"
      >
        <template #icon>
          <n-icon :component="showRewards ? ChevronUp : ChevronDown" size="16" />
        </template>
        {{ showRewards ? '隐藏' : '查看' }}奖励
      </n-button>

      <!-- 开始挑战/继续挑战 -->
      <n-button
        v-if="!challenge.started"
        type="primary"
        size="large"
        @click="startChallenge"
        :disabled="challenge.completed"
      >
        <template #icon>
          <n-icon :component="Play" size="18" />
        </template>
        开始挑战
      </n-button>
      <n-button
        v-else-if="!challenge.completed"
        type="success"
        size="large"
        @click="continueChallenge"
      >
        <template #icon>
          <n-icon :component="Play" size="18" />
        </template>
        继续挑战
      </n-button>
      <n-button
        v-else
        type="info"
        size="large"
        disabled
      >
        <template #icon>
          <n-icon :component="CheckCircle" size="18" />
        </template>
        已完成
      </n-button>
    </div>

    <!-- 完成动画弹窗 -->
    <n-modal v-model:show="showCompletionModal" preset="dialog" :show-icon="false">
      <template #header>
        <div class="completion-header">
          <n-icon :component="PartyPopper" size="32" color="#fbbf24" />
          <span>挑战完成！</span>
        </div>
      </template>
      <div class="completion-content">
        <p class="completion-message">恭喜你完成今日挑战！</p>
        <div class="completion-rewards">
          <div v-for="(reward, index) in challenge.rewards" :key="index" class="completion-reward">
            <n-icon :component="getRewardIcon(reward.type)" size="24" color="#fbbf24" />
            <span>{{ reward.value }}</span>
          </div>
        </div>
      </div>
      <template #action>
        <n-button type="primary" size="large" @click="claimRewards">
          领取奖励
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  NIcon, NButton, NCheckbox, NModal
} from 'naive-ui'
import {
  Clock, ListChecks, Award, Gift, Play, ChevronUp, ChevronDown,
  CheckCircle, Circle, PartyPopper, Target, Trophy, Flame, Star
} from 'lucide-vue-next'

const props = defineProps({
  challenge: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['start', 'continue', 'complete', 'claim'])

const showRewards = ref(false)
const showCompletionModal = ref(false)

// 倒计时
const timeRemaining = ref('')
let countdownTimer = null

// 难度文本
const difficultyText = computed(() => {
  const difficultyMap = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家'
  }
  return difficultyMap[props.challenge.difficulty] || '中等'
})

// 目标图标
const targetIcon = computed(() => {
  const iconMap = {
    milestone: Trophy,
    daily: Flame,
    special: Star
  }
  return iconMap[props.challenge.type] || Target
})

// 进度百分比
const progressPercentage = computed(() => {
  return Math.min(Math.floor((props.challenge.progress / props.challenge.target) * 100), 100)
})

// 已完成任务数
const completedTasks = computed(() => {
  return props.challenge.tasks?.filter(t => t.completed).length || 0
})

// 获取奖励图标
function getRewardIcon(type) {
  const iconMap = {
    xp: Award,
    badge: Trophy,
    streak: Flame
  }
  return iconMap[type] || Award
}

// 切换任务状态
function toggleTask(index) {
  if (props.challenge.tasks && props.challenge.tasks[index]) {
    const task = props.challenge.tasks[index]
    task.completed = !task.completed

    // 更新进度
    props.challenge.progress = props.challenge.tasks.filter(t => t.completed).length

    // 检查是否全部完成
    if (props.challenge.progress >= props.challenge.target) {
      completeChallenge()
    }
  }
}

// 开始挑战
function startChallenge() {
  emit('start', props.challenge)
}

// 继续挑战
function continueChallenge() {
  emit('continue', props.challenge)
}

// 完成挑战
function completeChallenge() {
  props.challenge.completed = true
  showCompletionModal.value = true
  emit('complete', props.challenge)

  // 播放完成音效
  playCompletionSound()
}

// 领取奖励
function claimRewards() {
  emit('claim', props.challenge)
  showCompletionModal.value = false
}

// 播放完成音效
function playCompletionSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  // 创建简单的成功音效
  const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = freq
    oscillator.type = 'sine'
    gainNode.gain.value = 0.2

    oscillator.start(audioContext.currentTime + index * 0.1)
    oscillator.stop(audioContext.currentTime + index * 0.1 + 0.2)
  })
}

// 更新倒计时
function updateCountdown() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const diff = tomorrow - now

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  timeRemaining.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

onMounted(() => {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.daily-challenge {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 头部 */
.challenge-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  gap: 16px;
}

.challenge-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%);
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info {
  flex: 1;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0 0 6px 0;
}

.header-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #d4d4d8;
}

.difficulty-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.difficulty-badge.easy {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.difficulty-badge.medium {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.difficulty-badge.hard {
  background: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.difficulty-badge.expert {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #f97316;
}

/* 进度 */
.challenge-progress {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 13px;
  color: #9ca3af;
}

.progress-value {
  font-size: 14px;
  font-weight: 600;
  color: #fbbf24;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 4px;
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

.progress-percentage {
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  margin-top: 8px;
}

/* 描述 */
.challenge-description {
  margin-bottom: 16px;
}

.challenge-description p {
  font-size: 14px;
  color: #d4d4d8;
  line-height: 1.6;
  margin: 0;
}

/* 任务列表 */
.challenge-tasks {
  margin-bottom: 20px;
}

.tasks-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #d4d4d8;
  margin-bottom: 12px;
}

.tasks-count {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 4px;
  font-size: 12px;
  color: #10b981;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.task-item.completed {
  opacity: 0.7;
  border-color: rgba(16, 185, 129, 0.3);
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 13px;
  color: #d4d4d8;
  margin-bottom: 4px;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #71717a;
}

.task-reward {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #fbbf24;
}

.task-status {
  flex-shrink: 0;
}

/* 奖励 */
.challenge-rewards {
  background: rgba(251, 114, 182, 0.05);
  border: 1px solid rgba(251, 114, 182, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.rewards-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #f472b6;
  margin-bottom: 12px;
}

.rewards-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.reward-icon {
  width: 36px;
  height: 36px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 2px;
}

.reward-value {
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
}

/* 操作按钮 */
.challenge-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.rewards-toggle {
  flex: 1;
}

/* 完成弹窗 */
.completion-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #fbbf24;
}

.completion-content {
  text-align: center;
  padding: 20px 0;
}

.completion-message {
  font-size: 16px;
  color: #d4d4d8;
  margin-bottom: 20px;
}

.completion-rewards {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.completion-reward {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.completion-reward span {
  font-size: 14px;
  font-weight: 600;
  color: #fbbf24;
}

/* 动画 */
.reward-expand-enter-active,
.reward-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.reward-expand-enter-from,
.reward-expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.reward-expand-enter-to,
.reward-expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .daily-challenge {
    padding: 16px;
  }

  .challenge-header {
    flex-direction: column;
    gap: 12px;
  }

  .header-left {
    flex-direction: column;
    gap: 12px;
  }

  .challenge-icon {
    width: 48px;
    height: 48px;
  }

  .challenge-actions {
    flex-direction: column;
  }

  .rewards-toggle {
    width: 100%;
  }

  .rewards-list {
    grid-template-columns: 1fr;
  }
}
</style>
