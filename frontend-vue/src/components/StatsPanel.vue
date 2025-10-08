<script setup>
import { ref, onMounted, computed } from 'vue'
import { NCard, NProgress, NTag, NButton, NGrid, NGridItem, NStatistic, NSpin } from 'naive-ui'
import { TrendingUp, Award, Brain, Clock, CheckCircle, BookOpen } from 'lucide-vue-next'
import { masteryApi } from '@/api/mastery'

const loading = ref(false)

// 统计数据
const stats = ref({
  total: 0,
  mastered: 0,
  familiar: 0,
  learning: 0,
  not_started: 0
})

// 加载统计数据
onMounted(async () => {
  await loadStats()
})

const loadStats = async () => {
  loading.value = true
  try {
    const res = await masteryApi.getStats()
    stats.value = res.data || {
      total: 0,
      mastered: 0,
      familiar: 0,
      learning: 0,
      not_started: 0
    }
  } catch (error) {
    console.error('[Stats] Load failed:', error)
  } finally {
    loading.value = false
  }
}

// 计算各种比率
const masteryRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.mastered / stats.value.total) * 100)
})

const learningRate = computed(() => {
  if (stats.value.total === 0) return 0
  const learned = stats.value.mastered + stats.value.familiar + stats.value.learning
  return Math.round((learned / stats.value.total) * 100)
})

const familiarRate = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.familiar / stats.value.total) * 100)
})
</script>

<template>
  <div class="stats-panel">
    <n-spin :show="loading">
      <!-- 整体进度 -->
      <n-card title="学习进度总览" class="overview-card">
        <div class="overall-progress">
          <div class="progress-circle">
            <n-progress
              type="circle"
              :percentage="learningRate"
              :stroke-width="12"
              :color="{
                '0%': '#667eea',
                '100%': '#764ba2'
              }"
              :width="180"
            >
              <div class="progress-content">
                <div class="percentage">{{ learningRate }}%</div>
                <div class="label">学习进度</div>
              </div>
            </n-progress>
          </div>
          
          <div class="progress-details">
            <div class="detail-item">
              <span class="label">总词汇量</span>
              <span class="value">{{ stats.total }}</span>
            </div>
            <div class="detail-item">
              <span class="label">已学习</span>
              <span class="value green">{{ stats.mastered + stats.familiar + stats.learning }}</span>
            </div>
            <div class="detail-item">
              <span class="label">未学习</span>
              <span class="value gray">{{ stats.not_started }}</span>
            </div>
          </div>
        </div>
      </n-card>

      <!-- 详细统计 -->
      <n-grid :cols="2" x-gap="16" y-gap="16" class="stats-grid">
        <!-- 完全掌握 -->
        <n-grid-item>
          <n-card class="stat-detail-card mastered">
            <div class="stat-header">
              <div class="stat-icon">
                <Award :size="28" />
              </div>
              <div class="stat-title">完全掌握</div>
            </div>
            
            <div class="stat-number">{{ stats.mastered }}</div>
            
            <n-progress
              type="line"
              :percentage="masteryRate"
              :show-indicator="false"
              color="#22c55e"
              class="mt-4"
            />
            
            <div class="stat-footer">
              <span>占比 {{ masteryRate }}%</span>
              <n-tag size="small" type="success">Level 5</n-tag>
            </div>
          </n-card>
        </n-grid-item>

        <!-- 熟悉 -->
        <n-grid-item>
          <n-card class="stat-detail-card familiar">
            <div class="stat-header">
              <div class="stat-icon">
                <Brain :size="28" />
              </div>
              <div class="stat-title">熟悉中</div>
            </div>
            
            <div class="stat-number">{{ stats.familiar }}</div>
            
            <n-progress
              type="line"
              :percentage="familiarRate"
              :show-indicator="false"
              color="#3b82f6"
              class="mt-4"
            />
            
            <div class="stat-footer">
              <span>占比 {{ familiarRate }}%</span>
              <n-tag size="small" type="info">Level 3-4</n-tag>
            </div>
          </n-card>
        </n-grid-item>

        <!-- 学习中 -->
        <n-grid-item>
          <n-card class="stat-detail-card learning">
            <div class="stat-header">
              <div class="stat-icon">
                <BookOpen :size="28" />
              </div>
              <div class="stat-title">学习中</div>
            </div>
            
            <div class="stat-number">{{ stats.learning }}</div>
            
            <n-progress
              type="line"
              :percentage="stats.total > 0 ? Math.round((stats.learning / stats.total) * 100) : 0"
              :show-indicator="false"
              color="#f59e0b"
              class="mt-4"
            />
            
            <div class="stat-footer">
              <span>需加强</span>
              <n-tag size="small" type="warning">Level 1-2</n-tag>
            </div>
          </n-card>
        </n-grid-item>

        <!-- 未学习 -->
        <n-grid-item>
          <n-card class="stat-detail-card not-started">
            <div class="stat-header">
              <div class="stat-icon">
                <Clock :size="28" />
              </div>
              <div class="stat-title">待学习</div>
            </div>
            
            <div class="stat-number">{{ stats.not_started }}</div>
            
            <n-progress
              type="line"
              :percentage="stats.total > 0 ? Math.round((stats.not_started / stats.total) * 100) : 0"
              :show-indicator="false"
              color="#6b7280"
              class="mt-4"
            />
            
            <div class="stat-footer">
              <span>尚未开始</span>
              <n-tag size="small" type="default">Level 0</n-tag>
            </div>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 学习建议 -->
      <n-card title="学习建议" class="advice-card">
        <div class="advice-list">
          <div class="advice-item" v-if="stats.mastered < 100">
            <CheckCircle :size="20" color="#22c55e" />
            <div class="advice-text">
              <strong>坚持复习</strong>
              <p>已掌握 {{ stats.mastered }} 个单词，继续保持！</p>
            </div>
          </div>
          
          <div class="advice-item" v-if="stats.learning > 0">
            <TrendingUp :size="20" color="#f59e0b" />
            <div class="advice-text">
              <strong>加强巩固</strong>
              <p>有 {{ stats.learning }} 个单词需要重点复习</p>
            </div>
          </div>
          
          <div class="advice-item" v-if="stats.not_started > 500">
            <Brain :size="20" color="#6366f1" />
            <div class="advice-text">
              <strong>开始学习</strong>
              <p>还有 {{ stats.not_started }} 个新单词等待学习</p>
            </div>
          </div>
          
          <div class="advice-item" v-if="learningRate >= 80">
            <Award :size="20" color="#a855f7" />
            <div class="advice-text">
              <strong>学习达人</strong>
              <p>已完成 {{ learningRate }}% 的学习目标，太棒了！</p>
            </div>
          </div>
        </div>
      </n-card>
    </n-spin>
  </div>
