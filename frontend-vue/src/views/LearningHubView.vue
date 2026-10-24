<template>
  <div class="learning-hub">
    <LearningHubHeader
      :streak="streak"
      :today-time="todayTime"
      :learner-name="learnerName"
      :today-label="todayLabel"
      :completed-tasks="completedTaskCount"
      :total-tasks="dailyChallenge.target"
      :focus-card="focusCard"
      :quick-actions="quickActions"
      @focus-action="handleFocusAction"
      @quick-action="handleQuickAction"
    />

    <div class="hub-overview-grid">
      <div ref="modulesSection" class="hub-block hub-block--modules">
        <LearningHubModulesSection
          :loading="loadingModules"
          :learning-modules="displayLearningModules"
          @view-all="viewAllModules"
          @navigate="navigateToModule"
        />
      </div>

      <div ref="challengeSection" class="hub-block hub-block--challenge">
        <SkeletonWrapper :loading="loadingChallenge" type="default" :rows="2">
          <DailyChallenge
            :challenge="dailyChallenge"
            @start="handleStartChallenge"
            @continue="handleContinueChallenge"
            @complete="handleCompleteChallenge"
            @claim="handleClaimRewards"
          />
        </SkeletonWrapper>
      </div>
    </div>

    <div
      :class="['hub-workspace-grid', { 'hub-workspace-grid--solo': flashcardWords.length === 0 }]"
    >
      <section
        v-if="flashcardWords.length > 0"
        ref="flashcardSection"
        class="hub-block hub-block--flashcards"
      >
        <div class="section-header">
          <div>
            <p class="section-kicker">继续学习</p>
            <h2 class="section-title">单词闪卡</h2>
            <p class="section-caption">把今天该复习的词再过一轮。</p>
          </div>
          <n-button text @click="viewAllFlashcards">
            全部单词
            <template #icon>
              <n-icon :component="ArrowRight" size="16" />
            </template>
          </n-button>
        </div>

        <SkeletonWrapper :loading="loadingFlashcards" type="flashcard">
          <FlashCard
            :word="currentWord"
            :current-index="currentWordIndex"
            :total-cards="flashcardWords.length"
            @flip="handleFlipCard"
            @next="handleNextWord"
            @previous="handlePreviousWord"
            @known="handleWordKnown"
            @unknown="handleWordUnknown"
          />
        </SkeletonWrapper>
      </section>

      <div ref="listeningSection" class="hub-block hub-block--listening">
        <LearningHubListeningSection
          :loading="loadingAudio"
          :current-audio-lesson="currentAudioLesson"
          @view-all="viewAllListening"
          @speed-change="handleSpeedChange"
          @position-change="handlePositionChange"
          @bookmark-add="handleAddBookmark"
          @note-add="handleAddNote"
          @select-answer="selectAnswer"
        />
      </div>

      <section ref="achievementsSection" class="hub-block hub-block--achievements">
        <div class="section-header">
          <div>
            <p class="section-kicker">近期奖励</p>
            <h2 class="section-title">成就亮点</h2>
            <p class="section-caption">最近解锁与下一目标都放在这里。</p>
          </div>
          <n-button text @click="viewAllAchievements">
            全部成就
            <template #icon>
              <n-icon :component="ArrowRight" size="16" />
            </template>
          </n-button>
        </div>

        <div class="achievement-strip">
          <div class="achievement-strip-block">
            <span class="achievement-strip-label"
              >已解锁 {{ unlockedAchievementsCount }}/{{ achievements.length }}</span
            >
            <strong class="achievement-strip-title">{{
              latestUnlockedAchievement?.title || '继续推进中'
            }}</strong>
            <span class="achievement-strip-note">
              {{ latestUnlockedAchievement ? '最近解锁的里程碑' : '完成更多训练后会出现在这里' }}
            </span>
          </div>
          <div class="achievement-strip-block achievement-strip-block--next">
            <span class="achievement-strip-label">下一目标</span>
            <strong class="achievement-strip-title">{{
              nextAchievement?.title || '当前成就已全部完成'
            }}</strong>
            <span class="achievement-strip-note">
              {{
                nextAchievement
                  ? `当前进度 ${nextAchievement.progress || 0}%`
                  : '可以继续保持这段学习节奏'
              }}
            </span>
          </div>
        </div>

        <SkeletonWrapper :loading="loadingAchievements" type="achievement" :rows="2">
          <AchievementsShowcase :achievements="featuredAchievements" size="small" />
        </SkeletonWrapper>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NButton, useMessage } from 'naive-ui'
import { ArrowRight, BookOpen, Headphones, MessageSquare, PenTool, Mic } from 'lucide-vue-next'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'
import DailyChallenge from '@/components/DailyChallenge.vue'
import FlashCard from '@/components/FlashCard.vue'
import AchievementsShowcase from '@/components/AchievementsShowcase.vue'
import LearningHubHeader from '@/components/learning/LearningHubHeader.vue'
import LearningHubModulesSection from '@/components/learning/LearningHubModulesSection.vue'
import LearningHubListeningSection from '@/components/learning/LearningHubListeningSection.vue'
import { useVocabularyStore } from '@/stores/vocabulary'
import { useListeningStore } from '@/stores/listening'
import { useGrammarStore } from '@/stores/grammar'
import { useReadingStore } from '@/stores/reading'
import { useUserStore } from '@/stores/user'
import taskTracker from '@/utils/taskTracker'
import { aiApi } from '@/api/ai'
import { learningApi } from '@/api/learning'
import { decryptPayload } from '@/utils/crypto'

