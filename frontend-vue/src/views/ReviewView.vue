<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NEmpty, NIcon, NProgress, NSpin, NTag, useMessage } from 'naive-ui'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  RotateCw,
  Sparkles,
  Target,
  TrendingUp,
  XCircle
} from 'lucide-vue-next'
import { masteryApi } from '@/api/mastery'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const reviewList = ref([])
const currentIndex = ref(0)
const isFlipped = ref(false)
const reviewStats = ref({ correct: 0, wrong: 0 })
const reviewComplete = ref(false)
const masteryStats = ref({
  total: 0,
  mastered: 0,
  familiar: 0,
  learning: 0,
  not_started: 0
})

onMounted(async () => {
  await loadReviewList()
  await loadStats()
})

const loadReviewList = async () => {
  loading.value = true
  try {
    const res = await masteryApi.getReviewList(20)
    reviewList.value = Array.isArray(res.data) ? res.data : []

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
    masteryStats.value = res.data || masteryStats.value
  } catch (error) {
    console.error('[Stats] Load failed:', error)
  }
}

const currentWord = computed(() => reviewList.value[currentIndex.value] || null)
const answeredCount = computed(() => reviewStats.value.correct + reviewStats.value.wrong)
const remainingCount = computed(() => Math.max(reviewList.value.length - answeredCount.value, 0))
const progressPercent = computed(() => {
  if (!reviewList.value.length) return 0
  return Math.round((answeredCount.value / reviewList.value.length) * 100)
})
const sessionAccuracy = computed(() => {
  if (!answeredCount.value) return 0
  return Math.round((reviewStats.value.correct / answeredCount.value) * 100)
})
const masteryRate = computed(() => {
  if (!masteryStats.value.total) return 0
  return Math.round((masteryStats.value.mastered / masteryStats.value.total) * 100)
})
const sessionStatusTone = computed(() => {
  if (!answeredCount.value) return 'default'
  if (sessionAccuracy.value >= 80) return 'success'
  if (sessionAccuracy.value >= 60) return 'warning'
  return 'error'
})
const masteryCards = computed(() => ([
  {
    label: '完全掌握',
    value: masteryStats.value.mastered,
    note: '已经比较稳定',
    icon: CheckCircle,
    tone: 'success'
  },
  {
    label: '熟悉中',
    value: masteryStats.value.familiar,
    note: '适合继续巩固',
    icon: TrendingUp,
    tone: 'info'
  },
  {
    label: '学习中',
    value: masteryStats.value.learning,
    note: '需要反复出现',
    icon: RotateCw,
    tone: 'warning'
  },
  {
    label: '掌握率',
    value: `${masteryRate.value}%`,
    note: '来自整体词汇池',
    icon: Target,
    tone: 'accent'
  }
]))
const upcomingWords = computed(() => reviewList.value.slice(currentIndex.value + 1, currentIndex.value + 5))
const currentWordStage = computed(() => {
  const level = Number(currentWord.value?.mastery_level ?? 0)
  if (level >= 4) return '已稳固'
  if (level >= 3) return '较熟悉'
  if (level >= 2) return '巩固中'
  return '待加深'
})
const reviewTip = computed(() => {
  if (!currentWord.value) return '准备几条真实复习记录后，系统会自动安排下一轮。'
  if (!isFlipped.value) return '先回忆单词释义，再翻面确认。'
  return '翻面后立即判断是否记住，系统会据此调整下一次复习。'
})

const flipCard = () => {
  if (!currentWord.value) return
  isFlipped.value = !isFlipped.value
}

const handleAnswer = async (correct) => {
  if (!currentWord.value) return

  if (correct) {
    reviewStats.value.correct += 1
  } else {
    reviewStats.value.wrong += 1
  }

  try {
    await masteryApi.recordReview(currentWord.value.vocabulary_id, correct)
  } catch (error) {
    console.error('[Review] Submit failed:', error)
  }

  if (currentIndex.value < reviewList.value.length - 1) {
    currentIndex.value += 1
    isFlipped.value = false
  } else {
    reviewComplete.value = true
  }
}

const restart = async () => {
  currentIndex.value = 0
  reviewStats.value = { correct: 0, wrong: 0 }
  reviewComplete.value = false
  isFlipped.value = false
  await loadReviewList()
  await loadStats()
}
</script>