</template>

<style scoped>
.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.overview-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.overall-progress {
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 20px;
}

.progress-circle {
  flex-shrink: 0;
}

.progress-content {
  text-align: center;
}

.progress-content .percentage {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.progress-content .label {
  font-size: 0.9rem;
  color: #a1a1aa;
  margin-top: 8px;
}

.progress-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.detail-item .label {
  color: #a1a1aa;
  font-size: 0.95rem;
}

.detail-item .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.detail-item .value.green { color: #22c55e; }
.detail-item .value.gray { color: #6b7280; }

.stats-grid {
  margin: 0;
}

.stat-detail-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-detail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}

.stat-detail-card.mastered { border-left: 4px solid #22c55e; }
.stat-detail-card.familiar { border-left: 4px solid #3b82f6; }
.stat-detail-card.learning { border-left: 4px solid #f59e0b; }
.stat-detail-card.not-started { border-left: 4px solid #6b7280; }

.stat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
}

.mastered .stat-icon { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
.familiar .stat-icon { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
.learning .stat-icon { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.not-started .stat-icon { background: rgba(107, 114, 128, 0.2); color: #6b7280; }

.stat-title {
  font-size: 1.1rem;
  color: #e4e4e7;
  font-weight: 600;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}

.stat-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  color: #a1a1aa;
  font-size: 0.9rem;
}

.advice-card {
  background: rgba(30, 30, 35, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.advice-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border-left: 3px solid rgba(99, 102, 241, 0.5);
}

.advice-text strong {
  color: #e4e4e7;
  font-size: 1rem;
  display: block;
  margin-bottom: 4px;
}

.advice-text p {
  color: #a1a1aa;
  font-size: 0.9rem;
  margin: 0;
}

.mt-4 {
  margin-top: 16px;
}
</style>
