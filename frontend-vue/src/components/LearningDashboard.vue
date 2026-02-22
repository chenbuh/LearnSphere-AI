<template>
  <div class="learning-dashboard">
    <!-- 头部统计卡片 -->
    <div class="dashboard-header">
      <div class="header-title">
        <h1>学习数据大屏</h1>
        <p>可视化你的学习进度和成就</p>
      </div>
      <div class="date-selector">
        <n-button-group>
          <n-button
            v-for="period in periods"
            :key="period.value"
            :type="selectedPeriod === period.value ? 'primary' : 'default'"
            @click="selectedPeriod = period.value"
          >
            {{ period.label }}
          </n-button>
        </n-button-group>
      </div>
    </div>

    <!-- 核心指标卡片 -->
    <div class="metrics-grid">
      <div
        v-for="metric in coreMetrics"
        :key="metric.id"
        class="metric-card"
        :style="{ borderLeftColor: metric.color }"
      >
        <div class="metric-icon" :style="{ background: metric.color }">
          <n-icon :component="metric.icon" size="24" color="#ffffff" />
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-label">{{ metric.label }}</div>
          <div class="metric-change" :class="{ positive: metric.change > 0, negative: metric.change < 0 }">
            <n-icon :component="metric.change > 0 ? TrendingUp : TrendingDown" size="14" />
            <span>{{ Math.abs(metric.change) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习热力图 -->
    <div class="heatmap-section">
      <div class="section-header">
        <h3>
          <n-icon :component="Flame" size="18" color="#f97316" />
          学习热力图
        </h3>
        <n-select
          v-model:value="heatmapYear"
          :options="yearOptions"
          size="small"
          style="width: 120px"
        />
      </div>
      <div class="heatmap-container">
        <LearningHeatmap :data="heatmapData" :year="heatmapYear" />
      </div>
    </div>

    <!-- 技能雷达图和时长趋势 -->
    <div class="charts-row">
      <!-- 技能雷达图 -->
      <div class="chart-card radar-chart">
        <div class="section-header">
          <h3>
            <n-icon :component="Target" size="18" color="#8b5cf6" />
            技能雷达
          </h3>
        </div>
        <SkillsRadar :skills="skillsData" />
      </div>

      <!-- 学习时长趋势 -->
      <div class="chart-card trend-chart">
        <div class="section-header">
          <h3>
            <n-icon :component="LineChart" size="18" color="#10b981" />
            学习趋势
          </h3>
        </div>
        <StudyTimeChart :data="timeSeriesData" :period="selectedPeriod" />
      </div>
    </div>

    <!-- AI 学习建议 -->
    <div class="ai-suggestions">
      <div class="section-header">
        <h3>
          <n-icon :component="Sparkles" size="18" color="#fbbf24" />
          AI 学习建议
        </h3>
        <n-button text @click="refreshSuggestions">
          <template #icon>
            <n-icon :component="RefreshCw" size="14" />
          </template>
          刷新建议
        </n-button>
      </div>
      <div class="suggestions-list">
        <div
          v-for="(suggestion, index) in aiSuggestions"
          :key="index"
          class="suggestion-item"
          :class="`priority-${suggestion.priority}`"
        >
          <div class="suggestion-icon">
            <n-icon :component="getSuggestionIcon(suggestion.type)" size="20" />
          </div>
          <div class="suggestion-content">
            <div class="suggestion-title">{{ suggestion.title }}</div>
            <div class="suggestion-description">{{ suggestion.description }}</div>
            <div class="suggestion-action">
              <n-button
                size="small"
                :type="suggestion.priority === 'high' ? 'primary' : 'default'"
                @click="applySuggestion(suggestion)"
              >
                {{ suggestion.actionText }}
              </n-button>
            </div>
          </div>
          <div class="suggestion-priority">
            <n-tag
              :type="suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'default'"
              size="small"
            >
              {{ suggestion.priority === 'high' ? '重要' : suggestion.priority === 'medium' ? '中等' : '建议' }}
            </n-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 学习成就排行 -->
    <div class="achievements-showcase">
      <div class="section-header">
        <h3>
          <n-icon :component="Trophy" size="18" color="#fbbf24" />
          近期成就
        </h3>
        <n-button text @click="viewAllAchievements">
          查看全部
          <template #icon>
            <n-icon :component="ArrowRight" size="14" />
          </template>
        </n-button>
      </div>
      <div class="achievements-list">
        <div
          v-for="achievement in recentAchievements"
          :key="achievement.id"
          class="achievement-item"
        >
          <div class="achievement-icon" :class="{ unlocked: achievement.unlocked }">
            <component :is="achievement.icon" size="24" />
          </div>
          <div class="achievement-info">
            <div class="achievement-name">{{ achievement.name }}</div>
            <div class="achievement-time">{{ formatTime(achievement.time) }}</div>
          </div>
          <div v-if="achievement.unlocked" class="achievement-badge">
            <n-icon :component="CheckCircle" size="16" color="#10b981" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NIcon, NButton, NButtonGroup, NSelect, NTag, useMessage
} from 'naive-ui'
import {
  Flame, Target, LineChart, Sparkles, RefreshCw, ArrowRight,
  TrendingUp, TrendingDown, CheckCircle, Trophy, Clock,
  BookOpen, Headphones, MessageSquare, PenTool, Mic,
  Lightbulb, AlertCircle
} from 'lucide-vue-next'
import LearningHeatmap from './LearningHeatmap.vue'
import SkillsRadar from './SkillsRadar.vue'
import StudyTimeChart from './StudyTimeChart.vue'

const router = useRouter()
const message = useMessage()

// 状态
const selectedPeriod = ref('week')
const heatmapYear = ref(new Date().getFullYear())

// 时间周期选项
const periods = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本年', value: 'year' }
]

