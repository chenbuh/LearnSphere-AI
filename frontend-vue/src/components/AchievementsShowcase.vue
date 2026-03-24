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
        <span class="category-label">{{ category.label }}</span>
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
        <n-button class="banner-action" size="small" @click="dismissNewUnlock">
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
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.98)),
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.14), transparent 36%);
  border-radius: 22px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:global(html[data-theme='light'] .achievements-showcase) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.1), transparent 36%);
  border-color: rgba(148, 163, 184, 0.16);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
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
  min-width: 0;
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
}

:global(html[data-theme='light'] .header-title) {
  color: #182132;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
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

:global(html[data-theme='light'] .stat-label),
:global(html[data-theme='light'] .empty-state),
:global(html[data-theme='light'] .empty-state .hint) {
  color: #64748b;
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
  scroll-snap-type: x proximity;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  scroll-snap-align: start;
  flex: 0 0 auto;
}

:global(html[data-theme='light'] .category-tab) {
  background: rgba(255, 255, 255, 0.84);
  border-color: rgba(148, 163, 184, 0.16);
  color: #64748b;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.category-tab:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #d4d4d8;
}

:global(html[data-theme='light'] .category-tab:hover) {
  background: rgba(255, 255, 255, 0.98);
  color: #182132;
}

.category-tab.active {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.category-label {
  min-width: 0;
  overflow-wrap: anywhere;
}

.category-count {
  flex-shrink: 0;
  font-size: 11px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

:global(html[data-theme='light'] .category-count) {
  background: rgba(241, 245, 249, 0.96);
  color: #64748b;
}

/* 成就列表 */
.achievements-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
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
  width: min(420px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
  z-index: 1000;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
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
  min-width: 0;
}

.banner-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.banner-description {
  font-size: 12px;
  opacity: 0.9;
  overflow-wrap: anywhere;
}

.banner-action {
  flex-shrink: 0;
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
    padding: clamp(14px, 4vw, 16px);
    border-radius: 18px;
  }

  .showcase-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-left {
    width: 100%;
  }

  .header-title {
    font-size: 18px;
  }

  .header-stats {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .stat-divider {
    display: none;
  }

  .stat-item {
    align-items: flex-start;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  :global(html[data-theme='light'] .stat-item) {
    background: rgba(255, 255, 255, 0.84);
    border-color: rgba(148, 163, 184, 0.16);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  }

  .category-tabs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(132px, 100%), 1fr));
    overflow: visible;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 14px;
    padding-bottom: 0;
    scroll-snap-type: none;
  }

  .category-tab {
    min-width: 0;
    justify-content: center;
    padding: 8px 12px;
    font-size: 12px;
    white-space: normal;
  }

  .achievements-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .new-unlock-banner {
    top: auto;
    left: 16px;
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    width: auto;
    max-width: none;
    transform: none;
    align-items: flex-start;
    padding: 14px 16px;
    border-radius: 14px;
  }

  .banner-content {
    align-items: flex-start;
  }

  .banner-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .slide-down-enter-from,
  .slide-down-leave-to {
    opacity: 0;
    transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px)));
  }
}

@media (max-width: 480px) {
  .achievements-showcase {
    padding: 14px;
    border-radius: 16px;
  }

  .showcase-header {
    gap: 10px;
  }

  .header-stats {
    gap: 8px;
  }

  .stat-item {
    padding: 9px 10px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 10px;
  }

  .category-tab {
    gap: 4px;
    padding: 7px 10px;
  }

  .category-label {
    line-height: 1.2;
  }

  .category-count {
    padding: 1px 5px;
  }

  .new-unlock-banner {
    left: 10px;
    right: 10px;
    bottom: calc(10px + env(safe-area-inset-bottom, 0px));
    flex-direction: column;
    gap: 12px;
  }

  .banner-action {
    width: 100%;
  }
}

@media (max-width: 360px) {
  .category-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .category-tab {
    font-size: 11px;
  }

  .new-unlock-banner {
    padding: 12px 14px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .achievements-showcase {
    padding: 14px 16px;
  }

  .showcase-header {
    flex-direction: row;
    align-items: flex-start;
    gap: 16px;
  }

  .header-left {
    width: auto;
    flex: 1;
  }

  .header-stats {
    width: auto;
    min-width: 180px;
  }

  .category-tabs {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 6px;
    margin-bottom: 12px;
  }

  .category-tab {
    min-height: 40px;
  }

  .achievements-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .empty-state {
    padding: 32px 16px;
  }
}
</style>