<template>
  <div class="review-page">
    <header class="review-hero">
      <div class="review-hero__copy">
        <p class="review-hero__kicker">智能复习</p>
        <div class="review-hero__title-row">
          <div>
            <h1 class="review-hero__title">智能复习</h1>
            <p class="review-hero__subtitle">
              把今天该复习的单词按顺序排好，先回忆，再确认，再及时标记记忆状态。
            </p>
          </div>

          <n-button class="review-hero__back" secondary @click="router.push('/vocabulary')">
            <template #icon>
              <n-icon :component="ArrowLeft" />
            </template>
            返回词汇学习
          </n-button>
        </div>
      </div>

      <div class="review-hero__stats">
        <article
          v-for="item in masteryCards"
          :key="item.label"
          class="hero-stat"
          :class="`hero-stat--${item.tone}`"
        >
          <div class="hero-stat__icon">
            <n-icon :component="item.icon" />
          </div>
          <div class="hero-stat__body">
            <span class="hero-stat__label">{{ item.label }}</span>
            <strong class="hero-stat__value">{{ item.value }}</strong>
            <span class="hero-stat__note">{{ item.note }}</span>
          </div>
        </article>
      </div>
    </header>

    <n-spin :show="loading">
      <div v-if="reviewList.length === 0 && !loading" class="review-empty">
        <div class="review-empty__icon">
          <n-icon :component="CheckCircle" />
        </div>
        <h2>今天没有待复习单词</h2>
        <p>系统当前没有安排新的复习轮次。可以先去学习新词，或者等下一批单词进入复习窗口。</p>
        <div class="review-empty__actions">
          <n-button type="primary" size="large" @click="router.push('/vocabulary')">
            去学习新单词
          </n-button>
          <n-button size="large" secondary @click="restart">
            重新检查复习列表
          </n-button>
        </div>
      </div>

      <div v-else-if="!reviewComplete && reviewList.length > 0" class="review-workbench">
        <section class="review-stage">
          <div class="review-stage__head">
            <div>
              <p class="review-stage__kicker">复习批次</p>
              <h2 class="review-stage__title">今天的复习批次</h2>
              <p class="review-stage__caption">
                当前批次共 {{ reviewList.length }} 个单词，已经处理 {{ answeredCount }} 个，剩余 {{ remainingCount }} 个。
              </p>
            </div>

            <div class="review-stage__status">
              <n-tag size="large" :type="sessionStatusTone" :bordered="false" round>
                当前正确率 {{ sessionAccuracy }}%
              </n-tag>
            </div>
          </div>

          <n-progress
            class="review-stage__progress"
            type="line"
            :percentage="progressPercent"
            :show-indicator="false"
            color="#6366f1"
            rail-color="rgba(148, 163, 184, 0.16)"
          />

          <div class="review-stage__layout">
            <aside class="review-panel review-panel--summary">
              <div class="panel-block">
                <span class="panel-block__label">当前单词</span>
                <strong class="panel-block__title">{{ currentWord?.word || '等待加载' }}</strong>
                <p class="panel-block__meta">{{ currentWord?.phonetic || '暂无音标' }}</p>
              </div>

              <div class="panel-grid">
                <div class="metric-chip">
                  <span>掌握阶段</span>
                  <strong>{{ currentWordStage }}</strong>
                </div>
                <div class="metric-chip">
                  <span>历史复习</span>
                  <strong>{{ currentWord?.review_count ?? 0 }} 次</strong>
                </div>
              </div>

              <div class="panel-block">
                <span class="panel-block__label">当前动作</span>
                <p class="panel-block__text">{{ reviewTip }}</p>
              </div>

              <div class="panel-block">
                <span class="panel-block__label">接下来队列</span>
                <div v-if="upcomingWords.length" class="queue-list">
                  <div v-for="word in upcomingWords" :key="word.vocabulary_id" class="queue-item">
                    <strong>{{ word.word }}</strong>
                    <span>{{ word.translation || '待翻面查看' }}</span>
                  </div>
                </div>
                <p v-else class="panel-block__text">这是今天这组复习里的最后一个单词。</p>
              </div>
            </aside>

            <div class="review-panel review-panel--card">
              <div class="card-topline">
                <div class="card-topline__item">
                  <n-icon :component="Calendar" />
                  <span>进度 {{ currentIndex + 1 }} / {{ reviewList.length }}</span>
                </div>
                <div class="card-topline__item">
                  <n-icon :component="Clock" />
                  <span>{{ isFlipped ? '已进入确认阶段' : '先回忆再翻面' }}</span>
                </div>
              </div>

              <div class="flashcard-shell" @click="flipCard">
                <div class="flashcard" :class="{ 'is-flipped': isFlipped }">
                  <div class="card-face card-face--front">
                    <span class="card-face__eyebrow">先回忆</span>
                    <h3 class="word-text">{{ currentWord?.word }}</h3>
                    <p class="phonetic">{{ currentWord?.phonetic || '暂无音标' }}</p>
                    <p class="card-face__hint">点击卡片查看释义与记忆状态</p>
                  </div>

                  <div class="card-face card-face--back">
                    <span class="card-face__eyebrow">看释义</span>
                    <h3 class="meaning">{{ currentWord?.translation || '暂无释义' }}</h3>
                    <div class="card-meta">
                      <n-tag size="small" :bordered="false" round>Level {{ currentWord?.mastery_level ?? 0 }}</n-tag>
                      <n-tag size="small" :bordered="false" round type="warning">复习 {{ currentWord?.review_count ?? 0 }} 次</n-tag>
                    </div>
                    <p class="card-face__hint">确认记忆效果后，直接选择“记住了”或“还没记住”。</p>
                  </div>
                </div>
              </div>

              <div class="answer-zone">
                <template v-if="isFlipped">
                  <n-button class="answer-btn answer-btn--ghost" size="large" @click.stop="handleAnswer(false)">
                    <template #icon>
                      <n-icon :component="XCircle" />
                    </template>
                    还没记住
                  </n-button>
                  <n-button class="answer-btn" type="primary" size="large" @click.stop="handleAnswer(true)">
                    <template #icon>
                      <n-icon :component="CheckCircle" />
                    </template>
                    已经记住
                  </n-button>
                </template>

                <div v-else class="answer-zone__placeholder">
                  <n-icon :component="Sparkles" />
                  <span>先看正面回忆，再点击卡片进入确认阶段</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div v-else-if="reviewComplete" class="review-complete">
        <div class="review-complete__badge">
          <n-icon :component="CheckCircle" />
        </div>
        <p class="review-complete__kicker">本轮完成</p>
        <h2>这一轮复习已经完成</h2>
        <p class="review-complete__desc">
          本次一共复习了 {{ answeredCount }} 个单词，其中记住 {{ reviewStats.correct }} 个，还需要继续加深 {{ reviewStats.wrong }} 个。
        </p>

        <div class="review-complete__stats">
          <article class="complete-stat">
            <span>掌握</span>
            <strong>{{ reviewStats.correct }}</strong>
          </article>
          <article class="complete-stat">
            <span>待加强</span>
            <strong>{{ reviewStats.wrong }}</strong>
          </article>
          <article class="complete-stat">
            <span>本轮正确率</span>
            <strong>{{ sessionAccuracy }}%</strong>
          </article>
        </div>

        <div class="review-complete__actions">
          <n-button type="primary" size="large" @click="restart">
            再复习一轮
          </n-button>
          <n-button size="large" secondary @click="router.push('/vocabulary')">
            返回词汇学习
          </n-button>
        </div>
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.review-page {
  --review-bg: rgba(26, 29, 46, 0.94);
  --review-panel: rgba(36, 40, 54, 0.9);
  --review-panel-strong: rgba(42, 47, 65, 0.96);
  --review-border: rgba(255, 255, 255, 0.08);
  --review-shadow: 0 26px 58px rgba(4, 8, 20, 0.34);
  --review-text: var(--text-color);
  --review-muted: var(--secondary-text);
  --review-soft: #8d96ad;
  --review-accent: #6366f1;
  --review-accent-soft: #a5b4fc;
  max-width: 1480px;
  margin: 0 auto;
  padding: 24px 28px 64px;
  display: grid;
  gap: 24px;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.14), transparent 26%),
    radial-gradient(circle at left top, rgba(56, 189, 248, 0.08), transparent 18%);
  border-radius: 32px;
}

