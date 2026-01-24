<script setup>
import { ref, onMounted, computed } from 'vue'
import { NCard, NButton, NProgress, NTag, NList, NListItem, NEmpty, NSpin, NSpace, NStatistic, NGrid, NGridItem, useMessage } from 'naive-ui'
import { RotateCw, CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-vue-next'
import { masteryApi } from '@/api/mastery'
import { useRouter } from 'vue-router'

const router = useRouter()
const message = useMessage()
const loading = ref(false)

// 复习列表
const reviewList = ref([])
const currentIndex = ref(0)
const isFlipped = ref(false)
const reviewStats = ref({ correct: 0, wrong: 0 })
const reviewComplete = ref(false)

// 统计数据
const masteryStats = ref({
  total: 0,
  mastered: 0,
  familiar: 0,
  learning: 0,
  not_started: 0
})

// 加载数据
onMounted(async () => {
  await loadReviewList()
  await loadStats()
})

const loadReviewList = async () => {
  loading.value = true
  try {
    const res = await masteryApi.getReviewList(20)
    reviewList.value = res.data
    
    if (reviewList.value.length === 0) {
      message.info('今天没有需要复习的单词！')
    }
  } catch (error) {
    console.error('[Review] Load failed:', error)
    message.error('加载复习列表失败')
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await masteryApi.getStats()
    masteryStats.value = res.data
  } catch (error) {
    console.error('[Stats] Load failed:', error)
  }
}

// 当前复习的单词
const currentWord = computed(() => {
  if (reviewList.value.length === 0) return null
  return reviewList.value[currentIndex.value]
})

// 翻转卡片
const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

// 提交答案
const handleAnswer = async (correct) => {
  if (!currentWord.value) return
  
  // 记录统计
  if (correct) {
    reviewStats.value.correct++
  } else {
    reviewStats.value.wrong++
  }
  
  // 提交到后端
  try {
    await masteryApi.recordReview(currentWord.value.vocabulary_id, correct)
  } catch (error) {
    console.error('[Review] Submit failed:', error)
  }
  
  // 下一个单词
  if (currentIndex.value < reviewList.value.length - 1) {
    currentIndex.value++
    isFlipped.value = false
  } else {
    reviewComplete.value = true
  }
}

// 重新开始
const restart = async () => {
  currentIndex.value = 0
  reviewStats.value = { correct: 0, wrong: 0 }
  reviewComplete.value = false
  isFlipped.value = false
  await loadReviewList()
  await loadStats()
}

// 掌握率
const masteryRate = computed(() => {
  if (masteryStats.value.total === 0) return 0
  return Math.round((masteryStats.value.mastered / masteryStats.value.total) * 100)
})
</script>

<template>
  <div class="review-page">
    <!-- 页面标题 -->
    <header class="page-header">
      <div>
        <h1>智能复习</h1>
        <p>基于艾宾浩斯遗忘曲线的科学复习计划</p>
      </div>
      <n-button secondary @click="router.push('/vocabulary')">
        返回学习
      </n-button>
    </header>

    <!-- 统计卡片 -->
    <n-grid x-gap="16" y-gap="16" cols="1 600:2 900:4" responsive="screen" class="stats-grid">
      <n-grid-item>
        <n-card class="stat-card green">
          <n-statistic label="完全掌握" :value="masteryStats.mastered">
            <template #prefix>
              <CheckCircle :size="20" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card blue">
          <n-statistic label="熟悉中" :value="masteryStats.familiar">
            <template #prefix>
              <TrendingUp :size="20" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card orange">
          <n-statistic label="学习中" :value="masteryStats.learning">
            <template #prefix>
              <RotateCw :size="20" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      
      <n-grid-item>
        <n-card class="stat-card purple">
          <n-statistic label="掌握率" :value="masteryRate" suffix="%">
            <template #prefix>
              <Calendar :size="20" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 主内容区 -->
    <n-card class="main-card" :bordered="false">
      <n-spin :show="loading">
        <!-- 空状态 -->
        <n-empty
          v-if="reviewList.length === 0 && !loading"
          description="今天没有需要复习的单词，继续保持！"
          size="large"
        >
          <template #icon>
            <CheckCircle :size="64" color="#22c55e" />
          </template>
          <template #extra>
            <n-button type="primary" @click="router.push('/vocabulary')">
              去学习新单词
            </n-button>
          </template>
        </n-empty>

        <!-- 复习进行中 -->
        <div v-else-if="!reviewComplete && reviewList.length > 0" class="review-session">
          <div class="progress-header">
            <span>进度: {{ currentIndex + 1 }} / {{ reviewList.length }}</span>
            <n-tag :type="reviewStats.correct > reviewStats.wrong ? 'success' : 'warning'">
              正确率: {{ Math.round((reviewStats.correct / (reviewStats.correct + reviewStats.wrong || 1)) * 100) }}%
            </n-tag>
          </div>

          <n-progress
            type="line"
            :percentage="(currentIndex / reviewList.length) * 100"
            :show-indicator="false"
            processing
            color="#6366f1"
            class="progress-bar"
          />

          <!-- 卡片 -->
          <div class="flashcard-container" @click="flipCard">
            <div class="flashcard" :class="{ 'is-flipped': isFlipped }">
              <!-- 正面 -->
              <div class="card-face front">
                <h2 class="word-text">{{ currentWord?.word }}</h2>
                <p class="phonetic">{{ currentWord?.phonetic }}</p>
                <p class="hint">点击查看释义</p>
              </div>

              <!-- 背面 -->
              <div class="card-face back">
                <div class="top-bar"></div>
                <h3 class="meaning">{{ currentWord?.translation }}</h3>
                <div class="meta">
                  <n-tag size="small" type="info">Level {{ currentWord?.mastery_level }}</n-tag>
                  <n-tag size="small" type="warning">复习 {{ currentWord?.review_count }} 次</n-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 答题按钮 -->
          <div class="answer-buttons" v-if="isFlipped">
            <n-button
              size="large"
              type="error"
              circle
              style="width: 64px; height: 64px;"
              @click.stop="handleAnswer(false)"
            >
              <template #icon>
                <XCircle :size="32" />
              </template>
            </n-button>
            
            <n-button
              size="large"
              type="success"
              circle
              style="width: 64px; height: 64px;"
              @click.stop="handleAnswer(true)"
            >
              <template #icon>
                <CheckCircle :size="32" />
              </template>
            </n-button>
          </div>
          <div class="hint-text" v-else>
            思考一下...
          </div>
        </div>

        <!-- 复习完成 -->
        <div v-else-if="reviewComplete" class="complete-view">
          <div class="trophy-icon">
            <CheckCircle :size="80" color="#22c55e" />
          </div>
          
          <h2>复习完成！</h2>
          <p>本次复习 {{ reviewStats.correct + reviewStats.wrong }} 个单词</p>
          
          <n-space justify="center" size="large" class="result-stats">
            <div class="stat-box">
              <div class="val green">{{ reviewStats.correct }}</div>
              <div class="lbl">掌握</div>
            </div>
            <div class="stat-box">
              <div class="val red">{{ reviewStats.wrong }}</div>
              <div class="lbl">待加强</div>
            </div>
          </n-space>
          
          <n-space justify="center" class="mt-8">
            <n-button type="primary" size="large" @click="restart">
              再复习一遍
            </n-button>
            <n-button secondary size="large" @click="router.push('/vocabulary')">
              返回学习
            </n-button>
          </n-space>
        </div>
      </n-spin>
    </n-card>
  </div>
</template>

<style scoped>
.review-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #a1a1aa;
  font-size: 0.95rem;
}

