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
    if (res.data) {
      masteryStats.value = {
        total: Number(res.data.total ?? 0),
        mastered: Number(res.data.mastered ?? 0),
        familiar: Number(res.data.familiar ?? 0),
        learning: Number(res.data.learning ?? 0),
        not_started: Number(res.data.not_started ?? 0)
      }
    }
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
  return Math.round((Number(masteryStats.value.mastered || 0) / Number(masteryStats.value.total)) * 100)
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
    value: `${Number(masteryStats.value.mastered ?? 0)} 词`,
    note: '记忆牢固稳定',
    icon: CheckCircle,
    tone: 'success'
  },
  {
    label: '熟悉中',
    value: `${Number(masteryStats.value.familiar ?? 0)} 词`,
    note: '进入巩固周期',
    icon: TrendingUp,
    tone: 'info'
  },
  {
    label: '学习中',
    value: `${Number(masteryStats.value.learning ?? 0)} 词`,
    note: '需周期性回顾',
    icon: RotateCw,
    tone: 'warning'
  },
  {
    label: '掌握率',
    value: `${masteryRate.value}%`,
    note: '整体词汇熟练度',
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
        <p class="review-hero__kicker">
          <span class="kicker-dot"></span>
          智能复习
        </p>
        <div class="review-hero__title-row">
          <div>
            <h1 class="review-hero__title">智能复习</h1>
            <p class="review-hero__subtitle">
              遵循艾宾浩斯遗忘曲线科学调度，先回忆、再翻面确认，按时强化记忆节点。
            </p>
          </div>

          <button type="button" class="back-nav-btn" @click="router.push('/vocabulary')">
            <n-icon :component="ArrowLeft" />
            <span>返回词汇学习</span>
          </button>
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
        <div class="empty-halo-wrap">
          <div class="empty-halo-ring"></div>
          <div class="review-empty__icon">
            <n-icon :component="Sparkles" />
          </div>
        </div>

        <div class="empty-badge">
          <span class="badge-dot"></span>
          <span>记忆库稳固中</span>
        </div>

        <h2>今日待复习单词已全部清空</h2>
        <p class="empty-desc">
          所有已背单词目前均在科学遗忘周期的稳固阶段。您可以继续攻克新词汇，或前往错题本进行专项失分点复盘。
        </p>

        <div class="empty-insights">
          <div class="insight-card">
            <div class="insight-icon insight-icon--curve">
              <n-icon :component="Clock" />
            </div>
            <div class="insight-body">
              <strong>艾宾浩斯智能排期</strong>
              <p>系统按 1、2、4、7、15 天计算临界点，届时会自动将单词送达复习池。</p>
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon insight-icon--vocab">
              <n-icon :component="BookOpen" />
            </div>
            <div class="insight-body">
              <strong>持续扩充词汇储备</strong>
              <p>前往词汇学习模块开启新关卡，新掌握的单词会自动沉淀至复习池中。</p>
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon insight-icon--error">
              <n-icon :component="Target" />
            </div>
            <div class="insight-body">
              <strong>针对性错题攻坚</strong>
              <p>练习与考试中的失分题目已收录在错题本，支持 AI 错因深挖与强化练习。</p>
            </div>
          </div>
        </div>

        <div class="review-empty__actions">
          <button type="button" class="empty-btn empty-btn--primary" @click="router.push('/vocabulary')">
            <n-icon :component="BookOpen" />
            <span>去学习新单词</span>
          </button>
          <button type="button" class="empty-btn empty-btn--secondary" @click="router.push('/error-book')">
            <n-icon :component="Target" />
            <span>去错题复盘</span>
          </button>
          <button type="button" class="empty-btn empty-btn--tertiary" @click="restart">
            <n-icon :component="RotateCw" />
            <span>重新检查队列</span>
          </button>
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
            color="#1e6b52"
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
  --review-bg: rgba(11, 15, 25, 0.96);
  --review-panel: rgba(17, 24, 39, 0.82);
  --review-panel-strong: rgba(15, 23, 42, 0.92);
  --review-border: rgba(255, 255, 255, 0.08);
  --review-shadow: 0 24px 60px -12px rgba(2, 6, 23, 0.55);
  --review-text: var(--text-color);
  --review-muted: #94a3b8;
  --review-soft: #cbd5e1;
  --review-accent: #1e6b52;
  --review-accent-soft: #8cc3ad;
  max-width: 1480px;
  margin: 0 auto;
  padding: 24px 28px 64px;
  display: grid;
  gap: 24px;
  background: transparent;
  border-radius: var(--radius-lg);
}

