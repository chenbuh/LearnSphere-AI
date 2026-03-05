<template>
  <div class="achievement-badge" :class="[size, { unlocked: achievement.unlocked, locked: !achievement.unlocked }]">
    <!-- 背景光效 -->
    <div class="badge-bg-glow" v-if="achievement.unlocked"></div>

    <div class="badge-content">
      <!-- 徽章外框 -->
      <div class="badge-container">
        <!-- 徽章图标 -->
        <div class="badge-icon">
          <component :is="getBadgeIcon(achievement.type)" :size="size === 'small' ? 24 : 32" stroke-width="1.5" />
          <!-- 锁定状态遮罩 -->
          <div v-if="!achievement.unlocked" class="lock-overlay">
            <n-icon :component="Lock" :size="size === 'small' ? 12 : 14" color="#9ca3af" />
          </div>
        </div>
      </div>

      <!-- 徽章信息 -->
      <div class="badge-info">
        <div class="badge-header">
          <div class="badge-title">{{ achievement.title }}</div>
          <!-- 解锁时间 / 奖励 -->
          <div v-if="achievement.unlocked" class="badge-meta">
            <span v-if="achievement.reward" class="reward-tag">
              +{{ achievement.reward.xp }} XP
            </span>
          </div>
        </div>

        <div class="badge-description">{{ achievement.description }}</div>

        <!-- 进度条（未解锁时显示） -->
        <div v-if="!achievement.unlocked && achievement.progress !== undefined" class="badge-progress-wrap">
          <div class="progress-info">
            <span class="progress-label">解锁进度</span>
            <span class="progress-text">{{ achievement.progress }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: achievement.progress + '%' }"></div>
          </div>
        </div>

        <!-- 解锁时间 -->
        <div v-if="achievement.unlocked && achievement.unlockedAt" class="unlock-time">
          解锁于 {{ formatUnlockTime(achievement.unlockedAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
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
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)} 分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)} 小时前`
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
  position: relative;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.achievement-badge.unlocked {
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
  border-color: rgba(16, 185, 129, 0.2);
}

.achievement-badge:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}

.achievement-badge.unlocked:hover {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15);
}

/* 尺寸变体 */
.achievement-badge.small .badge-content {
  padding: 12px;
  gap: 12px;
}
.achievement-badge.small .badge-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
}
.achievement-badge.small .badge-title {
  font-size: 14px;
}

.achievement-badge.large .badge-content {
  padding: 20px;
  gap: 20px;
}
.achievement-badge.large .badge-icon {
  width: 68px;
  height: 68px;
  border-radius: 18px;
}
.achievement-badge.large .badge-title {
  font-size: 16px;
}

/* 光晕效果 */
.badge-bg-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
  transform: translate(30%, -30%);
  pointer-events: none;
  z-index: 0;
}

.badge-content {
  position: relative;
  display: flex;
  gap: 16px;
  padding: 16px;
  z-index: 1;
}

.badge-container {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
}

.badge-icon {
  position: relative;
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.achievement-badge.unlocked .badge-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.05) 100%);
  border-color: rgba(16, 185, 129, 0.3);
  color: #34d399;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15), inset 0 0 10px rgba(16, 185, 129, 0.05);
}

.achievement-badge.unlocked:hover .badge-icon {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 0 25px rgba(16, 185, 129, 0.25), inset 0 0 10px rgba(16, 185, 129, 0.1);
}

.lock-overlay {
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #1e293b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #0f172a;
}

.badge-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.badge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.badge-title {
  font-size: 15px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.3px;
  transition: color 0.3s;
}

.achievement-badge.unlocked .badge-title {
  color: #f8fafc;
}

.badge-description {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: auto;
  min-height: 36px;
}

.achievement-badge.unlocked .badge-description {
  color: #94a3b8;
}

.badge-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reward-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #fbbf24;
  white-space: nowrap;
}

/* 进度条自定义 */
.badge-progress-wrap {
  margin-top: 10px;
  margin-bottom: 2px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 6px;
}

.progress-label {
  color: #64748b;
}

.progress-text {
  color: #38bdf8;
  font-weight: 600;
  font-family: monospace;
}

.progress-track {
  height: 4px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #8b5cf6);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.unlock-time {
  font-size: 11px;
  color: #10b981;
  opacity: 0.8;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.unlock-time::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}

@media (max-width: 768px) {
  .badge-content {
    padding: 12px;
    gap: 12px;
  }
  .badge-icon {
    width: 48px;
    height: 48px;
  }
}
</style>