:global(html[data-theme='light'] .review-page) {
  --review-bg: rgba(255, 255, 255, 0.94);
  --review-panel: rgba(255, 255, 255, 0.9);
  --review-panel-strong: rgba(248, 250, 252, 0.98);
  --review-border: rgba(15, 23, 42, 0.08);
  --review-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
  --review-text: #162033;
  --review-muted: #64748b;
  --review-soft: #7c8aa1;
  --review-accent-soft: #6366f1;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 24%),
    radial-gradient(circle at left top, rgba(56, 189, 248, 0.06), transparent 18%);
}

.review-hero,
.review-stage,
.review-empty,
.review-complete {
  border: 1px solid var(--review-border);
  background:
    linear-gradient(180deg, rgba(44, 49, 66, 0.98), rgba(29, 33, 46, 0.98)),
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.16), transparent 36%),
    radial-gradient(circle at left bottom, rgba(56, 189, 248, 0.08), transparent 24%);
  box-shadow: var(--review-shadow);
  backdrop-filter: blur(16px);
}

:global(html[data-theme='light'] .review-hero),
:global(html[data-theme='light'] .review-stage),
:global(html[data-theme='light'] .review-empty),
:global(html[data-theme='light'] .review-complete) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 251, 0.98)),
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent 34%),
    radial-gradient(circle at left bottom, rgba(56, 189, 248, 0.05), transparent 24%);
}