:global(html[data-theme='light'] .review-page) {
  --review-bg: rgba(255, 255, 255, 0.94);
  --review-panel: rgba(255, 255, 255, 0.9);
  --review-panel-strong: rgba(248, 250, 252, 0.98);
  --review-border: rgba(203, 213, 225, 0.65);
  --review-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.08);
  --review-text: #0f172a;
  --review-muted: #64748b;
  --review-soft: #475569;
  --review-accent-soft: #1e6b52;
}

.review-hero,
.review-stage,
.review-empty,
.review-complete {
  border: 1px solid var(--review-border);
  background: var(--card-bg);
}

:global(html[data-theme='light'] .review-hero),
:global(html[data-theme='light'] .review-stage),
:global(html[data-theme='light'] .review-empty),
:global(html[data-theme='light'] .review-complete) {
  background: linear-gradient(180deg, var(--card-bg), var(--surface-muted));
}

.review-hero {
  display: grid;
  gap: 22px;
  padding: 30px;
  border-radius: var(--radius-lg);
}

.review-hero__kicker,
.review-stage__kicker,
.review-complete__kicker,
.card-face__eyebrow,
.panel-block__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: var(--tone-amber);
  font-size: 0.74rem;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  width: fit-content;
}

.review-hero__title-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: start;
}

.review-hero__title {
  margin: 10px 0 0;
  font-size: clamp(2.3rem, 4vw, 3.8rem);
  line-height: 1;
  font-weight: 850;
  letter-spacing: -0.04em;
  background: none;
  color: inherit;
}

:global(html[data-theme='light'] .review-hero__title) {
  background: none;
  color: inherit;
}

.review-hero__subtitle {
  max-width: 46rem;
  margin: 14px 0 0;
  color: var(--review-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.back-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: var(--secondary-text);
  font-size: 13.5px;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.22s ease;
}

.back-nav-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(30, 107, 82, 0.4);
  color: var(--text-color);
  transform: translateX(-2px);
}

:global(html[data-theme='light'] .back-nav-btn) {
  border-color: rgba(203, 213, 225, 0.8);
  background: rgba(255, 255, 255, 0.85);
}

:global(html[data-theme='light'] .back-nav-btn:hover) {
  background: #ffffff;
}

.review-hero__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.hero-stat {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.22s ease;
}

.hero-stat:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(30, 107, 82, 0.3);
  transform: translateY(-1px);
}

:global(html[data-theme='light'] .hero-stat) {
  border: 1px solid rgba(226, 232, 240, 0.85);
  background: rgba(255, 255, 255, 0.8);
}

.hero-stat__icon {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  border-radius: var(--radius-lg);
  font-size: 20px;
}

.hero-stat--success .hero-stat__icon {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.16);
  box-shadow: inset 0 0 0 1px rgba(52, 211, 153, 0.25);
}

.hero-stat--info .hero-stat__icon {
  color: var(--tone-blue);
  background: rgba(59, 130, 246, 0.16);
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.25);
}

.hero-stat--warning .hero-stat__icon {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.16);
  box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.25);
}

.hero-stat--accent .hero-stat__icon {
  color: #8cc3ad;
  background: rgba(30, 107, 82, 0.2);
  box-shadow: inset 0 0 0 1px rgba(140, 195, 173, 0.3);
}

