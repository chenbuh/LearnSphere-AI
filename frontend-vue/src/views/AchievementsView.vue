<script setup>
import { ref, onMounted } from 'vue'
import { 
  NCard, NSpace, NAvatar, NTag, NSpin, NProgress, NEmpty, NGrid, NGridItem, 
  useMessage, NIcon, NTooltip, NNumberAnimation, NDivider, NButton
} from 'naive-ui'
import { 
  Trophy, Medal, Star, Target, Zap, Award, Sparkles, 
  ChevronLeft, Flame, BookOpen, Mic, Share2
} from 'lucide-vue-next'
import { achievementApi } from '@/api/achievement'
import { useRouter } from 'vue-router'
import SharePosterModal from '@/components/SharePosterModal.vue'

const message = useMessage()
const router = useRouter()
const loading = ref(false)
const achievements = ref([])
const posterModalRef = ref(null)

const fetchAchievements = async () => {
    loading.value = true
    try {
        const res = await achievementApi.getMyAchievements()
        if (res.code === 200) {
            achievements.value = res.data
        }
    } catch (e) {
        message.error('加载荣誉室失败')
    } finally {
        loading.value = false
    }
}

const getIcon = (type) => {
    const map = {
        'AI_SPEAKING_SCORE': Medal,
        'AI_SPEAKING_SESSION': Mic,
        'AI_DEEP_ANALYZE': Sparkles,
        'vocab_count': Target,
        'checkin_streak': Flame,
    }
    return map[type] || Award
}

const getLevelColor = (level, status) => {
    if (status === 0) return '#3f3f46'
    if (level === 2) return '#94a3b8' // Silver
    if (level === 3) return '#fbbf24' // Gold
    return '#b45309' // Bronze (1)
}

const handleShare = (item) => {
    if (item.status !== 1) {
        message.warning('勋章点亮后即可分享至朋友圈')
        return
    }
    posterModalRef.value?.open(item)
}

onMounted(() => {
    fetchAchievements()
})

</script>

<template>
  <div class="achievement-container">
    <header class="page-header">
       <div class="flex items-center gap-4">
          <n-button quaternary circle @click="router.back()"><ChevronLeft /></n-button>
          <div>
            <h1>AI 荣誉殿堂</h1>
            <p>记录您的每一个学习里程碑，点亮专属于您的 AI 勋章</p>
          </div>
       </div>
    </header>

    <n-spin :show="loading">
        <div class="main-layout mt-8">
            <!-- Stats Bar -->
            <div class="stats-overview grid grid-cols-4 gap-6 mb-10">
                <div class="stat-card">
                    <div class="label">已解锁勋章</div>
                    <div class="value">{{ achievements.filter(a => a.status === 1).length }}</div>
                </div>
                <div class="stat-card">
                    <div class="label">全平台排名</div>
                    <div class="value">Top 5%</div>
                </div>
                <!-- ... other stats -->
            </div>

            <h2 class="section-title mb-6 flex items-center gap-2"><Trophy class="text-yellow-500" /> AI 专属成就</h2>
            
            <n-grid cols="1 600:2 1000:3" x-gap="20" y-gap="20">
                <n-grid-item v-for="item in achievements" :key="item.id">
                   <n-card class="badge-card" :class="{ locked: item.status === 0 }" :bordered="false">
                      <div class="badge-layout">
                         <div class="badge-icon-wrap" :style="{ background: getLevelColor(item.level, item.status) + '22', color: getLevelColor(item.level, item.status) }">
                            <n-icon :component="getIcon(item.conditionType)" :size="32" />
                            <div v-if="item.status === 1" class="glow-effect"></div>
                         </div>
                         
                         <div class="badge-info">
                            <div class="flex justify-between items-start">
                                <n-space vertical :size="0">
                                    <h3 class="name">{{ item.name }}</h3>
                                    <div class="level-tag" :style="{ color: getLevelColor(item.level, item.status) }">
                                        {{ ['BRONZE', 'SILVER', 'GOLD'][item.level - 1] }} TIER
                                    </div>
                                </n-space>
                                <n-button v-if="item.status === 1" quaternary circle size="small" @click="handleShare(item)">
                                    <template #icon><Share2 :size="14" /></template>
                                </n-button>
                            </div>
                            <p class="desc">{{ item.description }}</p>
                            
                            <div class="progress-section mt-4">
                               <div class="flex justify-between text-xs mb-1">
                                  <span class="text-zinc-500">当前进度</span>
                                  <span class="text-zinc-300">{{ item.currentValue }} / {{ item.conditionValue }}</span>
                               </div>
                               <n-progress 
                                 type="line" 
                                 :percentage="Math.min((item.currentValue / item.conditionValue) * 100, 100)" 
                                 :show-indicator="false"
                                 :height="4"
                                 :color="getLevelColor(item.level, item.status)"
                               />
                            </div>
                         </div>
                      </div>
                   </n-card>
                </n-grid-item>
            </n-grid>

            <n-empty v-if="!loading && achievements.length === 0" description="开启您的第一场 AI 训练来点亮勋章吧" />
        </div>
    </n-spin>

    <SharePosterModal ref="posterModalRef" />
  </div>
