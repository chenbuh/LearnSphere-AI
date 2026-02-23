<template>
  <div class="achievement-badge" :class="[size, { unlocked: achievement.unlocked }]">
    <!-- 徽章外框 -->
    <div class="badge-container">
      <!-- 锁定状态遮罩 -->
      <div v-if="!achievement.unlocked" class="lock-overlay">
        <n-icon :component="Lock" size="24" color="#6b7280" />
      </div>

      <!-- 徽章图标 -->
      <div class="badge-icon">
        <component :is="getBadgeIcon(achievement.type)" size="32" />
      </div>

      <!-- 光晕效果 -->
      <div v-if="achievement.unlocked" class="badge-glow"></div>
    </div>

    <!-- 徽章信息 -->
    <div class="badge-info">
      <div class="badge-title">{{ achievement.title }}</div>
      <div class="badge-description">{{ achievement.description }}</div>

      <!-- 进度条（未解锁时显示） -->
      <div v-if="!achievement.unlocked && achievement.progress !== undefined" class="badge-progress">
        <n-progress
          type="line"
          :percentage="achievement.progress"
          :show-indicator="false"
          :height="4"
          rail-color="#374151"
          color="#10b981"
        />
        <div class="progress-text">
          <span>{{ achievement.progress }}%</span>
        </div>
      </div>

      <!-- 奖励信息（解锁后显示） -->
      <div v-if="achievement.unlocked && achievement.reward" class="badge-reward">
        <n-icon :component="Award" size="14" color="#fbbf24" />
        <span>+{{ achievement.reward.xp }} XP</span>
      </div>

      <!-- 解锁时间 -->
      <div v-if="achievement.unlocked && achievement.unlockedAt" class="unlock-time">
        {{ formatUnlockTime(achievement.unlockedAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NIcon, NProgress } from 'naive-ui'
import {
  Lock, Award, Trophy, Target, Flame, Star, Zap, Crown,
  BookOpen, Headphones, MessageSquare, Sparkles
} from 'lucide-vue-next'

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

// 徽章类型图标映射
const badgeIcons = {
  milestone: Trophy,
  daily: Flame,
  streak: Zap,
  perfect: Star,
  speed: Target,
  learning: BookOpen,
  listening: Headphones,
  speaking: MessageSquare,
  special: Crown,
  default: Sparkles
}

function getBadgeIcon(type) {
  return badgeIcons[type] || badgeIcons.default
}

// 格式化解锁时间
function formatUnlockTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) {
    return '刚刚解锁'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前解锁`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前解锁`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
.achievement-badge {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.achievement-badge:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.achievement-badge.unlocked {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border-color: rgba(16, 185, 129, 0.3);
}

/* 尺寸变体 */
.achievement-badge.small {
  padding: 12px;
  gap: 12px;
}

.achievement-badge.small .badge-icon {
  width: 48px;
  height: 48px;
}

.achievement-badge.large {
  padding: 20px;
  gap: 20px;
}

.achievement-badge.large .badge-icon {
  width: 72px;
  height: 72px;
}

/* 徽章容器 */
.badge-container {
  position: relative;
  flex-shrink: 0;
}

.badge-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.achievement-badge.unlocked .badge-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: #10b981;
  color: #ffffff;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
}

/* 光晕效果 */
.badge-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  opacity: 0.3;
  filter: blur(8px);
  animation: glow-pulse 2s infinite;
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

/* 锁定遮罩 */
.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 徽章信息 */
.badge-info {
  flex: 1;
  min-width: 0;
}

.badge-title {
  font-size: 14px;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 4px;
}

.badge-description {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  margin-bottom: 8px;
}

.achievement-badge.unlocked .badge-description {
  color: #d4d4d8;
}

/* 进度条 */
.badge-progress {
  margin-top: 8px;
}

.progress-text {
  font-size: 11px;
  color: #10b981;
  margin-top: 4px;
  text-align: right;
}

/* 奖励 */
.badge-reward {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #fbbf24;
  font-weight: 500;
  margin-top: 8px;
}

/* 解锁时间 */
.unlock-time {
  font-size: 11px;
  color: #71717a;
  margin-top: 8px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .achievement-badge {
    padding: 12px;
    gap: 12px;
  }

  .badge-icon {
    width: 48px;
    height: 48px;
  }

  .badge-title {
    font-size: 13px;
  }

  .badge-description {
    font-size: 11px;
  }
}
</style>
