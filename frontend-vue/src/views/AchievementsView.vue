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
       <div class="page-header-row flex items-center gap-4">
          <n-button class="page-back-btn" quaternary circle @click="router.back()"><ChevronLeft /></n-button>
          <div class="page-header-copy">
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
                             <div class="badge-head flex justify-between items-start">
                                 <n-space vertical :size="0">
                                    <h3 class="name">{{ item.name }}</h3>
                                    <div class="level-tag" :style="{ color: getLevelColor(item.level, item.status) }">
                                        {{ ['BRONZE', 'SILVER', 'GOLD'][item.level - 1] }} TIER
                                    </div>
                                 </n-space>
                                 <n-button v-if="item.status === 1" class="badge-share-btn" quaternary circle size="small" @click="handleShare(item)">
                                     <template #icon><Share2 :size="14" /></template>
                                 </n-button>
                             </div>
                             <p class="desc">{{ item.description }}</p>
                             
                             <div class="progress-section mt-4">
                               <div class="progress-meta flex justify-between text-xs mb-1">
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

.page-header-row,
.page-header-copy,
.section-title,
.stats-overview,
.badge-layout,
.badge-head,
.badge-info,
.progress-meta {
  min-width: 0;
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
  overflow-wrap: anywhere;
}

.page-header p {
  color: var(--achievement-muted);
  overflow-wrap: anywhere;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--achievement-text);
  overflow-wrap: anywhere;
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
  line-height: 1.08;
  overflow-wrap: anywhere;
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
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge-info .name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--achievement-text);
  margin: 0;
  overflow-wrap: anywhere;
}

.badge-info .desc {
  font-size: 0.85rem;
  color: var(--achievement-muted);
  margin: 4px 0 0;
  line-height: 1.4;
  min-height: 40px;
  overflow-wrap: anywhere;
}

.badge-head {
  gap: 10px 12px;
  flex-wrap: wrap;
}

.badge-head :deep(.n-space) {
  min-width: 0;
  flex: 1 1 180px;
}

.badge-share-btn {
  flex-shrink: 0;
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
  overflow-wrap: anywhere;
}

.progress-meta {
  gap: 8px;
  flex-wrap: wrap;
}

.progress-meta .text-zinc-300 {
  flex-shrink: 0;
}

.progress-meta .text-zinc-500 {
  min-width: 0;
  overflow-wrap: anywhere;
}

:global(html[data-theme='light'] .achievement-container .text-zinc-500) {
  color: #64748b !important;
}

:global(html[data-theme='light'] .achievement-container .text-zinc-300) {
  color: #18243d !important;
}

@media (max-width: 768px) {
  .achievement-container {
    padding: 20px max(12px, env(safe-area-inset-right)) calc(32px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  }

  .page-header h1 {
    font-size: 1.85rem;
  }

  .page-header-row {
    align-items: flex-start;
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

  .badge-card {
    border-radius: 22px;
  }
}

@media (max-width: 480px) {
  .achievement-container {
    padding-top: 16px;
    padding-right: max(10px, env(safe-area-inset-right));
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
    padding-left: max(10px, env(safe-area-inset-left));
  }

  .page-header-row {
    align-items: flex-start;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 1.55rem;
    line-height: 1.05;
  }

  .page-header p {
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .stats-overview {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stats-overview .stat-card {
    padding: 18px;
    border-radius: 18px;
  }

  .badge-card {
    border-radius: 20px;
  }

  .badge-layout {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 12px;
  }

  .badge-head {
    gap: 10px;
  }

  .badge-icon-wrap {
    width: 52px;
    height: 52px;
    border-radius: 16px;
  }

  .badge-info .name {
    font-size: 0.95rem;
    line-height: 1.3;
  }

  .badge-info .desc {
    min-height: 0;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .badge-share-btn {
    margin-left: auto;
  }
}

@media (max-width: 360px) {
  .achievement-container {
    padding-top: 14px;
    padding-right: max(8px, env(safe-area-inset-right));
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
    padding-left: max(8px, env(safe-area-inset-left));
  }

  .page-header-row {
    gap: 10px;
  }

  .page-back-btn {
    flex-shrink: 0;
  }

  .page-header h1 {
    font-size: 1.4rem;
  }

  .page-header p {
    font-size: 0.82rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .stats-overview .stat-card {
    padding: 16px 14px;
    border-radius: 16px;
  }

  .stat-card .value {
    font-size: 1.55rem;
  }

  .badge-card {
    border-radius: 18px;
  }

  .badge-layout {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 10px;
  }

  .badge-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 14px;
  }

  .badge-info .name {
    font-size: 0.95rem;
  }

  .badge-info .desc {
    font-size: 0.8rem;
  }

  .progress-meta {
    font-size: 11px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .achievement-container {
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
  }

  .stats-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .stats-overview .stat-card {
    padding: 18px;
    border-radius: 18px;
  }

  .badge-card {
    border-radius: 20px;
  }

  .badge-layout {
    gap: 12px;
  }

  .badge-icon-wrap {
    width: 50px;
    height: 50px;
    border-radius: 16px;
  }
}
</style>
