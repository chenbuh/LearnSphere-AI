<template>
  <div class="learning-hub">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">学习中心</h1>
        <p class="page-subtitle">选择你想要练习的内容</p>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <n-icon :component="Flame" size="20" color="#f97316" />
          <span>{{ streak }} 天</span>
        </div>
        <div class="stat-item">
          <n-icon :component="Clock" size="20" color="#3b82f6" />
          <span>{{ todayTime }} 分钟</span>
        </div>
      </div>
    </div>

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
    <section class="learning-modules">
      <div class="section-header">
        <h2 class="section-title">学习模块</h2>
        <n-button text @click="viewAllModules">
          查看全部
          <template #icon>
            <n-icon :component="ArrowRight" size="16" />
          </template>
        </n-button>
      </div>

      <SkeletonWrapper :loading="loadingModules" type="card-grid" :rows="4">
        <div class="modules-grid">
          <div
            v-for="module in learningModules"
            :key="module.id"
            class="module-card"
            @click="navigateToModule(module)"
          >
            <div class="module-icon" :style="{ background: module.color }">
              <n-icon :component="module.icon" size="28" color="#ffffff" />
            </div>
            <div class="module-info">
              <h3 class="module-title">{{ module.title }}</h3>
              <p class="module-description">{{ module.description }}</p>
              <div class="module-progress">
                <n-progress
                  type="line"
                  :percentage="module.progress"
                  :show-indicator="false"
                  :height="4"
                />
                <span class="progress-text">{{ module.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </SkeletonWrapper>
    </section>

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
    <section v-if="audioLessons.length > 0" class="listening-section">
      <div class="section-header">
        <h2 class="section-title">听力练习</h2>
        <n-button text @click="viewAllListening">
          全部课程
          <template #icon>
            <n-icon :component="ArrowRight" size="16" />
          </template>
        </n-button>
      </div>

      <SkeletonWrapper :loading="loadingAudio" type="audio-player">
        <AudioPlayer
          :src="currentAudioLesson.url"
          :audio-text="currentAudioLesson.script || currentAudioLesson.title"
          :initial-speed="1.0"
          @speed-change="handleSpeedChange"
          @position-change="handlePositionChange"
          @bookmark-add="handleAddBookmark"
          @note-add="handleAddNote"
        />
      </SkeletonWrapper>

      <!-- 听力题目 -->
      <div v-if="currentAudioLesson.questions" class="listening-questions">
        <div
          v-for="(question, index) in currentAudioLesson.questions"
          :key="index"
          class="question-item"
        >
          <div class="question-header">
            <span class="question-number">题目 {{ index + 1 }}</span>
            <n-tag v-if="question.answered" :type="question.correct ? 'success' : 'error'">
              {{ question.correct ? '正确' : '错误' }}
            </n-tag>
          </div>
          <div class="question-content">{{ question.question }}</div>
          <div class="question-options">
            <div
              v-for="(option, optIndex) in question.options"
              :key="optIndex"
              :class="['question-option', {
                selected: question.userAnswer === optIndex,
                correct: question.answered && question.correctAnswer === optIndex,
                wrong: question.answered && question.userAnswer === optIndex && !question.correct
              }]"
              @click="selectAnswer(index, optIndex)"
            >
              {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
            </div>
          </div>
        </div>
      </div>
    </section>

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
  NIcon, NButton, NProgress, NTag, useMessage
} from 'naive-ui'
import { 
  Flame, Clock, ArrowRight, BookOpen, Headphones,
  MessageSquare, PenTool, Mic, Trophy
} from 'lucide-vue-next'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'
import DailyChallenge from '@/components/DailyChallenge.vue'
import FlashCard from '@/components/FlashCard.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import AchievementsShowcase from '@/components/AchievementsShowcase.vue'

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
    // 1. 尝试从历史记录获取最近的一次练习，作为“每日回顾”或“每日推荐”的基础
    const res = await aiApi.getListeningHistory(1, 1)
    if (res.code === 200 && (res.data.records?.length > 0 || res.data.length > 0)) {
       const records = res.data.records || res.data
       const latest = decryptPayload(records[0])
       
       // 解析题目信息
       let qData = latest.questions
       if (typeof qData === 'string') {
         try { qData = JSON.parse(qData) } catch (e) { qData = [] }
       }
       
       // 适配数据到 Hub 的简化播放器
       audioLessons.value = [{
          id: latest.id,
          title: latest.title || '今日精听训练',
          // 增加兜底：使用有道 TTS 生成欢迎语，该资源已包含在 CSP 白名单中，更稳定
          url: latest.audioUrl || `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent('Welcome to Learn Sphere AI. Let us start our listening practice today.')}&type=2`, 
          duration: latest.duration || 180,
          script: latest.script || latest.content || '',
          questions: (qData || []).slice(0, 2).map(q => ({
             question: q.question || q.text,
             options: q.options || [],
             correctAnswer: q.correct !== undefined ? Number(q.correct) : 0,
             answered: false
          }))
       }]
    } else {
       // 2. 备选方案：展示一个默认但标题随机的练习
       const titles = ['科技趋势：AI的未来', '职场英语：如何进行有效汇报', '旅游随笔：伦敦之行', '健康生活：早餐的重要性']
       const randomTitle = titles[new Date().getDate() % titles.length]
       
       audioLessons.value = [{
          id: 'mock-1',
          title: randomTitle,
          url: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent('Today we are going to learn about ' + randomTitle)}&type=2`,
          duration: 156,
          questions: [
            {
              question: '这篇听力主要讨论了什么？',
              options: ['环境保护', '人工智能', '健康饮食', '职场技巧'],
              correctAnswer: 1,
              answered: false
            }
          ]
       }]
    }
  } catch (err) {
    console.error('Failed to fetch daily audio lesson:', err)
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
    title: '初学者',
    description: '完成第一堂课',
    unlocked: true,
    unlockedAt: Date.now() - 86400000,
    reward: { xp: 10 }
  },
  {
    id: 2,
    type: 'daily',
    category: 'daily',
    title: '连续学习 3 天',
    description: '连续学习 3 天',
    unlocked: true,
    unlockedAt: Date.now() - 3600000,
    progress: 100,
    reward: { xp: 30 }
  },
  {
    id: 3,
    type: 'learning',
    category: 'learning',
    title: '词汇达人',
    description: '掌握 100 个单词',
    unlocked: false,
    progress: 65,
    reward: { xp: 50 }
  },
  {
    id: 4,
    type: 'special',
    category: 'special',
    title: '完美听力',
    description: '听力测试获得满分',
    unlocked: false,
    progress: 0,
    reward: { xp: 100 }
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

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #9ca3af;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #d4d4d8;
}

/* 区块 */
section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0;
}

/* 学习模块网格 */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.module-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.module-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0 0 8px 0;
}

.module-description {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.module-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-text {
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
  min-width: 40px;
  text-align: right;
}

/* 听力题目 */
.listening-questions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-number {
  font-size: 14px;
  font-weight: 600;
  color: #d4d4d8;
}

.question-content {
  font-size: 15px;
  color: #f9fafb;
  margin-bottom: 16px;
  line-height: 1.6;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-option {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #d4d4d8;
}

.question-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.question-option.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.question-option.correct {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.question-option.wrong {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .learning-hub {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