.review-hero {
  display: grid;
  gap: 22px;
  padding: 28px;
  border-radius: 30px;
}

.review-hero__kicker,
.review-stage__kicker,
.review-complete__kicker,
.card-face__eyebrow,
.panel-block__label {
  margin: 0;
  color: var(--review-accent-soft);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.review-hero__title-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: start;
}

.review-hero__title {
  margin: 10px 0 0;
  color: var(--review-text);
  font-size: clamp(2.3rem, 4vw, 3.8rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.review-hero__subtitle {
  max-width: 46rem;
  margin: 14px 0 0;
  color: var(--review-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.review-hero__back {
  min-width: 160px;
}

.review-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.hero-stat {
  display: flex;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background:
    linear-gradient(180deg, rgba(48, 54, 73, 0.94), rgba(36, 40, 54, 0.92));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

:global(html[data-theme='light'] .hero-stat) {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
}

.hero-stat__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: 16px;
  font-size: 20px;
}

.hero-stat--success .hero-stat__icon {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}

.hero-stat--info .hero-stat__icon {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}

.hero-stat--warning .hero-stat__icon {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.14);
}

.hero-stat--accent .hero-stat__icon {
  color: var(--review-accent-soft);
  background: rgba(99, 102, 241, 0.18);
}

.hero-stat__body {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.hero-stat__label {
  color: var(--review-soft);
  font-size: 0.8rem;
}

.hero-stat__value {
  color: var(--review-text);
  font-size: 1.35rem;
  font-weight: 800;
}

.hero-stat__note {
  color: var(--review-muted);
  font-size: 0.82rem;
  line-height: 1.45;
}

.review-stage {
  display: grid;
  gap: 22px;
  padding: 28px;
  border-radius: 30px;
}

.review-stage__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;
}

.review-stage__title {
  margin: 8px 0 0;
  color: var(--review-text);
  font-size: 1.8rem;
  line-height: 1.08;
}

.review-stage__caption {
  margin: 12px 0 0;
  color: var(--review-muted);
  line-height: 1.65;
}

.review-stage__progress {
  margin-top: -4px;
}

.review-stage__layout {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 20px;
}

.review-panel {
  min-width: 0;
  border-radius: 26px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background:
    linear-gradient(180deg, rgba(42, 47, 65, 0.98), rgba(33, 37, 51, 0.96));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

:global(html[data-theme='light'] .review-panel) {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.98));
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
}

.review-panel--summary {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 22px;
}

.panel-block {
  display: grid;
  gap: 8px;
}

.panel-block__title {
  color: var(--review-text);
  font-size: 1.55rem;
  line-height: 1.08;
}

.panel-block__meta,
.panel-block__text {
  margin: 0;
  color: var(--review-muted);
  line-height: 1.65;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-chip {
  padding: 14px;
  border-radius: 18px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.14);
  display: grid;
  gap: 5px;
}

:global(html[data-theme='light'] .metric-chip) {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
}

.metric-chip span {
  color: var(--review-soft);
  font-size: 0.78rem;
}

.metric-chip strong {
  color: var(--review-text);
  font-size: 1rem;
}

.queue-list {
  display: grid;
  gap: 10px;
}

.queue-item {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:global(html[data-theme='light'] .queue-item) {
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.queue-item strong {
  color: var(--review-text);
}

.queue-item span {
  color: var(--review-muted);
  font-size: 0.84rem;
}

.review-panel--card {
  display: grid;
  gap: 18px;
  padding: 22px;
}

.card-topline {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.card-topline__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: var(--review-muted);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

:global(html[data-theme='light'] .card-topline__item) {
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.flashcard-shell {
  perspective: 1400px;
  min-height: 460px;
  cursor: pointer;
}

.flashcard {
  position: relative;
  width: 100%;
  min-height: 460px;
  transform-style: preserve-3d;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.flashcard.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 34px;
  overflow: hidden;
}

.card-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.22), transparent 34%),
    radial-gradient(circle at left bottom, rgba(56, 189, 248, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(43, 48, 66, 0.98), rgba(24, 29, 43, 0.98));
  z-index: 0;
}

:global(html[data-theme='light'] .card-face::before) {
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.16), transparent 34%),
    radial-gradient(circle at left bottom, rgba(56, 189, 248, 0.05), transparent 24%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(243, 246, 251, 0.99));
}

.card-face > * {
  position: relative;
  z-index: 1;
}

.card-face--back {
  transform: rotateY(180deg);
}

.word-text {
  margin: 12px 0 10px;
  color: var(--review-text);
  font-size: clamp(3rem, 5vw, 4.8rem);
  line-height: 0.92;
  letter-spacing: -0.06em;
}

.phonetic {
  margin: 0;
  color: var(--review-accent-soft);
  font-size: 1.2rem;
  font-family: ui-monospace, SFMono-Regular, SFMono-Regular, Consolas, monospace;
}

.meaning {
  margin: 12px 0 18px;
  color: var(--review-text);
  font-size: clamp(2rem, 4vw, 2.9rem);
  line-height: 1.1;
}

.card-face__hint {
  max-width: 26rem;
  margin: 18px 0 0;
  color: var(--review-muted);
  line-height: 1.65;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.answer-zone {
  min-height: 74px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
}

.answer-zone__placeholder {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 999px;
  color: var(--review-muted);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

:global(html[data-theme='light'] .answer-zone__placeholder) {
  background: rgba(248, 250, 252, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.answer-btn {
  min-width: 180px;
}

.answer-btn--ghost {
  border-color: rgba(248, 113, 113, 0.28);
  background: rgba(127, 29, 29, 0.16);
}

:global(html[data-theme='light'] .answer-btn--ghost) {
  background: rgba(254, 226, 226, 0.85);
  border-color: rgba(248, 113, 113, 0.24);
}

.review-empty,
.review-complete {
  padding: 56px 28px;
  border-radius: 30px;
  text-align: center;
}

.review-empty__icon,
.review-complete__badge {
  width: 84px;
  height: 84px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  font-size: 38px;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}

.review-empty h2,
.review-complete h2 {
  margin: 0;
  color: var(--review-text);
  font-size: 2rem;
}

.review-empty p,
.review-complete__desc {
  max-width: 40rem;
  margin: 14px auto 0;
  color: var(--review-muted);
  line-height: 1.72;
}

.review-empty__actions,
.review-complete__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.review-complete__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  max-width: 760px;
  margin: 26px auto 0;
}

.complete-stat {
  display: grid;
  gap: 6px;
  padding: 18px 16px;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(48, 54, 73, 0.94), rgba(36, 40, 54, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.06);
}

:global(html[data-theme='light'] .complete-stat) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 249, 252, 0.98));
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.complete-stat span {
  color: var(--review-soft);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.complete-stat strong {
  color: var(--review-text);
  font-size: 2rem;
  line-height: 1;
}

@media (max-width: 1180px) {
  .review-hero__stats,
  .review-complete__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .review-stage__layout {
    grid-template-columns: 1fr;
  }

  .flashcard-shell,
  .flashcard {
    min-height: 400px;
  }
}

@media (max-width: 780px) {
  .review-page {
    padding: 18px 16px 44px;
  }

  .review-hero,
  .review-stage,
  .review-empty,
  .review-complete {
    padding: 22px 18px;
    border-radius: 24px;
  }

  .review-hero__title-row,
  .review-stage__head {
    grid-template-columns: 1fr;
  }

  .review-hero__stats,
  .review-complete__stats,
  .panel-grid {
    grid-template-columns: 1fr;
  }

  .answer-zone {
    flex-direction: column;
  }

  .answer-btn {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .review-panel--summary,
  .review-panel--card {
    padding: 18px 16px;
  }

  .word-text {
    font-size: 2.2rem;
  }

  .meaning {
    font-size: 1.55rem;
  }

  .flashcard-shell,
  .flashcard {
    min-height: 360px;
  }

  .card-face {
    padding: 24px 18px;
  }

  .answer-zone__placeholder {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    text-align: center;
    border-radius: 18px;
  }

  .queue-item {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .review-page {
    padding: 12px max(10px, env(safe-area-inset-left)) calc(22px + env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-right));
    gap: 16px;
    border-radius: 22px;
  }

  .review-hero,
  .review-stage,
  .review-empty,
  .review-complete {
    padding: 18px 14px;
    border-radius: 20px;
  }

  .review-hero__title {
    font-size: 1.9rem;
    line-height: 1.02;
  }

  .review-hero__subtitle,
  .review-stage__caption,
  .panel-block__meta,
  .panel-block__text,
  .card-face__hint,
  .review-empty p,
  .review-complete__desc {
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .review-hero__back,
  .review-stage__status,
  .review-stage__status :deep(.n-tag),
  .review-empty__actions > *,
  .review-complete__actions > * {
    width: 100%;
    min-width: 0;
  }

  .review-stage__title,
  .review-empty h2,
  .review-complete h2 {
    font-size: 1.45rem;
  }

  .review-panel--summary,
  .review-panel--card {
    padding: 16px 14px;
    border-radius: 20px;
  }

  .panel-block__title {
    font-size: 1.28rem;
  }

  .metric-chip {
    padding: 12px;
    border-radius: 16px;
  }

  .card-topline {
    gap: 8px;
  }

  .card-topline__item {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .flashcard-shell,
  .flashcard {
    min-height: 320px;
  }

  .card-face {
    padding: 20px 14px;
    border-radius: 22px;
  }

  .word-text {
    font-size: 1.9rem;
  }

  .phonetic {
    font-size: 0.98rem;
  }

  .meaning {
    font-size: 1.34rem;
    line-height: 1.25;
  }

  .card-meta {
    gap: 8px;
  }

  .answer-zone {
    min-height: 0;
    gap: 10px;
  }

  .answer-zone__placeholder {
    padding: 12px;
    font-size: 0.84rem;
  }

  .review-empty__icon,
  .review-complete__badge {
    width: 68px;
    height: 68px;
    border-radius: 20px;
    font-size: 30px;
  }

  .review-complete__stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .complete-stat {
    padding: 14px;
    border-radius: 16px;
  }

  .complete-stat strong {
    font-size: 1.6rem;
  }
}

@media (max-width: 360px) {
  .review-page {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }

  .review-hero,
  .review-stage,
  .review-empty,
  .review-complete {
    padding: 16px 12px;
  }

  .review-hero__title {
    font-size: 1.68rem;
  }

  .review-stage__title,
  .review-empty h2,
  .review-complete h2 {
    font-size: 1.28rem;
  }

  .review-panel--summary,
  .review-panel--card {
    padding: 14px 12px;
  }

  .word-text {
    font-size: 1.68rem;
  }

  .meaning {
    font-size: 1.18rem;
  }

  .flashcard-shell,
  .flashcard {
    min-height: 292px;
  }

  .card-face {
    padding: 16px 12px;
  }

  .hero-stat,
  .queue-item,
  .metric-chip {
    padding: 10px 12px;
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .review-page {
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }

  .review-hero,
  .review-stage {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .flashcard-shell,
  .flashcard {
    min-height: 280px;
  }
}
</style>
