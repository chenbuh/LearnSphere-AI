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
            <!-- R2/P：锁图标在浅色主题白底上仅 2.5:1，改用主题次要文字色 -->
      <n-icon :component="Lock" :size="size === 'small' ? 12 : 14" color="var(--secondary-text)" />
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
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.achievement-badge.unlocked {
  background: var(--card-bg);
  border-color: rgba(16, 185, 129, 0.2);
}

.achievement-badge:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.1);
}

.achievement-badge.unlocked:hover {
  border-color: rgba(16, 185, 129, 0.4);
}

:global(html[data-theme='light'] .achievement-badge) {
  border-color: rgba(148, 163, 184, 0.16);
  /* R6：固定深色半透明底在浅色主题下与深色正文冲突，改用卡片底 */
  background: var(--card-bg);
}

:global(html[data-theme='light'] .achievement-badge.unlocked) {
  border-color: rgba(16, 185, 129, 0.2);
}

:global(html[data-theme='light'] .achievement-badge:hover) {
  border-color: rgba(30, 107, 82, 0.18);
}

/* 尺寸变体 */
.achievement-badge.small .badge-content {
  padding: 12px;
  gap: 12px;
}
.achievement-badge.small .badge-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
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
  border-radius: var(--radius-lg);
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
  background: transparent;
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
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-text);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

:global(html[data-theme='light'] .badge-icon) {
  background: rgba(241, 245, 249, 0.92);
  border-color: rgba(148, 163, 184, 0.16);
}

.achievement-badge.unlocked .badge-icon {
  background: var(--card-bg);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--tone-emerald);
}

.achievement-badge.unlocked:hover .badge-icon {
  transform: scale(1.05) rotate(5deg);
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

:global(html[data-theme='light'] .lock-overlay) {
  background: #ffffff;
  border-color: rgba(148, 163, 184, 0.24);
}

.badge-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px 12px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.badge-title {
  flex: 1 1 180px;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--secondary-text);
  letter-spacing: 0.3px;
  transition: color 0.3s;
  overflow-wrap: anywhere;
}

.achievement-badge.unlocked .badge-title {
  color: var(--text-color);
}

/* R3：补齐空的浅色兜底块，保持「已解锁正文色 / 未解锁次要色」的层级 */
:global(html[data-theme='light'] .badge-title) {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .achievement-badge.unlocked .badge-title) {
  color: var(--text-color);
}

.badge-description {
  font-size: 12px;
  color: var(--secondary-text);
  line-height: 1.5;
  margin-bottom: auto;
  min-height: 36px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.achievement-badge.unlocked .badge-description {
  color: var(--secondary-text);
}

:global(html[data-theme='light'] .badge-description),
:global(html[data-theme='light'] .achievement-badge.unlocked .badge-description),
:global(html[data-theme='light'] .progress-label) {
  color: var(--secondary-text);
}

.badge-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
}

.reward-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-lg);
  font-size: 11px;
  font-weight: 600;
  color: var(--tone-amber);
  white-space: nowrap;
  max-width: 100%;
}

/* 进度条自定义 */
.badge-progress-wrap {
  margin-top: 10px;
  margin-bottom: 2px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11px;
  margin-bottom: 6px;
}

.progress-label {
  color: var(--secondary-text);
  min-width: 0;
  overflow-wrap: anywhere;
}

.progress-text {
  color: var(--brand);
  font-weight: 600;
  font-family: monospace;
  flex-shrink: 0;
}

.progress-track {
  height: 4px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 2px;
  overflow: hidden;
}

:global(html[data-theme='light'] .progress-track) {
  background: rgba(226, 232, 240, 0.92);
}

.progress-fill {
  height: 100%;
  background: var(--brand);
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.unlock-time {
  font-size: 11px;
  color: var(--tone-emerald);
  /* R8：去掉 opacity，避免把 emerald 文字的对比度压到阈值以下 */
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.5;
  overflow-wrap: anywhere;
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

  .badge-header {
    margin-bottom: 2px;
  }

  .badge-icon {
    width: 48px;
    height: 48px;
  }

  .badge-description {
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .badge-content {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 10px;
    padding: 11px;
  }

  .badge-container {
    padding-top: 1px;
  }

  .badge-icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
  }

  .achievement-badge.small .badge-content {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 10px;
    padding: 10px;
  }

  .achievement-badge.small .badge-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
  }

  .badge-title {
    font-size: 14px;
    line-height: 1.35;
  }

  .badge-description {
    font-size: 11px;
    line-height: 1.45;
  }

  .badge-meta {
    width: 100%;
  }

  .reward-tag {
    white-space: normal;
    line-height: 1.35;
  }

  .badge-progress-wrap {
    margin-top: 8px;
  }

  .progress-info {
    font-size: 10px;
    margin-bottom: 5px;
  }

  .unlock-time {
    font-size: 10px;
    margin-top: 8px;
  }
}

@media (max-width: 360px) {
  .badge-content {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 9px;
    padding: 10px;
  }

  .badge-icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
  }

  .badge-title {
    font-size: 13px;
  }

  .badge-description {
    font-size: 11px;
  }

  .reward-tag {
    padding: 2px 7px;
    font-size: 10px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .badge-content {
    gap: 12px;
    padding: 12px 13px;
  }

  .badge-icon {
    width: 46px;
    height: 46px;
  }

  .badge-title {
    font-size: 14px;
  }

  .badge-description {
    min-height: auto;
    font-size: 11px;
    line-height: 1.4;
  }

  .badge-progress-wrap {
    margin-top: 8px;
  }
}
</style>