// 年份选项
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  return [
    { label: String(currentYear), value: currentYear },
    { label: String(currentYear - 1), value: currentYear - 1 }
  ]
})

// 核心指标
const coreMetrics = ref([
  {
    id: 'studyTime',
    label: '学习时长',
    value: '125h',
    change: 23,
    color: '#3b82f6',
    icon: Clock
  },
  {
    id: 'accuracy',
    label: '平均正确率',
    value: '78%',
    change: 12,
    color: '#10b981',
    icon: Target
  },
  {
    id: 'words',
    label: '掌握词汇',
    value: '1,245',
    change: 45,
    color: '#8b5cf6',
    icon: BookOpen
  },
  {
    id: 'streak',
    label: '连续学习',
    value: '15天',
    change: 0,
    color: '#f97316',
    icon: Flame
  }
])

// 学习热力图数据（模拟）
const heatmapData = ref({
  // 周一到周日，52周的数据
  weeks: 52,
  data: Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
  )
})

// 技能数据
const skillsData = ref([
  { skill: '词汇', value: 85, max: 100 },
  { skill: '语法', value: 72, max: 100 },
  { skill: '听力', value: 65, max: 100 },
  { skill: '阅读', value: 78, max: 100 },
  { skill: '写作', value: 58, max: 100 },
  { skill: '口语', value: 45, max: 100 }
])

// 时序数据
const timeSeriesData = ref({
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [
    {
      label: '学习时长（分钟）',
      data: [45, 60, 30, 75, 50, 90, 60],
      color: '#10b981'
    },
    {
      label: '正确率',
      data: [0.75, 0.82, 0.68, 0.85, 0.78, 0.88, 0.80],
      color: '#3b82f6'
    }
  ]
})

