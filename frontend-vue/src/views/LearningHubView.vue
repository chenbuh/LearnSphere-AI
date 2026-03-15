<template>
  <div class="learning-hub">
    <LearningHubHeader :streak="streak" :today-time="todayTime" />

    <!-- 每日挑战 -->
    <section class="daily-challenge-section">
      <SkeletonWrapper :loading="loadingChallenge" type="default" :rows="2">
        <DailyChallenge
          :challenge="dailyChallenge"
          @start="handleStartChallenge"
          @continue="handleContinueChallenge"
          @complete="handleCompleteChallenge"
          @claim="handleClaimRewards"
        />
      </SkeletonWrapper>
    </section>

    <!-- 学习模块 -->
    <LearningHubModulesSection
      :loading="loadingModules"
      :learning-modules="learningModules"
      @view-all="viewAllModules"
      @navigate="navigateToModule"
    />

    <!-- 当前学习 - 闪卡练习 -->
    <section v-if="flashcardWords.length > 0" class="flashcard-section">
      <div class="section-header">
        <h2 class="section-title">单词闪卡</h2>
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

    <!-- 听力练习 - 音频播放器 -->
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

    <!-- 成就徽章 -->
    <section class="achievements-section">
      <div class="section-header">
        <h2 class="section-title">我的成就</h2>
        <n-button text @click="viewAllAchievements">
          全部成就
          <template #icon>
            <n-icon :component="ArrowRight" size="16" />
          </template>
        </n-button>
      </div>

      <SkeletonWrapper :loading="loadingAchievements" type="achievement" :rows="3">
        <AchievementsShowcase
          :achievements="achievements"
          size="small"
        />
      </SkeletonWrapper>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NIcon, NButton, useMessage
} from 'naive-ui'
import { 
  ArrowRight, BookOpen, Headphones,
  MessageSquare, PenTool, Mic, Trophy
} from 'lucide-vue-next'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'
import DailyChallenge from '@/components/DailyChallenge.vue'
import FlashCard from '@/components/FlashCard.vue'
import AchievementsShowcase from '@/components/AchievementsShowcase.vue'
import LearningHubHeader from '@/components/learning/LearningHubHeader.vue'
import LearningHubModulesSection from '@/components/learning/LearningHubModulesSection.vue'
import LearningHubListeningSection from '@/components/learning/LearningHubListeningSection.vue'

// 导入 Store
import { useVocabularyStore } from '@/stores/vocabulary'
import { useListeningStore } from '@/stores/listening'
import { useGrammarStore } from '@/stores/grammar'
import { useReadingStore } from '@/stores/reading'
import { useUserStore } from '@/stores/user'
import taskTracker from '@/utils/taskTracker'
import { aiApi } from '@/api/ai'
import { recommendationApi } from '@/api/recommendation'
import { decryptPayload } from '@/utils/crypto'

const router = useRouter()
const message = useMessage()

// 初始化 Store
const vocabStore = useVocabularyStore()
const listeningStore = useListeningStore()
const grammarStore = useGrammarStore()
const readingStore = useReadingStore()
const userStore = useUserStore()

// 加载状态
const loadingChallenge = ref(true)
const loadingModules = ref(true)
const loadingFlashcards = ref(true)
const loadingAudio = ref(true)
const loadingAchievements = ref(true)

// 用户统计
const streak = computed(() => userStore.userInfo?.streak || 0)
const todayTime = ref(45)

// 每日挑战数据 - 动态计算
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

  const completedCount = tasks.filter(t => t.completed).length

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
    tasks: tasks,
    rewards: [
      { type: 'xp', name: '经验值', value: `+${tasks.reduce((acc, t) => acc + (t.completed ? t.reward.xp : 0), 0)} XP` },
      { type: 'badge', name: '勋章', value: '学习精锐' }
    ]
  }
})

// 学习模块
const learningModules = ref([
  {
    id: 'vocabulary',
    title: '词汇学习',
    description: '掌握核心词汇',
    icon: BookOpen,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    progress: 65,
    path: '/app/vocabulary'
  },
  {
    id: 'listening',
    title: '听力训练',
    description: '提升听力理解',
    icon: Headphones,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    progress: 40,
    path: '/app/listening'
  },
  {
    id: 'reading',
    title: '阅读理解',
    description: '增强阅读能力',
    icon: MessageSquare,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    progress: 55,
    path: '/app/reading'
  },
  {
    id: 'writing',
    title: '写作练习',
    description: '提高写作技巧',
    icon: PenTool,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    progress: 30,
    path: '/app/writing'
  },
  {
    id: 'speaking',
    title: '口语练习',
    description: '练习口语表达',
    icon: Mic,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    progress: 20,
    path: '/app/speaking'
  },
  {
    id: 'achievements',
    title: '成就徽章',
    description: '查看你的成就',
    icon: Trophy,
    color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    progress: 100,
    path: '/app/achievements'
  }
])

// 闪卡统计
const currentWordIndex = ref(0)
const flashcardWords = ref([])
const currentWord = computed(() => flashcardWords.value[currentWordIndex.value])