.hero-stat__body {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.hero-stat__label {
  color: var(--review-soft);
  font-size: 0.8rem;
  font-weight: 600;
}

.hero-stat__value {
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

:global(html[data-theme='light'] .hero-stat__value) {
  color: var(--review-text);
}

.hero-stat__note {
  color: var(--review-muted);
  font-size: 0.8rem;
  line-height: 1.45;
}

.review-stage {
  display: grid;
  gap: 22px;
  padding: 28px;
  border-radius: var(--radius-lg);
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
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: var(--card-bg);
}

:global(html[data-theme='light'] .review-panel) {
  border: 1px solid rgba(15, 23, 42, 0.08);
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
  border-radius: var(--radius-lg);
  background: rgba(30, 107, 82, 0.1);
  border: 1px solid rgba(30, 107, 82, 0.14);
  display: grid;
  gap: 5px;
}

:global(html[data-theme='light'] .metric-chip) {
  background: rgba(30, 107, 82, 0.08);
  border: 1px solid rgba(30, 107, 82, 0.12);
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
  border-radius: var(--radius-lg);
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
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 36px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.card-face::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--card-bg);
  z-index: 0;
}

:global(html[data-theme='light'] .card-face) {
  border-color: rgba(226, 232, 240, 0.9);
}

:global(html[data-theme='light'] .card-face::before) {
  background:
    radial-gradient(circle at top right, var(--tone-violet-soft), transparent 34%),
    radial-gradient(circle at left bottom, var(--tone-cyan-soft), transparent 24%),
    var(--card-bg);
}

.card-face > * {
  position: relative;
  z-index: 1;
}

.card-face--back {
  transform: rotateY(180deg);
}

.word-text {
  margin: 14px 0 10px;
  color: var(--text-color);
  font-size: clamp(3rem, 5vw, 4.8rem);
  font-weight: 850;
  line-height: 0.92;
  letter-spacing: -0.05em;
}

:global(html[data-theme='light'] .word-text) {
  color: var(--review-text);
}

.phonetic {
  margin: 0;
  color: var(--tone-emerald);
  font-size: 1.25rem;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.meaning {
  margin: 14px 0 20px;
  color: var(--tone-amber);
  font-size: clamp(2rem, 4vw, 2.9rem);
  font-weight: 800;
  line-height: 1.15;
}

:global(html[data-theme='light'] .meaning) {
  color: #b45309;
}

.card-face__hint {
  max-width: 26rem;
  margin: 20px 0 0;
  color: var(--review-muted);
  line-height: 1.65;
  font-size: 13.5px;
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
  gap: 16px;
}

.answer-zone__placeholder {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 999px;
  color: var(--review-muted);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 13.5px;
}

:global(html[data-theme='light'] .answer-zone__placeholder) {
  background: rgba(248, 250, 252, 0.96);
  border-color: rgba(226, 232, 240, 0.85);
}

.answer-btn {
  min-width: 180px;
  font-weight: 700;
}

.answer-btn--ghost {
  border-color: rgba(248, 113, 113, 0.35) !important;
  background: rgba(239, 68, 68, 0.14) !important;
  color: var(--tone-red) !important;
}

.answer-btn--ghost:hover {
  background: rgba(239, 68, 68, 0.22) !important;
  border-color: rgba(248, 113, 113, 0.5) !important;
}

:global(html[data-theme='light'] .answer-btn--ghost) {
  background: rgba(254, 226, 226, 0.9) !important;
  border-color: rgba(248, 113, 113, 0.4) !important;
  color: #dc2626 !important;
}

.review-empty,
.review-complete {
  padding: 68px 32px;
  border-radius: var(--radius-lg);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.review-empty {
  background: var(--card-bg);
}

.empty-halo-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-halo-ring {
  position: absolute;
  inset: -10px;
  border-radius: 999px;
  background: transparent;
  animation: halo-pulse 3s infinite ease-in-out;
}

@keyframes halo-pulse {
  0%, 100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.25);
    opacity: 0.15;
  }
}

.review-empty__icon,
.review-complete__badge {
  width: 76px;
  height: 76px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-size: 34px;
  position: relative;
  z-index: 1;
}

.review-empty__icon {
  color: var(--tone-emerald);
  background: var(--card-bg);
  border: 1px solid rgba(30, 107, 82, 0.4);
}

.review-complete__badge {
  color: var(--tone-emerald);
  background: rgba(16, 185, 129, 0.16);
  border: 1px solid rgba(52, 211, 153, 0.3);
  margin-bottom: 20px;
}

.empty-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 16px;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.28);
  color: var(--tone-emerald);
  font-size: 0.76rem;
  font-weight: 750;
  letter-spacing: 0.06em;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #34d399;
}