const router = useRouter()
const message = useMessage()

const vocabStore = useVocabularyStore()
const listeningStore = useListeningStore()
const grammarStore = useGrammarStore()
const readingStore = useReadingStore()
const userStore = useUserStore()

const loadingChallenge = ref(true)
const loadingModules = ref(true)
const loadingFlashcards = ref(true)
const loadingAudio = ref(true)
const loadingAchievements = ref(true)

const challengeSection = ref(null)
const modulesSection = ref(null)
const flashcardSection = ref(null)
const listeningSection = ref(null)
const achievementsSection = ref(null)

const streak = computed(() => userStore.userInfo?.streak || 0)
const todayTime = ref('待累计')
const learnerName = computed(
  () => userStore.userInfo?.nickname || userStore.userInfo?.username || '同学'
)
const todayLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(new Date())
)

const dailyChallenge = computed(() => {
  const tasks = [
    {
      title: '今日词汇学习',
      completed: vocabStore.stats.todayCount >= 10,
      reward: { xp: 10 },
      description: `已学习: ${vocabStore.stats.todayCount} / 10 个单词`
    },
    {
      title: '完成听力训练',
      completed: listeningStore.isSubmitted,
      reward: { xp: 15 },
      description: listeningStore.isSubmitted ? '今日已完成听力练习' : '尚未完成听力练习'
    },
    {
      title: '攻克语法专题',
      completed: grammarStore.isSubmitted,
      reward: { xp: 20 },
      description: grammarStore.isSubmitted ? '今日已完成语法练习' : '尚未进行语法测试'
    },
    {
      title: '深度阅读研习',
      completed: readingStore.isSubmitted,
      reward: { xp: 20 },
      description: readingStore.isSubmitted ? '今日已完成阅读理解' : '尚未进行阅读练习'
    }
  ]

  const completedCount = tasks.filter(task => task.completed).length

  return {
    id: 'daily-mission',
    title: '今日学习任务',
    description: '完成以下任务以提升你的英语水平并获取奖励。',
    type: 'daily',
    difficulty: 'medium',
    progress: completedCount,
    target: tasks.length,
    started: true,
    completed: completedCount === tasks.length,
    tasks,
    rewards: [
      {
        type: 'xp',
        name: '经验值',
        value: `+${tasks.reduce((acc, task) => acc + (task.completed ? task.reward.xp : 0), 0)} XP`
      },
      { type: 'badge', name: '勋章', value: '学习精锐' }
    ]
  }
})

const completedTaskCount = computed(() => dailyChallenge.value.progress)

const learningModules = computed(() => [
  {
    id: 'vocabulary',
    title: '词汇学习',
    description: '用短时、高频的记忆循环稳住词汇手感。',
    icon: BookOpen,
    color: 'var(--brand)',
    progress: Math.min(100, Math.max(vocabStore.stats.todayCount * 10, 18)),
    path: '/app/vocabulary'
  },
  {
    id: 'listening',
    title: '听力训练',
    description: '围绕精听、复听和题目反馈建立听力节奏。',
    icon: Headphones,
    color: 'var(--brand)',
    progress: listeningStore.isSubmitted ? 100 : 36,
    path: '/app/listening'
  },
  {
    id: 'reading',
    title: '阅读理解',
    description: '把握篇章结构、细节定位和答案依据。',
    icon: MessageSquare,
    color: 'var(--brand)',
    progress: readingStore.isSubmitted ? 100 : 52,
    path: '/app/reading'
  },
  {
    id: 'writing',
    title: '写作练习',
    description: '从思路组织到表达密度，逐步打磨写作质量。',
    icon: PenTool,
    color: 'var(--brand)',
    progress: 30,
    path: '/app/writing'
  },
  {
    id: 'speaking',
    title: '口语练习',
    description: '跟读、录音和即时反馈帮助你稳定开口。',
    icon: Mic,
    color: 'var(--brand)',
    progress: 22,
    path: '/app/speaking'
  }
])

const currentWordIndex = ref(0)
const flashcardWords = ref([])
const currentWord = computed(() => flashcardWords.value[currentWordIndex.value])

const audioLessons = ref([])
const currentAudioLesson = computed(() => audioLessons.value[0] || null)

function resolveLessonAudioUrl(lesson) {
  if (!lesson || typeof lesson !== 'object') return ''

  return (
    [lesson.audioUrl, lesson.audioPath, lesson.audio, lesson.url, lesson.mediaUrl].find(
      value => typeof value === 'string' && value.trim()
    ) || ''
  )
}

function resolveLessonPlaybackText(lesson) {
  if (!lesson || typeof lesson !== 'object') return ''

  return (
    [
      lesson.script,
      lesson.audioScript,
      lesson.transcript,
      lesson.transcription,
      lesson.passage,
      lesson.content,
      lesson.text,
      lesson.description,
      lesson.title
    ].find(value => typeof value === 'string' && value.trim()) || ''
  )
}