</template>

<style scoped>
.achievement-container {
  --achievement-card-bg: rgba(255, 255, 255, 0.88);
  --achievement-card-hover-bg: rgba(255, 255, 255, 0.98);
  --achievement-card-border: rgba(148, 163, 184, 0.18);
  --achievement-stat-bg: rgba(255, 255, 255, 0.76);
  --achievement-text: var(--text-color);
  --achievement-muted: var(--secondary-text);
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 48px;
}

:global(html[data-theme='dark'] .achievement-container) {
  --achievement-card-bg: rgba(24, 24, 27, 0.4);
  --achievement-card-hover-bg: rgba(30, 30, 35, 0.8);
  --achievement-card-border: rgba(255, 255, 255, 0.05);
  --achievement-stat-bg: rgba(24, 24, 27, 0.6);
}

.page-header h1 {
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--achievement-text);
  line-height: 1;
  margin-bottom: 8px;
}

.page-header p {
  color: var(--achievement-muted);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--achievement-text);
}

.stats-overview .stat-card {
  background: var(--achievement-stat-bg);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid var(--achievement-card-border);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(14px);
}

.stat-card .label {
  color: var(--achievement-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat-card .value {
  font-size: 1.8rem;
  font-weight: 900;
  color: var(--achievement-text);
}

.badge-card {
  background: var(--achievement-card-bg) !important;
  border-radius: 24px;
  border: 1px solid var(--achievement-card-border) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
}

.badge-card.locked {
  opacity: 0.6;
  filter: grayscale(0.8);
}

.badge-card:hover:not(.locked) {
  transform: translateY(-5px);
  border-color: rgba(99, 102, 241, 0.4) !important;
  background: var(--achievement-card-hover-bg) !important;
  box-shadow: 0 22px 42px rgba(99, 102, 241, 0.12);
}

.badge-layout {
  display: flex;
  gap: 20px;
}

.badge-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.glow-effect {
  position: absolute;
  inset: 0;
  background: currentColor;
  filter: blur(15px);
  opacity: 0.2;
  z-index: -1;
}

.badge-info {
  flex: 1;
}

.badge-info .name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--achievement-text);
  margin: 0;
}

.badge-info .desc {
  font-size: 0.85rem;
  color: var(--achievement-muted);
  margin: 4px 0 0;
  line-height: 1.4;
  min-height: 40px;
}

.progress-section :deep(.n-progress-rail) {
  background: rgba(148, 163, 184, 0.18) !important;
}

.unlocked-tag {
  font-weight: 900;
  letter-spacing: 0.05em;
  font-size: 10px;
}

.level-tag {
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  margin-top: 2px;
}

:global(html[data-theme='light'] .achievement-container .text-zinc-500) {
  color: #64748b !important;
}

:global(html[data-theme='light'] .achievement-container .text-zinc-300) {
  color: #18243d !important;
}

@media (max-width: 768px) {
  .achievement-container {
    padding: 20px 12px 32px;
  }

  .page-header h1 {
    font-size: 1.85rem;
  }

  .stats-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .badge-layout {
    gap: 14px;
  }

  .badge-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 18px;
  }
}
</style>
