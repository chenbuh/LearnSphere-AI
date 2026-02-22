<template>
  <div class="learning-path-recommendation">
    <!-- 头部 -->
    <div class="recommendation-header">
      <div class="header-left">
        <div class="header-icon">
          <n-icon :component="Sparkles" size="24" color="#8b5cf6" />
        </div>
        <div class="header-info">
          <h3 class="header-title">AI 智能推荐</h3>
          <p class="header-subtitle">基于你的学习数据生成的个性化学习路径</p>
        </div>
      </div>
      <div class="header-actions">
        <n-button
          quaternary
          @click="refreshRecommendations"
          :loading="loading"
        >
          <template #icon>
            <n-icon :component="RefreshCw" size="16" />
          </template>
          刷新
        </n-button>
      </div>
    </div>

    <!-- 用户画像摘要 -->
    <div class="user-profile-summary">
      <div class="profile-item">
        <n-icon :component="Target" size="16" color="#3b82f6" />
        <span>当前水平：{{ userLevelText }}</span>
      </div>
      <div class="profile-item">
        <n-icon :component="Trophy" size="16" color="#fbbf24" />
        <span>强项：{{ strongPointsText }}</span>
      </div>
      <div class="profile-item">
        <n-icon :component="AlertTriangle" size="16" color="#f97316" />
        <span>需提升：{{ weakPointsText }}</span>
      </div>
    </div>

    <!-- 加载状态 -->
    <SkeletonWrapper
      v-if="loading || paths.length === 0"
      :loading="loading"
      type="card-grid"
      :rows="3"
    >
      <div></div>
    </SkeletonWrapper>

    <!-- 学习路径列表 -->
    <transition-group name="path-list" tag="div" class="paths-container">
      <div
        v-for="(path, index) in sortedPaths"
        :key="path.pathId"
        :class="['path-card', `priority-${path.priority}`]"
      >
        <!-- 路径头部 -->
        <div class="path-header">
          <div class="path-info">
            <div class="path-badge" :class="`badge-${path.priority}`">
              <n-icon :component="getPriorityIcon(path.priority)" size="14" />
              {{ getPriorityText(path.priority) }}
            </div>
            <h4 class="path-title">{{ path.title }}</h4>
            <p class="path-description">{{ path.description }}</p>
          </div>
          <div class="path-meta">
            <div class="meta-item">
              <n-icon :component="Clock" size="14" />
              <span>{{ path.estimatedDuration }} 分钟</span>
            </div>
            <div class="meta-item">
              <n-icon :component="Gauge" size="14" />
              <span>{{ getDifficultyText(path.difficulty) }}</span>
            </div>
          </div>
        </div>

        <!-- 推荐理由 -->
        <div class="path-reason">
          <div class="reason-icon">
            <n-icon :component="Lightbulb" size="16" color="#fbbf24" />
          </div>
          <div class="reason-text">{{ path.reason }}</div>
        </div>

        <!-- 学习模块 -->
        <div class="path-modules">
          <div class="modules-header">
            <span>学习内容</span>
            <span class="module-count">{{ path.modules.length }} 个模块</span>
          </div>
          <div class="modules-list">
            <div
              v-for="(module, mIndex) in path.modules"
              :key="module.moduleId"
              class="module-item"
            >
              <div class="module-index">{{ mIndex + 1 }}</div>
              <div class="module-info">
                <div class="module-name">{{ module.moduleName }}</div>
                <div class="module-tasks">
                  <n-tag
                    v-for="task in module.tasks.slice(0, 2)"
                    :key="task.taskId"
                    size="small"
                    :type="getTaskTypeColor(task.type)"
                  >
                    {{ task.taskName }}
                  </n-tag>
                  <span v-if="module.tasks.length > 2" class="more-tasks">
                    +{{ module.tasks.length - 2 }}
                  </span>
                </div>
              </div>
              <div class="module-duration">
                <n-icon :component="Clock" size="12" />
                {{ module.duration }} 分钟
              </div>
            </div>
          </div>
        </div>

        <!-- 预期效果 -->
        <div class="path-outcome">
          <div class="outcome-icon">
            <n-icon :component="TrendingUp" size="16" color="#10b981" />
          </div>
          <div class="outcome-text">{{ path.expectedOutcome }}</div>
        </div>

        <!-- 操作按钮 -->
        <div class="path-actions">
          <n-button
            type="primary"
            size="large"
            @click="startPath(path)"
            block
          >
            <template #icon>
              <n-icon :component="Play" size="18" />
            </template>
            开始学习
          </n-button>
          <n-button
            quaternary
            size="large"
            @click="savePath(path)"
          >
            <template #icon>
              <n-icon :component="Bookmark" size="16" />
            </template>
            保存路径
          </n-button>
        </div>
      </div>
    </transition-group>

    <!-- 无路径提示 -->
    <div v-if="!loading && paths.length === 0" class="empty-state">
      <n-icon :component="Sparkles" size="48" color="#6b7280" />
      <p>暂无推荐路径</p>
      <p class="hint">完成更多学习后，AI 将为你生成个性化学习路径</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ref as useRef } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NButton, NTag } from 'naive-ui'
import {
  Sparkles, RefreshCw, Target, Trophy, AlertTriangle, Clock,
  Gauge, Lightbulb, TrendingUp, Play, Bookmark, Star,
  Flame, ArrowRight
} from 'lucide-vue-next'
import SkeletonWrapper from '@/components/SkeletonWrapper.vue'
import { recommendationEngine } from '@/services/recommendationEngine'