const achievements = ref([
  {
    id: 1,
    type: 'milestone',
    category: 'milestone',
    title: '启航者',
    description: '完成第一堂课，开启学习之旅',
    unlocked: true,
    unlockedAt: Date.now() - 86400000 * 5,
    reward: { xp: 10 }
  },
  {
    id: 2,
    type: 'streak',
    category: 'daily',
    title: '不懈努力',
    description: '连续学习 3 天',
    unlocked: true,
    unlockedAt: Date.now() - 3600000 * 12,
    progress: 100,
    reward: { xp: 30 }
  },
  {
    id: 3,
    type: 'perfect',
    category: 'special',
    title: '百发百中',
    description: '在一次单词测试中获得满分',
    unlocked: true,
    unlockedAt: Date.now() - 3600000 * 24,
    progress: 100,
    reward: { xp: 50 }
  },
  {
    id: 4,
    type: 'learning',
    category: 'learning',
    title: '词汇达人',
    description: '累计掌握 100 个单词',
    unlocked: false,
    progress: 65,
    reward: { xp: 100 }
  },
  {
    id: 5,
    type: 'listening',
    category: 'learning',
    title: '顺风耳',
    description: '累计听力时间达到 10 小时',
    unlocked: false,
    progress: 30,
    reward: { xp: 150 }
  },
  {
    id: 6,
    type: 'speed',
    category: 'special',
    title: '思如泉涌',
    description: '在 5 分钟内完成一次综合测验',
    unlocked: false,
    progress: 0,
    reward: { xp: 200 }
  },
  {
    id: 7,
    type: 'streak',
    category: 'daily',
    title: '习惯成自然',
    description: '连续学习 7 天',
    unlocked: false,
    progress: 43,
    reward: { xp: 100 }
  },
  {
    id: 8,
    type: 'milestone',
    category: 'milestone',
    title: '初露锋芒',
    description: '总经验值达到 1000 XP',
    unlocked: false,
    progress: 75,
    reward: { xp: 300 }
  }
])

const unlockedAchievementsCount = computed(
  () => achievements.value.filter(item => item.unlocked).length
)

const latestUnlockedAchievement = computed(
  () =>
    [...achievements.value]
      .filter(item => item.unlocked)
      .sort((left, right) => Number(right.unlockedAt || 0) - Number(left.unlockedAt || 0))[0] ||
    null
)

const nextAchievement = computed(
  () =>
    [...achievements.value]
      .filter(item => !item.unlocked)
      .sort((left, right) => Number(right.progress || 0) - Number(left.progress || 0))[0] || null
)

const featuredAchievements = computed(() =>
  [...achievements.value]
    .sort(
      (left, right) =>
        Number(Boolean(right.unlocked)) - Number(Boolean(left.unlocked)) ||
        Number(right.unlockedAt || 0) - Number(left.unlockedAt || 0) ||
        Number(right.progress || 0) - Number(left.progress || 0)
    )
    .slice(0, 2)
)

const taskRouteMap = {
  今日词汇学习: '/app/vocabulary',
  完成听力训练: '/app/listening',
  攻克语法专题: '/app/grammar',
  深度阅读研习: '/app/reading'
}

const nextIncompleteTask = computed(
  () => dailyChallenge.value.tasks.find(task => !task.completed) || null
)

const weakestModule = computed(() => {
  const candidates = learningModules.value.filter(module => module.id !== 'achievements')
  return (
    [...candidates].sort((left, right) => left.progress - right.progress)[0] ||
    learningModules.value[0] ||
    null
  )
})

const focusPath = computed(() => {
  if (nextIncompleteTask.value) {
    return taskRouteMap[nextIncompleteTask.value.title] || '/app/vocabulary'
  }
  return weakestModule.value?.path || '/app/vocabulary'
})

function getModuleStatusText(module) {
  if (module.id === 'achievements') {
    return `${unlockedAchievementsCount.value} 个成就已解锁`
  }
  if (module.progress >= 90) return '今日节奏已经拉满'
  if (module.progress >= 60) return '继续稳定推进'
  if (module.progress >= 35) return '适合补一轮'
  return '建议优先安排'
}

function getModuleEyebrow(module) {
  if (module.path === focusPath.value) return '今日重点'
  if (module.progress >= 60) return '保持热度'
  return '学习模块'
}

const displayLearningModules = computed(() =>
  learningModules.value.map(module => ({
    ...module,
    isFocus: module.path === focusPath.value,
    eyebrow: getModuleEyebrow(module),
    statusText: getModuleStatusText(module)
  }))
)

const focusCard = computed(() => {
  if (nextIncompleteTask.value) {
    return {
      title: nextIncompleteTask.value.title,
      description: nextIncompleteTask.value.description,
      meta: `今日任务 ${completedTaskCount.value}/${dailyChallenge.value.target}`,
      ctaLabel: '前往处理',
      path: focusPath.value
    }
  }

  return {
    title: weakestModule.value ? `推进 ${weakestModule.value.title}` : '开始今日学习',
    description: weakestModule.value?.description || '从一个最值得推进的模块开始进入状态。',
    meta: weakestModule.value ? `当前进度 ${weakestModule.value.progress}%` : '准备开始今日学习',
    ctaLabel: weakestModule.value ? '继续练习' : '开始学习',
    path: focusPath.value
  }
})