// AI 学习建议
const aiSuggestions = ref([
  {
    type: 'practice',
    title: '加强听力练习',
    description: '你的听力正确率只有 65%，建议每天进行 20 分钟听力训练',
    priority: 'high',
    actionText: '开始练习',
    moduleId: 'listening'
  },
  {
    type: 'review',
    title: '复习已学词汇',
    description: '有 50 个单词超过 7 天未复习，建议安排复习时间',
    priority: 'medium',
    actionText: '开始复习',
    moduleId: 'vocabulary'
  },
  {
    type: 'challenge',
    title: '尝试高级阅读',
    description: '你的阅读能力很好，可以挑战更高难度的文章',
    priority: 'low',
    actionText: '挑战',
    moduleId: 'reading'
  }
])

// 近期成就
const recentAchievements = ref([
  {
    id: 1,
    name: '词汇大师',
    time: Date.now() - 86400000,
    unlocked: true,
    icon: Trophy
  },
  {
    id: 2,
    name: '听力新星',
    time: Date.now() - 172800000,
    unlocked: true,
    icon: Headphones
  },
  {
    id: 3,
    name: '口语达人',
    time: Date.now() - 259200000,
    unlocked: false,
    icon: Mic
  }
])

// 获取建议图标
function getSuggestionIcon(type) {
  const icons = {
    practice: PenTool,
    review: BookOpen,
    challenge: Trophy,
    tip: Lightbulb,
    warning: AlertCircle
  }
  return icons[type] || Lightbulb
}

// 应用建议
function applySuggestion(suggestion) {
  if (suggestion.moduleId) {
    router.push(`/app/${suggestion.moduleId}`)
  }
  message.success(`开始${suggestion.title}`)
}

// 刷新建议
function refreshSuggestions() {
  // 重新生成 AI 建议
  message.success('建议已刷新')
}

// 查看所有成就
function viewAllAchievements() {
  router.push('/app/achievements')
}

// 格式化时间
function formatTime(timestamp) {
  const diff = Date.now() - timestamp
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} 天前`
  } else if (hours > 0) {
    return `${hours} 小时前`
  } else {
    return '刚刚'
  }
}

// 模拟数据加载
onMounted(() => {
  // 这里可以调用 API 加载真实数据
})
</script>

<style scoped>
.learning-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

/* 头部 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-title h1 {
  font-size: 32px;
  font-weight: 700;
  color: #f9fafb;
  margin: 0 0 8px 0;
}

.header-title p {
  font-size: 16px;
  color: #9ca3af;
  margin: 0;
}

/* 核心指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: #f9fafb;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.metric-change.positive {
  color: #10b981;
}

.metric-change.negative {
  color: #ef4444;
}

/* 区块 */
section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0;
}

/* 热力图 */
.heatmap-section {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
}

.heatmap-container {
  margin-top: 16px;
}

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
}

/* AI 建议 */
.ai-suggestions {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
}

.suggestion-item.priority-high {
  border-left: 3px solid #ef4444;
}

.suggestion-item.priority-medium {
  border-left: 3px solid #fbbf24;
}

.suggestion-item.priority-low {
  border-left: 3px solid #10b981;
}

.suggestion-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8b5cf6;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;
}

.suggestion-title {
  font-size: 15px;
  font-weight: 600;
  color: #f9fafb;
  margin-bottom: 4px;
}

.suggestion-description {
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
  line-height: 1.5;
}

.suggestion-action {
  margin-top: 8px;
}

.suggestion-priority {
  flex-shrink: 0;
}

/* 成就展示 */
.achievements-showcase {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.achievement-item:hover {
  background: rgba(0, 0, 0, 0.3);
}

.achievement-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.achievement-icon.unlocked {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #ffffff;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 14px;
  font-weight: 600;
  color: #d4d4d8;
  margin-bottom: 4px;
}

.achievement-time {
  font-size: 12px;
  color: #71717a;
}

.achievement-badge {
  color: #10b981;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .learning-dashboard {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 16px;
  }

  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .header-title h1 {
    font-size: 24px;
  }
}
</style>
