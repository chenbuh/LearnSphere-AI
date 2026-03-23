<script setup>
import { NIcon } from 'naive-ui'
import { Award, Flame, Mic, Sparkles, Star, Target, TrendingUp, User, Zap } from 'lucide-vue-next'

defineProps({
  achievements: {
    type: Array,
    default: () => []
  }
})

const achievementIcons = {
  Zap,
  TrendingUp,
  Target,
  Award,
  Flame,
  Star,
  User,
  Mic,
  Sparkles
}

const getIconComponent = iconName => achievementIcons[iconName] || Zap
const getAchievementProgress = achievement => {
  if (!achievement?.conditionValue) {
    return '0%'
  }

  const progress = Math.min(((achievement.currentValue || 0) / achievement.conditionValue) * 100, 100)
  return `${progress}%`
}
</script>

<template>
  <div class="py-4">
    <div v-if="achievements.length > 0" class="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="achievement in achievements"
        :key="achievement.id"
        class="achievement-card"
        :class="{ unlocked: achievement.status === 1 }"
      >
        <div class="badge-icon" :class="achievement.status === 1 ? `badge-gradient-${achievement.id % 4 + 1}` : 'bg-white/10'">
          <n-icon :component="getIconComponent(achievement.icon)" :class="achievement.status === 1 ? 'text-white' : 'text-gray-500'" :size="32" />
        </div>
        <div class="badge-info">
          <h3 class="text-white">{{ achievement.name }}</h3>
          <p class="text-gray-400 text-xs">{{ achievement.description }}</p>
          <template v-if="achievement.status === 1">
            <div class="badge-date text-indigo-400 font-bold text-xs">
              {{ achievement.unlockedTime ? new Date(achievement.unlockedTime).toLocaleDateString() : '已解锁' }} 获得
            </div>
          </template>
          <template v-else>
            <div class="flex justify-between items-center mb-1">
              <span class="text-[10px] text-gray-500">{{ achievement.currentValue || 0 }} / {{ achievement.conditionValue }}</span>
            </div>
            <div class="progress-bar-bg h-1 bg-white/5 rounded-full overflow-hidden">
              <div class="progress-bar-fill h-full bg-indigo-500" :style="{ width: getAchievementProgress(achievement) }"></div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 opacity-40">
      <Award :size="64" class="mx-auto mb-4" />
      <p>努力学习，获得你的第一枚成就勋章！</p>
    </div>
  </div>
</template>

<style scoped>
.achievement-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.achievement-card:not(.unlocked) {
  opacity: 0.5;
}

.achievement-card.unlocked {
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.badge-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-gradient-1 {
  background: linear-gradient(135deg, #6366f1, #a855f7);
}

.badge-gradient-2 {
  background: linear-gradient(135deg, #f59e0b, #ef4444);
}

.badge-gradient-3 {
  background: linear-gradient(135deg, #10b981, #3b82f6);
}

.badge-gradient-4 {
  background: linear-gradient(135deg, #ff4d91, #ff904d);
}

.badge-info h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.badge-info p {
  margin: 0 0 8px;
  font-size: 0.75rem;
  color: #a1a1aa;
}

:global(html[data-theme='light'] .achievement-card) {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 20px 44px -34px rgba(15, 23, 42, 0.24);
}

:global(html[data-theme='light'] .achievement-card.unlocked) {
  background: linear-gradient(180deg, rgba(238, 242, 255, 0.92), rgba(255, 255, 255, 0.95));
  border-color: rgba(99, 102, 241, 0.26);
}

:global(html[data-theme='light'] .achievement-card:not(.unlocked)) {
  opacity: 0.82;
}

:global(html[data-theme='light'] .badge-info h3),
:global(html[data-theme='light'] .text-center p) {
  color: #18243d !important;
}

:global(html[data-theme='light'] .badge-info p),
:global(html[data-theme='light'] .text-center) {
  color: #64748b;
}

:global(html[data-theme='light'] .badge-icon.bg-white\/10) {
  background: rgba(226, 232, 240, 0.88);
}

:global(html[data-theme='light'] .progress-bar-bg) {
  background: rgba(226, 232, 240, 0.9) !important;
}
</style>