const quickActions = computed(() => {
  const actions = [
    {
      key: 'challenge',
      label: '任务',
      description: `${completedTaskCount.value}/${dailyChallenge.value.target} 已完成`,
      target: 'challenge'
    },
    {
      key: 'modules',
      label: '模块',
      description: `${learningModules.value.length} 个入口`,
      target: 'modules'
    }
  ]

  if (flashcardWords.value.length > 0) {
    actions.push({
      key: 'flashcards',
      label: '闪卡',
      description: `${flashcardWords.value.length} 张待练`,
      target: 'flashcards'
    })
  }

  if (currentAudioLesson.value) {
    actions.push({
      key: 'listening',
      label: '听力',
      description: `约 ${Math.max(1, Math.round((currentAudioLesson.value.duration || 180) / 60))} 分钟`,
      target: 'listening'
    })
  }

  actions.push({
    key: 'achievements',
    label: '成就',
    description: `${unlockedAchievementsCount.value} 个已解锁`,
    target: 'achievements'
  })

  return actions.slice(0, 4)
})

const sectionTargetMap = {
  challenge: challengeSection,
  modules: modulesSection,
  flashcards: flashcardSection,
  listening: listeningSection,
  achievements: achievementsSection
}

function scrollToTarget(targetKey) {
  const target = sectionTargetMap[targetKey]?.value
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleFocusAction(focus) {
  if (focus?.path) {
    router.push(focus.path)
    return
  }
  if (focus?.target) {
    scrollToTarget(focus.target)
  }
}

function handleQuickAction(action) {
  if (action?.path) {
    router.push(action.path)
    return
  }
  if (action?.target) {
    scrollToTarget(action.target)
  }
}

async function fetchFlashcardWords() {
  loadingFlashcards.value = true
  try {
    const res = await vocabStore.fetchRecommended(userStore.examType || 'cet4', 5)
    if (res && res.length > 0) {
      flashcardWords.value = res.map(word => ({
        word: word.word,
        phonetic: word.phonetic || '',
        definition: word.translation || word.meaning || '',
        example: word.example || (word.examples && word.examples[0]?.en) || '',
        synonyms: word.synonyms || '',
        antonyms: word.antonyms || '',
        partOfSpeech: word.partOfSpeech || ''
      }))
    } else {
      flashcardWords.value = [
        {
          word: 'resilience',
          phonetic: '/rɪˈzɪliəns/',
          definition: 'n. 韧性；弹力；恢复力',
          example: 'She showed great resilience in the face of adversity.',
          partOfSpeech: 'noun'
        },
        {
          word: 'meticulous',
          phonetic: '/məˈtɪkjələs/',
          definition: 'adj. 一丝不苟的；极其细致的',
          example: 'He was meticulous in his preparation for the exam.',
          partOfSpeech: 'adjective'
        }
      ]
    }
  } catch (error) {
    console.error('Failed to fetch flashcard words:', error)
  } finally {
    loadingFlashcards.value = false
  }
}

async function fetchDailyAudioLesson() {
  loadingAudio.value = true
  try {
    const res = await aiApi.getDailyListeningLesson()
    const decryptedData = decryptPayload(res.data)
    const lesson = decryptedData?.lesson
    const exhausted = Boolean(decryptedData?.exhausted)
    const emptyMessage = decryptedData?.message || '今天可用的不重复听力素材已经取完'

    if (res.code === 200 && lesson) {
      let questionData = lesson.questions
      if (typeof questionData === 'string') {
        try {
          questionData = JSON.parse(questionData)
        } catch (error) {
          questionData = []
        }
      }

      const normalizeQuestionOptions = options => {
        if (!Array.isArray(options)) return []
        return options
          .map(option => {
            if (typeof option === 'string' || typeof option === 'number') {
              return String(option)
            }

            if (option && typeof option === 'object') {
              return option.text || option.content || option.label || option.value || ''
            }

            return ''
          })
          .filter(Boolean)
      }

      const normalizeCorrectAnswer = question => {
        const rawCorrect = question?.correct ?? question?.correctAnswer ?? question?.answer

        if (typeof rawCorrect === 'number' && Number.isFinite(rawCorrect)) {
          return rawCorrect
        }

        if (typeof rawCorrect === 'string') {
          const trimmed = rawCorrect.trim()
          if (!trimmed) return -1

          if (/^\d+$/.test(trimmed)) {
            return Number(trimmed)
          }

          const upper = trimmed.toUpperCase()
          const letterIndex = upper.charCodeAt(0) - 65
          if (letterIndex >= 0 && letterIndex < 26) {
            return letterIndex
          }
        }

        return -1
      }

      audioLessons.value = [
        {
          id: lesson.id,
          title: lesson.title || '今日精听训练',
          url: resolveLessonAudioUrl(lesson),
          duration: lesson.duration || 180,
          script: resolveLessonPlaybackText(lesson),
          audioScript: lesson.audioScript || lesson.script || '',
          transcript: lesson.transcript || lesson.transcription || '',
          content: lesson.content || lesson.passage || lesson.text || '',
          questions: (questionData || []).slice(0, 2).map(question => ({
            question: question.question || question.text,
            options: normalizeQuestionOptions(question.options),
            correctAnswer: normalizeCorrectAnswer(question),
            answered: false
          }))
        }
      ]
    } else {
      audioLessons.value = []
      if (exhausted) {
        message.info(emptyMessage)
      }
    }
  } catch (error) {
    console.error('Failed to fetch daily audio lesson:', error)
    audioLessons.value = []
  } finally {
    loadingAudio.value = false
  }
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function fetchLearningStats() {
  try {
    const res = await learningApi.getStatistics()
    const weeklyStats = Array.isArray(res?.data?.weeklyStats) ? res.data.weeklyStats : []
    const todayStat = weeklyStats.find(item => item.date === getLocalDateKey())
    const timeSpent = Number(todayStat?.timeSpent)

    if (res?.code === 200 && Number.isFinite(timeSpent) && timeSpent >= 0) {
      todayTime.value = Math.round(timeSpent / 60)
      return
    }
  } catch (error) {
    console.warn('Failed to fetch learning statistics:', error)
  }

  todayTime.value = '待累计'
}

function navigateToModule(module) {
  router.push(module.path)
}

function viewAllModules() {
  router.push({ name: 'Analysis' })
}

function viewAllFlashcards() {
  router.push('/app/vocabulary')
}

function viewAllListening() {
  router.push('/app/listening')
}

function viewAllAchievements() {
  router.push('/app/achievements')
}

function handleStartChallenge() {
  message.success('开始挑战！')
}

function handleContinueChallenge() {
  message.info('继续挑战')
}

function handleCompleteChallenge() {
  message.success('挑战完成！')
}

function handleClaimRewards() {
  message.success('已领取奖励')
}

function handleFlipCard({ flipped }) {
  console.log('Card flipped:', flipped)
}

function handleNextWord() {
  if (currentWordIndex.value < flashcardWords.value.length - 1) {
    currentWordIndex.value += 1
  }
}

function handlePreviousWord() {
  if (currentWordIndex.value > 0) {
    currentWordIndex.value -= 1
  }
}

function handleWordKnown(word) {
  message.success(`已掌握：${word.word}`)
  handleNextWord()
}

function handleWordUnknown(word) {
  message.info(`需要复习：${word.word}`)
  handleNextWord()
}

function handleSpeedChange(speed) {
  console.log('Speed changed:', speed)
}

function handlePositionChange(position) {
  console.log('Position changed:', position)
}

function handleAddBookmark() {
  message.success('书签已添加')
}

function handleAddNote() {
  message.success('笔记已保存')
}

function selectAnswer(questionIndex, optionIndex) {
  if (!currentAudioLesson.value) return
  const question = currentAudioLesson.value.questions[questionIndex]
  if (!question || question.answered) return

  question.userAnswer = optionIndex
  question.answered = true
  question.correct = question.userAnswer === question.correctAnswer
}

onMounted(async () => {
  taskTracker.setMessage(message)
  await taskTracker.init()

  fetchLearningStats()
  fetchFlashcardWords()
  fetchDailyAudioLesson()

  setTimeout(() => {
    loadingChallenge.value = false
    loadingModules.value = false
    loadingAchievements.value = false
  }, 1000)
})
</script>

<style scoped>
.learning-hub {
  position: relative;
  max-width: 1480px;
  margin: 0 auto;
  padding: 24px 30px 64px;
}

.hub-block {
  position: relative;
  min-width: 0;
  scroll-margin-top: 84px;
}

.hub-overview-grid,
.hub-workspace-grid {
  display: grid;
  gap: 22px;
  margin-bottom: 28px;
}

.hub-workspace-grid > :only-child {
  grid-column: 1 / -1;
}

.hub-block--modules,
.hub-block--flashcards,
.hub-block--listening,
.hub-block--achievements {
  min-width: 0;
  border: 1px solid var(--card-border);
  border-radius: var(--radius-lg);
  background: var(--card-bg);
}

.hub-block--modules {
  padding: 22px 22px 24px;
}

.hub-block--flashcards,
.hub-block--listening {
  padding: 22px;
}

.hub-block--flashcards {
  grid-area: flashcards;
}

.hub-block--listening {
  grid-area: listening;
}

.hub-block--achievements {
  grid-area: achievements;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-kicker {
  margin: 0 0 6px;
  color: var(--secondary-text);
  font-size: 12px;
  font-weight: 500;
}

.section-title {
  margin: 0;
  color: var(--text-color);
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 700;
}

.section-caption {
  max-width: 36rem;
  margin: 8px 0 0;
  color: var(--secondary-text);
  font-size: 14px;
  line-height: 1.6;
}

.hub-block--achievements {
  padding: 22px 22px 24px;
}

.achievement-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin-bottom: 16px;
  border-top: 1px solid var(--card-border);
  border-bottom: 1px solid var(--card-border);
}

.achievement-strip-block {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 4px 14px 0;
}

.achievement-strip-block--next {
  padding-left: 16px;
  border-left: 1px solid var(--card-border);
}

.achievement-strip-label {
  color: var(--secondary-text);
  font-size: 12px;
}

.achievement-strip-title {
  color: var(--text-color);
  font-size: 15px;
  line-height: 1.35;
}

.achievement-strip-note {
  color: var(--secondary-text);
  font-size: 12px;
  line-height: 1.5;
}

.hub-block--achievements :deep(.achievements-showcase) {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.hub-block--achievements :deep(.showcase-header),
.hub-block--achievements :deep(.category-tabs),
.hub-block--achievements :deep(.new-unlock-banner) {
  display: none;
}

.hub-block--achievements :deep(.achievements-list) {
  grid-template-columns: 1fr;
  gap: 10px;
}

.hub-block--achievements :deep(.achievement-badge) {
  border-radius: var(--radius-md);
  border-color: var(--card-border);
  background: var(--card-bg);
  box-shadow: none;
}

.hub-block--achievements :deep(.achievement-badge.unlocked) {
  background: var(--card-bg);
  border-color: var(--card-border);
}

.hub-block--achievements :deep(.achievement-badge:hover) {
  transform: none;
  border-color: var(--brand);
  box-shadow: none;
}

.hub-block--achievements :deep(.badge-bg-glow) {
  display: none;
}

.hub-block--achievements :deep(.badge-content) {
  gap: 12px;
  padding: 13px;
}

.hub-block--achievements :deep(.badge-icon) {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  box-shadow: none;
}

.hub-block--achievements :deep(.achievement-badge.unlocked .badge-icon) {
  box-shadow: none;
}

.hub-block--achievements :deep(.achievement-badge.unlocked:hover .badge-icon) {
  transform: none;
  box-shadow: none;
}

.hub-block--achievements :deep(.badge-description) {
  margin-bottom: 0;
  min-height: 0;
}

.hub-block--achievements :deep(.badge-progress-wrap) {
  margin-top: 8px;
}

.hub-block--challenge :deep(.daily-challenge) {
  padding: 22px 22px 20px;
  border-radius: var(--radius-lg);
  border-color: var(--card-border);
  background: var(--card-bg);
  box-shadow: none;
}

.hub-block--challenge :deep(.challenge-header) {
  margin-bottom: 16px;
  padding-top: 0;
}

.hub-block--challenge :deep(.challenge-icon) {
  width: 48px;
  height: 48px;
  border-width: 1px;
  border-color: var(--card-border);
  background: var(--surface-muted);
}

.hub-block--challenge :deep(.countdown) {
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  border-color: var(--card-border);
  background: var(--surface-muted);
  font-size: 12px;
}

.hub-block--challenge :deep(.challenge-progress),
.hub-block--challenge :deep(.challenge-rewards) {
  padding: 14px 15px;
  border-radius: var(--radius-md);
  border: 1px solid var(--card-border);
  background: var(--surface-muted);
}

.hub-block--challenge :deep(.challenge-description) {
  margin-bottom: 12px;
}

.hub-block--challenge :deep(.challenge-description p) {
  font-size: 13px;
  color: var(--secondary-text);
}

.hub-block--challenge :deep(.tasks-header) {
  margin-bottom: 10px;
}

.hub-block--challenge :deep(.tasks-list) {
  gap: 6px;
}

.hub-block--challenge :deep(.task-item) {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border-color: var(--card-border);
  background: var(--card-bg);
}

.hub-block--challenge :deep(.task-title) {
  line-height: 1.45;
}

.hub-block--challenge :deep(.challenge-actions) {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.hub-block--challenge :deep(.rewards-toggle) {
  flex: 0 0 auto;
}

.hub-block--challenge :deep(.challenge-actions .n-button) {
  min-height: 40px;
}

.hub-block--flashcards :deep(.flash-card-container) {
  max-width: none;
  gap: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.hub-block--flashcards :deep(.flash-card-wrapper) {
  height: 380px;
}

.hub-block--flashcards :deep(.card-actions) {
  max-width: 680px;
}

@media (min-width: 1280px) {
  .hub-overview-grid {
    grid-template-columns: minmax(0, 1.46fr) minmax(290px, 0.58fr);
    align-items: start;
    gap: 22px;
  }

  .hub-workspace-grid {
    grid-template-columns: minmax(0, 1.08fr) minmax(330px, 0.8fr);
    grid-template-areas:
      'flashcards listening'
      'achievements listening';
    align-items: start;
    gap: 22px;
  }

  .hub-workspace-grid--solo {
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.7fr);
    grid-template-areas: 'listening achievements';
  }

  .hub-block--challenge {
    position: sticky;
    top: 88px;
  }

  .hub-block--listening {
    align-self: stretch;
  }

  .hub-workspace-grid--solo .hub-block--achievements {
    position: sticky;
    top: 88px;
    align-self: start;
  }

  .hub-block--modules,
  .hub-block--flashcards,
  .hub-block--listening,
  .hub-block--achievements {
    padding-left: 22px;
    padding-right: 22px;
  }

  .hub-block--modules {
    padding-top: 22px;
    padding-bottom: 22px;
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: 420px;
  }

  .hub-block--challenge :deep(.task-desc) {
    display: none;
  }
}

@media (max-width: 1279px) {
  .learning-hub {
    padding: 20px 22px 48px;
  }

  .hub-overview-grid,
  .hub-workspace-grid {
    gap: 20px;
    margin-bottom: 24px;
  }

  .hub-block--modules,
  .hub-block--flashcards,
  .hub-block--listening,
  .hub-block--achievements {
    border-radius: var(--radius-lg);
  }

  .hub-block--modules,
  .hub-block--flashcards,
  .hub-block--listening,
  .hub-block--achievements,
  .hub-block--challenge :deep(.daily-challenge) {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hub-block--modules,
  .hub-block--flashcards,
  .hub-block--listening,
  .hub-block--achievements {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .hub-block--challenge :deep(.daily-challenge) {
    padding-top: 18px;
    padding-bottom: 18px;
    border-radius: var(--radius-lg);
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: 392px;
  }
}

@media (min-width: 1100px) and (max-width: 1279px) {
  .hub-overview-grid {
    grid-template-columns: minmax(0, 1.18fr) minmax(280px, 0.72fr);
    align-items: start;
    gap: 18px;
  }

  .hub-workspace-grid {
    grid-template-columns: minmax(0, 1fr) minmax(340px, 0.82fr);
    grid-template-areas:
      'flashcards listening'
      'achievements listening';
    align-items: start;
    gap: 18px;
  }

  .hub-workspace-grid--solo {
    grid-template-columns: minmax(0, 1.02fr) minmax(300px, 0.78fr);
    grid-template-areas: 'listening achievements';
  }

  .hub-block--listening {
    align-self: stretch;
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: 364px;
  }
}

@media (max-height: 900px) and (min-width: 901px) {
  .learning-hub {
    padding-top: 18px;
    padding-bottom: 40px;
  }

  .hub-overview-grid,
  .hub-workspace-grid {
    gap: 18px;
    margin-bottom: 22px;
  }

  .hub-block--challenge,
  .hub-workspace-grid--solo .hub-block--achievements {
    position: static;
    top: auto;
  }

  .hub-block--challenge :deep(.daily-challenge) {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .hub-block--challenge :deep(.challenge-progress),
  .hub-block--challenge :deep(.challenge-rewards) {
    padding: 12px 14px;
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: 360px;
  }
}

@media (max-height: 780px) and (min-width: 1100px) {
  .hub-block--challenge :deep(.challenge-description) {
    margin-bottom: 8px;
  }

  .hub-block--challenge :deep(.task-desc) {
    display: none;
  }

  .hub-block--challenge :deep(.tasks-list) {
    gap: 4px;
  }

  .hub-block--challenge :deep(.task-item) {
    padding: 9px 10px;
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: 330px;
  }
}

@media (max-width: 1099px) {
  .hub-overview-grid,
  .hub-workspace-grid {
    gap: 24px;
    margin-bottom: 30px;
  }

  .hub-block--achievements {
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }
}

@media (max-width: 900px) {
  .learning-hub {
    width: min(100%, 100vw);
    padding: 16px max(14px, env(safe-area-inset-right)) calc(34px + env(safe-area-inset-bottom))
      max(14px, env(safe-area-inset-left));
    box-sizing: border-box;
    overflow-x: clip;
  }

  /*
   * 单列化根因修复：桌面端给子块写了命名 grid-area（flashcards / listening / achievements），
   * 窄屏只改列数时这些命名区域仍会生成隐式轨道，三个子块被挤进 0px 隐式列并叠在同一格，
   * 造成 section-kicker / section-title / section-caption 互相压字。
   * !important 用于覆盖 global-mobile.css 里已有的 `grid-template-columns: 1fr !important`。
   */
  .hub-overview-grid,
  .hub-workspace-grid,
  .hub-workspace-grid--solo {
    grid-template-columns: minmax(0, 1fr) !important;
    grid-template-areas: none !important;
  }

  .hub-overview-grid > *,
  .hub-workspace-grid > *,
  .hub-workspace-grid--solo > * {
    grid-area: auto !important;
    min-width: 0;
  }

  /* 触控目标：表头文字按钮实测仅 30px 高，放宽到 36px。 */
  .hub-block--modules .section-header :deep(.n-button),
  .hub-block--flashcards .section-header :deep(.n-button),
  .hub-block--listening .section-header :deep(.n-button),
  .hub-block--achievements .section-header :deep(.n-button) {
    min-height: 36px;
  }

  /*
   * 字号下限：项目根字号被压到 14.08px，rem 标题在窄屏会缩到 14px 以下，
   * 这里用 max() 兜底，保证标题 ≥16px、正文 ≥13px；桌面端不受影响。
   */
  .section-title {
    font-size: max(1.2rem, 16px);
  }

  .section-caption {
    font-size: max(0.875rem, 13px);
  }

  .achievement-strip-label,
  .achievement-strip-note {
    font-size: max(0.8125rem, 13px);
  }

  .achievement-strip-title {
    font-size: max(0.9375rem, 15px);
  }

  /* 闪卡里的发音按钮实测 26×29px，补到 32×32 最小触控尺寸。 */
  .hub-block--flashcards :deep(.play-sound-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    min-height: 32px;
  }

  /* 听力播放器的倍速按钮实测仅 28px 高，抬高到 36px。 */
  .hub-block--listening :deep(.speed-control .n-button) {
    min-height: 36px;
  }

  /* 听力预览区的小按钮与文字链接实测 28px / 17px 高，统一补到 36px。 */
  .hub-block--listening :deep(.questions-entry .n-button),
  .hub-block--listening :deep(.question-glance-link) {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
  }
}

@media (max-width: 640px) {
  .learning-hub {
    padding: 12px max(10px, env(safe-area-inset-right)) calc(28px + env(safe-area-inset-bottom))
      max(10px, env(safe-area-inset-left));
  }

  .hub-overview-grid,
  .hub-workspace-grid {
    gap: 20px;
    margin-bottom: 24px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  .section-title {
    font-size: max(1.1rem, 16px);
  }

  .section-caption {
    margin-top: 6px;
    font-size: 13px;
  }

  .achievement-strip {
    grid-template-columns: 1fr;
  }

  .achievement-strip-block {
    padding-right: 0;
  }

  .achievement-strip-block--next {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid rgba(148, 163, 184, 0.08);
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: clamp(320px, 62svh, 350px);
  }

  .hub-block--flashcards :deep(.card-actions) {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .learning-hub {
    padding: 10px max(8px, env(safe-area-inset-right)) calc(22px + env(safe-area-inset-bottom))
      max(8px, env(safe-area-inset-left));
  }

  .hub-overview-grid,
  .hub-workspace-grid {
    gap: 16px;
    margin-bottom: 18px;
  }

  .hub-block--modules,
  .hub-block--flashcards,
  .hub-block--listening {
    padding: 14px;
    border-radius: var(--radius-lg);
  }

  .hub-block--challenge :deep(.daily-challenge) {
    padding: 14px;
    border-radius: var(--radius-lg);
  }

  .hub-block--challenge :deep(.challenge-progress),
  .hub-block--challenge :deep(.challenge-rewards) {
    padding: 12px;
  }

  .section-title {
    font-size: max(1rem, 16px);
  }

  .section-caption {
    font-size: 13px;
    line-height: 1.5;
  }

  .achievement-strip-title {
    font-size: 14px;
  }

  .achievement-strip-note {
    font-size: 13px;
  }

  .hub-block--challenge :deep(.challenge-actions) {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .hub-block--challenge :deep(.rewards-toggle),
  .hub-block--challenge :deep(.challenge-actions .n-button) {
    width: 100%;
  }

  .hub-block--challenge :deep(.challenge-header) {
    gap: 10px;
  }

  .hub-block--challenge :deep(.challenge-icon) {
    width: 42px;
    height: 42px;
    border-radius: var(--radius-lg);
  }

  .hub-block--achievements :deep(.badge-content) {
    gap: 10px;
    padding: 12px;
  }

  .hub-block--achievements :deep(.badge-icon) {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: clamp(280px, 58svh, 320px);
  }

  .hub-block--flashcards :deep(.card-actions) {
    gap: 10px;
  }
}

@media (max-width: 360px) {
  .learning-hub {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
    padding-bottom: calc(20px + env(safe-area-inset-bottom));
  }

  .section-title {
    font-size: max(0.96rem, 16px);
  }

  .section-caption {
    font-size: 13px;
  }

  .achievement-strip-block {
    padding-top: 12px;
    padding-bottom: 12px;
  }

  .hub-block--challenge :deep(.task-item) {
    padding: 9px 10px;
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: clamp(248px, 56svh, 292px);
  }
}

@media (max-width: 900px) and (orientation: landscape) {
  .learning-hub {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }

  .hub-overview-grid,
  .hub-workspace-grid {
    gap: 16px;
    margin-bottom: 16px;
  }

  .hub-block--challenge :deep(.daily-challenge) {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .hub-block--flashcards :deep(.flash-card-wrapper) {
    height: min(66svh, 280px);
  }
}

@media (max-width: 768px) {
  .learning-hub,
  .hub-overview-grid,
  .hub-workspace-grid,
  .hub-block--modules,
  .hub-block--flashcards,
  .hub-block--listening,
  .hub-block--achievements,
  .achievement-strip,
  .achievement-strip-block {
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  .hub-overview-grid,
  .hub-workspace-grid {
    align-items: start;
  }

  /*
   * global-mobile.css 在 768px 已把 .achievement-strip 压成单列，
   * 但“下一目标”块仍保留左侧分隔线与 16px 缩进，单列下整块会被推进去；
   * 这里把竖分隔线换成上边框，两段说明在单列里左对齐。
   */
  .achievement-strip-block--next {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid var(--card-border);
  }

  .section-title,
  .section-caption,
  .achievement-strip-title,
  .achievement-strip-note {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .section-header :deep(.n-button) {
    align-self: flex-start;
    min-width: 0;
  }

  .hub-block--achievements :deep(.badge-content),
  .hub-block--achievements :deep(.badge-copy) {
    min-width: 0;
  }
}

/*
 * 闪卡正反面是叠在同一矩形上的两块 3D 面板：backface-visibility 只保证背面不被绘制，
 * 但正面的“点击卡片查看释义”与背面的词性标签在几何上仍然互压。
 * 给当前不可见的那一面补 visibility:hidden；0.3s 延迟对齐 0.6s 翻转动画的中点半程，
 * 翻转过程看不出差别，只去掉不可见面参与布局与朗读。
 * 不限断点：该重叠与视口宽度无关，1024px 同样会压住。
 */
.hub-block--flashcards :deep(.card-front),
.hub-block--flashcards :deep(.card-back) {
  transition: visibility 0s linear 0.3s;
}

.hub-block--flashcards :deep(.flash-card.flipped .card-front),
.hub-block--flashcards :deep(.flash-card:not(.flipped) .card-back) {
  visibility: hidden;
}
</style>