.stats-grid {
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}
:global(.dark-mode) .stat-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-card.green { border-left: 4px solid #22c55e; }
.stat-card.blue { border-left: 4px solid #3b82f6; }
.stat-card.orange { border-left: 4px solid #f59e0b; }
.stat-card.purple { border-left: 4px solid #a855f7; }

.main-card {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  min-height: 500px;
}
:global(.dark-mode) .main-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.review-session {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #52525b;
}
:global(.dark-mode) .progress-header {
  color: #a1a1aa;
}

.progress-bar {
  margin-bottom: 40px;
}

.flashcard-container {
  perspective: 1000px;
  height: 360px;
  cursor: pointer;
  margin-bottom: 40px;
}

.flashcard {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.flashcard.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
:global(.dark-mode) .card-face {
  background: #1f1f23;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-face.back {
  transform: rotateY(180deg);
  border-color: rgba(99, 102, 241, 0.4);
}

.word-text {
  font-size: 3rem;
  font-weight: 800;
  color: #18181b;
  margin-bottom: 16px;
}
:global(.dark-mode) .word-text { color: #fff; }

.phonetic {
  font-size: 1.2rem;
  color: #6366f1;
  font-family: monospace;
  margin-bottom: 24px;
}
:global(.dark-mode) .phonetic { color: #818cf8; }

.hint {
  color: #71717a;
  font-size: 0.9rem;
}
:global(.dark-mode) .hint { color: #52525b; }

.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #d946ef);
}

.meaning {
  font-size: 2rem;
  font-weight: 700;
  color: #18181b;
  text-align: center;
  margin-bottom: 24px;
}
:global(.dark-mode) .meaning { color: #fff; }

.meta {
  display: flex;
  gap: 12px;
}

.answer-buttons {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.hint-text {
  text-align: center;
  color: #52525b;
  font-size: 1.1rem;
}
:global(.dark-mode) .hint-text { color: #71717a; }

.complete-view {
  text-align: center;
  padding: 60px 20px;
}

.trophy-icon {
  margin: 0 auto 32px;
}

.complete-view h2 {
  font-size: 2rem;
  color: #18181b;
  margin-bottom: 8px;
}
:global(.dark-mode) .complete-view h2 { color: #fff; }

.complete-view p {
  color: #a1a1aa;
  margin-bottom: 40px;
}

.result-stats {
  margin-bottom: 40px;
}

.stat-box {
  background: rgba(0, 0, 0, 0.03);
  padding: 24px 48px;
  border-radius: 12px;
}
:global(.dark-mode) .stat-box {
  background: rgba(255, 255, 255, 0.05);
}

.stat-box .val {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-box .val.green { color: #22c55e; }
.stat-box .val.red { color: #ef4444; }

.stat-box .lbl {
  font-size: 0.9rem;
  color: #71717a;
  text-transform: uppercase;
}


.mt-8 {
  margin-top: 32px;
}

@media (max-width: 768px) {
  .review-page {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .page-header h1 {
    font-size: 1.5rem;
  }
  .flashcard-container {
    height: 450px;
  }
  .word-text {
    font-size: 2.2rem;
  }
  .meaning {
    font-size: 1.5rem;
  }
  .answer-buttons {
    gap: 24px;
  }
}
</style>