const router = useRouter()

// 状态
const loading = ref(false)
const paths = ref([])

// 用户画像（模拟数据）
const userProfile = ref({
  userId: 1,
  level: 'intermediate',
  strongPoints: ['词汇', '语法'],
  weakPoints: ['听力', '口语'],
  learningStyle: 'visual',
  studyTimePreference: 'evening',
  goalType: 'exam',
  motivationLevel: 4
})

// 计算属性
const userLevelText = computed(() => {
  const levelMap = {
    beginner: '初学者',
    intermediate: '中级',
    advanced: '高级'
  }
  return levelMap[userProfile.value.level] || '未知'
})

const strongPointsText = computed(() => {
  return userProfile.value.strongPoints.join('、') || '暂无'
})

const weakPointsText = computed(() => {
  return userProfile.value.weakPoints.join('、') || '暂无'
})

// 按优先级排序
const sortedPaths = computed(() => {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return [...paths.value].sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
  )
})

// 获取优先级图标
function getPriorityIcon(priority) {
  const icons = {
    high: Star,
    medium: Target,
    low: Flame
  }
  return icons[priority] || Target
}

// 获取优先级文本
function getPriorityText(priority) {
  const texts = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return texts[priority] || '普通'
}

// 获取难度文本
function getDifficultyText(difficulty) {
  const texts = {
    beginner: '入门',
    intermediate: '中级',
    advanced: '高级'
  }
  return texts[difficulty] || '未知'
}

// 获取任务类型颜色
function getTaskTypeColor(type) {
  const colors = {
    study: 'info',
    practice: 'success',
    review: 'warning',
    test: 'error'
  }
  return colors[type] || 'default'
}

// 刷新推荐
async function refreshRecommendations() {
  loading.value = true
  try {
    const newPaths = await recommendationEngine.generateLearningPath(userProfile.value)
    paths.value = newPaths
  } catch (error) {
    console.error('Failed to refresh recommendations:', error)
  } finally {
    loading.value = false
  }
}

// 开始路径
function startPath(path) {
  // 跳转到第一个模块
  if (path.modules.length > 0) {
    const firstModule = path.modules[0]
    router.push(`/app/${firstModule.moduleId}`)
  }
}

// 保存路径
function savePath(path) {
  // 保存到本地存储或发送到后端
  const savedPaths = JSON.parse(localStorage.getItem('savedPaths') || '[]')
  savedPaths.push({
    ...path,
    savedAt: Date.now()
  })
  localStorage.setItem('savedPaths', JSON.stringify(savedPaths))

  // 显示成功提示
  useNaiveUIMessage().success('学习路径已保存')
}

// 使用 naive-ui 的 message
function useNaiveUIMessage() {
  const { useMessage } = require('naive-ui')
  return useMessage()
}

// 组件挂载时加载推荐
onMounted(() => {
  refreshRecommendations()
})
</script>

<style scoped>
.learning-path-recommendation {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 头部 */
.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0 0 4px 0;
}

.header-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* 用户画像摘要 */
.user-profile-summary {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #d4d4d8;
}

/* 路径卡片 */
.paths-container {
  display: grid;
  gap: 20px;
}

.path-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.path-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.path-card.priority-high {
  border-color: rgba(251, 191, 36, 0.3);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(255, 255, 255, 0.03) 100%);
}

.path-card.priority-medium {
  border-color: rgba(59, 130, 246, 0.3);
}

.path-card.priority-low {
  border-color: rgba(16, 185, 129, 0.3);
}

/* 路径头部 */
.path-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.path-info {
  flex: 1;
}

.path-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 8px;
}

.badge-high {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.badge-medium {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

.badge-low {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.4);
}

.path-title {
  font-size: 18px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0 0 6px 0;
}

.path-description {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}

.path-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

/* 推荐理由 */
.path-reason {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(251, 191, 36, 0.05);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
}

.reason-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.reason-text {
  font-size: 13px;
  color: #d4d4d8;
  line-height: 1.5;
}

/* 学习模块 */
.path-modules {
  margin-bottom: 16px;
}

.modules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 12px;
}

.module-count {
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 11px;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.module-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #8b5cf6;
  flex-shrink: 0;
}

.module-info {
  flex: 1;
}

.module-name {
  font-size: 14px;
  font-weight: 500;
  color: #d4d4d8;
  margin-bottom: 4px;
}

.module-tasks {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.more-tasks {
  font-size: 11px;
  color: #71717a;
}

.module-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}

/* 预期效果 */
.path-outcome {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(16, 185, 129, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  margin-bottom: 16px;
}

.outcome-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.outcome-text {
  font-size: 13px;
  color: #d4d4d8;
  line-height: 1.5;
}

/* 操作按钮 */
.path-actions {
  display: flex;
  gap: 12px;
}

.path-actions .n-button {
  flex: 1;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state p {
  margin: 12px 0 0;
  font-size: 14px;
}

.empty-state .hint {
  font-size: 12px;
  color: #6b7280;
}

/* 动画 */
.path-list-enter-active,
.path-list-leave-active {
  transition: all 0.4s ease;
}

.path-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.path-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .learning-path-recommendation {
    padding: 16px;
  }

  .recommendation-header {
    flex-direction: column;
    gap: 12px;
  }

  .header-left {
    width: 100%;
  }

  .path-header {
    flex-direction: column;
    gap: 12px;
  }

  .path-meta {
    width: 100%;
  }

  .path-actions {
    flex-direction: column;
  }
}
</style>
