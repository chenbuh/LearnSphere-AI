<template>
  <div class="achievements-showcase">
    <!-- 头部 -->
    <div class="showcase-header">
      <div class="header-left">
        <n-icon :component="Trophy" size="20" color="#fbbf24" />
        <h3 class="header-title">成就徽章</h3>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <span class="stat-value">{{ unlockedCount }}</span>
          <span class="stat-label">已解锁</span>
        </div>
        <div class="stat-divider">/</div>
        <div class="stat-item">
          <span class="stat-value">{{ achievements.length }}</span>
          <span class="stat-label">总数</span>
        </div>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <div
        v-for="category in categories"
        :key="category.key"
        :class="['category-tab', { active: selectedCategory === category.key }]"
        @click="selectedCategory = category.key"
      >
        <n-icon :component="category.icon" size="16" />
        <span>{{ category.label }}</span>
        <span class="category-count">{{ getCategoryCount(category.key) }}</span>
      </div>
    </div>

    <!-- 成就列表 -->
    <transition-group name="achievement-list" tag="div" class="achievements-list">
      <AchievementBadge
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        :achievement="achievement"
        :size="listSize"
      />
    </transition-group>

    <!-- 空状态 -->
    <div v-if="filteredAchievements.length === 0" class="empty-state">
      <n-icon :component="Trophy" size="48" color="#6b7280" />
      <p>暂无该分类的成就</p>
      <p class="hint">继续学习，解锁更多成就！</p>
    </div>

    <!-- 最新解锁提示 -->
    <transition name="slide-down">
      <div v-if="newlyUnlocked" class="new-unlock-banner">
        <div class="banner-content">
          <div class="banner-icon">
            <n-icon :component="Sparkles" size="24" color="#fbbf24" />
          </div>
          <div class="banner-text">
            <div class="banner-title">新成就解锁！</div>
            <div class="banner-description">{{ newlyUnlocked.title }}</div>
          </div>
        </div>
        <n-button size="small" @click="dismissNewUnlock">
          太棒了！
        </n-button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { NIcon, NButton } from 'naive-ui'
import { Trophy, Flame, Target, Star, Crown, Sparkles, BookOpen } from 'lucide-vue-next'
import AchievementBadge from './AchievementBadge.vue'

const props = defineProps({
  achievements: {
    type: Array,
    default: () => []
  },
  size: {
    type: String,
    default: 'medium'
  }
})

// 分类
const categories = [
  { key: 'all', label: '全部', icon: Trophy },
  { key: 'milestone', label: '里程碑', icon: Target },
  { key: 'daily', label: '每日', icon: Flame },
  { key: 'special', label: '特殊', icon: Crown },
  { key: 'learning', label: '学习', icon: BookOpen }
]

const selectedCategory = ref('all')
const newlyUnlocked = ref(null)
const listSize = ref(props.size)

// 已解锁数量
const unlockedCount = computed(() => {
  return props.achievements.filter(a => a.unlocked).length
})

// 过滤后的成就列表
const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'all') {
    return props.achievements
  }
  return props.achievements.filter(a => a.category === selectedCategory.value)
})

// 获取分类数量
function getCategoryCount(category) {
  if (category === 'all') {
    return props.achievements.length
  }
  return props.achievements.filter(a => a.category === category).length
}

// 解锁新成就
function unlockAchievement(achievementId) {
  const achievement = props.achievements.find(a => a.id === achievementId)
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true
    achievement.unlockedAt = Date.now()
    newlyUnlocked.value = achievement

    // 播放解锁音效
    playUnlockSound()
  }
}

// 播放解锁音效
function playUnlockSound() {
  // 使用 Web Audio API 播放成就解锁音效
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = 'sine'
  gainNode.gain.value = 0.3

  oscillator.start()
  oscillator.stop(audioContext.currentTime + 0.2)
}

// 关闭新解锁提示
function dismissNewUnlock() {
  newlyUnlocked.value = null
}

// 暴露方法给父组件
defineExpose({
  unlockAchievement
})

onMounted(() => {
  // 检查是否有新解锁的成就
  const justUnlocked = props.achievements.find(a => {
    return a.unlocked && a.unlockedAt && (Date.now() - a.unlockedAt) < 5000
  })
  if (justUnlocked) {
    newlyUnlocked.value = justUnlocked
  }
})
</script>

<style scoped>
.achievements-showcase {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 头部 */
.showcase-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #fbbf24;
}

.stat-label {
  font-size: 11px;
  color: #9ca3af;
}

.stat-divider {
  color: #6b7280;
  font-size: 16px;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #d4d4d8;
}

.category-tab.active {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.category-count {
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

/* 成就列表 */
.achievements-list {
  display: grid;
  gap: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state p {
  margin: 12px 0 0;
  font-size: 14px;
}

.empty-state .hint {
  font-size: 12px;
  color: #6b7280;
}

/* 新解锁提示 */
.new-unlock-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
  z-index: 1000;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  color: #ffffff;
}

.banner-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.banner-description {
  font-size: 12px;
  opacity: 0.9;
}

/* 动画 */
.achievement-list-enter-active,
.achievement-list-leave-active {
  transition: all 0.3s ease;
}

.achievement-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.achievement-list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .achievements-showcase {
    padding: 16px;
  }

  .showcase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .category-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .new-unlock-banner {
    left: 16px;
    right: 16px;
    transform: none;
  }
}
</style>