.review-empty h2,
.review-complete h2 {
  margin: 0;
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
  font-weight: 850;
  letter-spacing: -0.03em;
  background: none;
  color: inherit;
}

:global(html[data-theme='light'] .review-empty h2),
:global(html[data-theme='light'] .review-complete h2) {
  background: none;
  color: inherit;
}

.empty-desc,
.review-complete__desc {
  max-width: 44rem;
  margin: 14px auto 0;
  color: var(--review-muted);
  line-height: 1.75;
  font-size: 14.5px;
}

.empty-insights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  max-width: 960px;
  margin: 36px auto 0;
  text-align: left;
}

.insight-card {
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: start;
  transition: all 0.22s ease;
}

.insight-card:hover {
  background: rgba(255, 255, 255, 0.055);
  border-color: rgba(30, 107, 82, 0.35);
  transform: translateY(-2px);
}

:global(html[data-theme='light'] .insight-card) {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(226, 232, 240, 0.9);
}

.insight-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.insight-icon--curve {
  color: var(--tone-emerald);
  background: rgba(30, 107, 82, 0.16);
  border: 1px solid rgba(30, 107, 82, 0.25);
}

.insight-icon--vocab {
  color: var(--tone-amber);
  background: rgba(245, 158, 11, 0.16);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.insight-icon--error {
  color: var(--tone-red);
  background: rgba(239, 68, 68, 0.16);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.insight-body strong {
  display: block;
  font-size: 14px;
  font-weight: 750;
  color: var(--text-color);
  margin-bottom: 5px;
}

:global(html[data-theme='light'] .insight-body strong) {
  color: var(--review-text);
}

.insight-body p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--review-muted);
}

.review-empty__actions,
.review-complete__actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 36px;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 24px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
}

.empty-btn--primary {
  background: var(--brand);
  border: 1px solid rgba(30, 107, 82, 0.5);
  color: var(--brand-ink);
}

.empty-btn--primary:hover {
  transform: translateY(-2px);
}

.empty-btn--secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-color);
}

.empty-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(30, 107, 82, 0.4);
  transform: translateY(-2px);
}

:global(html[data-theme='light'] .empty-btn--secondary) {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(203, 213, 225, 0.85);
}

:global(html[data-theme='light'] .empty-btn--secondary:hover) {
  background: var(--surface-muted);
  border-color: var(--card-border);
}

.empty-btn--tertiary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--secondary-text);
}

.empty-btn--tertiary:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-color);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

:global(html[data-theme='light'] .empty-btn--tertiary) {
  background: rgba(241, 245, 249, 0.8);
  border-color: rgba(203, 213, 225, 0.8);
}

:global(html[data-theme='light'] .empty-btn--tertiary:hover) {
  background: var(--surface-muted);
  border-color: var(--card-border);
  color: var(--review-text);
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
  border-radius: var(--radius-lg);
  background: var(--card-bg);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

:global(html[data-theme='light'] .complete-stat) {
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

@media (max-width: 900px) {
  .empty-insights {
    grid-template-columns: 1fr;
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
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-lg);
  }

  .queue-item {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .review-page {
    padding: 12px max(10px, env(safe-area-inset-left)) calc(22px + env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-right));
    gap: 16px;
    border-radius: var(--radius-lg);
  }

  .review-hero,
  .review-stage,
  .review-empty,
  .review-complete {
    padding: 18px 14px;
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-lg);
  }

  .panel-block__title {
    font-size: 1.28rem;
  }

  .metric-chip {
    padding: 12px;
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-lg);
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
    border-radius: var(--radius-lg);
    font-size: 30px;
  }

  .review-complete__stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .complete-stat {
    padding: 14px;
    border-radius: var(--radius-lg);
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
