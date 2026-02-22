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

const router = useRouter()
const message = useMessage()

// 加载状态
const loadingChallenge = ref(true)
const loadingModules = ref(true)
const loadingFlashcards = ref(true)
const loadingAudio = ref(true)
const loadingAchievements = ref(true)

// 用户统计
const streak = ref(5)
const todayTime = ref(45)

// 每日挑战
const dailyChallenge = ref({
  id: 1,
  title: '完成 30 分钟学习',
  description: '今天累计学习 30 分钟，完成任意学习模块即可',
  type: 'daily',
  difficulty: 'easy',
  progress: 15,
  target: 30,
  started: true,
  completed: false,
  tasks: [
    { title: '学习 10 个单词', completed: true, reward: { xp: 10 } },
    { title: '完成 1 篇听力', completed: true, reward: { xp: 15 } },
    { title: '做 5 道语法题', completed: false, reward: { xp: 20 } }
  ],
  rewards: [
    { type: 'xp', name: '经验值', value: '+50 XP' },
    { type: 'badge', name: '徽章', value: '学习达人' }
  ]
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

// 闪卡单词
const flashcardWords = ref([
  {
    word: 'ephemeral',
    phonetic: '/ɪˈfemərəl/',
    definition: 'adj. 短暂的；瞬息的',
    example: 'Fashion is ephemeral, changing with every season.',
    synonyms: 'transient, fleeting',
    antonyms: 'permanent, lasting',
    partOfSpeech: 'adjective'
  },
  {
    word: 'ubiquitous',
    phonetic: '/juːˈbɪkwɪtəs/',
    definition: 'adj. 无处不在的；普遍的',
    example: 'Smartphones have become ubiquitous in modern society.',
    synonyms: 'omnipresent, pervasive',
    antonyms: 'rare, scarce',
    partOfSpeech: 'adjective'
  },
  {
    word: 'serendipity',
    phonetic: '/ˌserənˈdɪpəti/',
    definition: 'n. 意外发现珍奇事物的运气；机缘凑巧',
    example: 'Finding this job was pure serendipity.',
    synonyms: 'luck, fortune',
    antonyms: 'misfortune',
    partOfSpeech: 'noun'
  }
])

const currentWordIndex = ref(0)
const currentWord = computed(() => flashcardWords.value[currentWordIndex.value])

// 听力课程
const audioLessons = ref([
  {
    id: 1,
    title: '日常对话 - 在餐厅',
    url: '/audio/listening-1.mp3',
    duration: 180,
    questions: [
      {
        question: '对话发生在什么地方？',
        options: ['在图书馆', '在餐厅', '在公园', '在学校'],
        correctAnswer: 1,
        answered: false
      },
      {
        question: '男士想要点什么？',
        options: ['咖啡', '茶', '水', '果汁'],
        correctAnswer: 0,
        answered: false
      }
    ]
  }
])

const currentAudioLesson = computed(() => audioLessons.value[0])

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
  const question = currentAudioLesson.value.questions[questionIndex]
  if (question.answered) return

  question.userAnswer = optionIndex
  question.answered = true
  question.correct = question.userAnswer === question.correctAnswer
}

// 模拟数据加载
onMounted(() => {
  // 模拟 API 调用
  setTimeout(() => {
    loadingChallenge.value = false
    loadingModules.value = false
    loadingFlashcards.value = false
    loadingAudio.value = false
    loadingAchievements.value = false
  }, 1500)
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