// 获取每日闪卡
async function fetchFlashcardWords() {
  loadingFlashcards.value = true
  try {
    // 根据系统设置或默认值获取每日单词
    const res = await vocabStore.fetchRecommended(userStore.examType || 'cet4', 5)
    if (res && res.length > 0) {
      flashcardWords.value = res.map(w => ({
        word: w.word,
        phonetic: w.phonetic || '',
        definition: w.translation || w.meaning || '',
        example: w.example || (w.examples && w.examples[0]?.en) || '',
        synonyms: w.synonyms || '',
        antonyms: w.antonyms || '',
        partOfSpeech: w.partOfSpeech || ''
      }))
    } else {
      // 如果 API 返回空，使用降级数据
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
          definition: 'adj. 极其客观的；精细的',
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

// 听力课程
// 听力课程统计
const audioLessons = ref([])
const currentAudioLesson = computed(() => audioLessons.value[0] || null)

// 获取每日听力练习
async function fetchDailyAudioLesson() {
  loadingAudio.value = true
  try {
    const res = await aiApi.getDailyListeningLesson()
    const decryptedData = decryptPayload(res.data)
    const lesson = decryptedData?.lesson
    const exhausted = Boolean(decryptedData?.exhausted)
    const emptyMessage = decryptedData?.message || '今天可用的不重复听力素材已经取完'

    if (res.code === 200 && lesson) {
      let qData = lesson.questions
      if (typeof qData === 'string') {
        try { qData = JSON.parse(qData) } catch (e) { qData = [] }
      }

      audioLessons.value = [{
        id: lesson.id,
        title: lesson.title || '今日精听训练',
        url: lesson.audioUrl || '',
        duration: lesson.duration || 180,
        script: lesson.script || lesson.audioScript || lesson.content || '',
        questions: (qData || []).slice(0, 2).map(q => ({
          question: q.question || q.text,
          options: q.options || [],
          correctAnswer: q.correct !== undefined ? Number(q.correct) : 0,
          answered: false
        }))
      }]
    } else {
      audioLessons.value = []
      if (exhausted) {
        message.info(emptyMessage)
      }
    }
  } catch (err) {
    console.error('Failed to fetch daily audio lesson:', err)
    audioLessons.value = []
  } finally {
    loadingAudio.value = false
  }
}

// 成就徽章
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
    progress: 43, // 3/7
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

// 导航到模块
function navigateToModule(module) {
  router.push(module.path)
}

function viewAllModules() {
  message.info('查看全部学习模块')
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

// 挑战相关
function handleStartChallenge(challenge) {
  message.success('开始挑战！')
}

function handleContinueChallenge(challenge) {
  message.info('继续挑战')
}

function handleCompleteChallenge(challenge) {
  message.success('挑战完成！')
}

function handleClaimRewards(challenge) {
  message.success('已领取奖励')
}

// 闪卡相关
function handleFlipCard({ flipped }) {
  console.log('Card flipped:', flipped)
}

function handleNextWord() {
  if (currentWordIndex.value < flashcardWords.value.length - 1) {
    currentWordIndex.value++
  }
}

function handlePreviousWord() {
  if (currentWordIndex.value > 0) {
    currentWordIndex.value--
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

// 音频播放器相关
function handleSpeedChange(speed) {
  console.log('Speed changed:', speed)
}

function handlePositionChange(position) {
  console.log('Position changed:', position)
}

function handleAddBookmark(bookmark) {
  message.success('书签已添加')
}

function handleAddNote(note) {
  message.success('笔记已保存')
}

// 听力题目相关
function selectAnswer(questionIndex, optionIndex) {
  if (!currentAudioLesson.value) return
  const question = currentAudioLesson.value.questions[questionIndex]
  if (!question || question.answered) return

  question.userAnswer = optionIndex
  question.answered = true
  question.correct = question.userAnswer === question.correctAnswer
}

// 模拟数据加载
onMounted(async () => {
  // 1. 初始化任务追踪（从后端同步）
  taskTracker.setMessage(message)
  await taskTracker.init()

  // 2. 获取每日闪卡
  fetchFlashcardWords()

  // 3. 获取每日听力
  fetchDailyAudioLesson()

  // 4. 模拟加载动画 (除了已动态化的，其他依然模拟)
  setTimeout(() => {
    loadingChallenge.value = false
    loadingModules.value = false
    loadingAchievements.value = false
  }, 1000)
})
</script>

<style scoped>
.learning-hub {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 区块 */
section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.3;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .learning-hub {
    padding: 16px 12px 24px;
  }

  section {
    margin-bottom: 28px;
  }

  .section-header {
    align-items: flex-start;
    flex-wrap: wrap;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 1.05rem;
  }

  .section-header :deep(.n-button) {
    padding-left: 0 !important;
  }
}

@media (max-width: 480px) {
  .learning-hub {
    padding: 12px 8px 20px;
  }

  .section-title {
    font-size: 1rem;
  }
}
</style>
