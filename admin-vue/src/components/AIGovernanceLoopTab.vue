<script setup>
import { computed, onMounted, ref } from 'vue'
import {
  NButton,
  NIcon,
  NProgress,
  NTag,
  useMessage
} from 'naive-ui'
import { AlertTriangle, CheckCircle, MessageSquare, RefreshCw, RotateCcw } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const analyzingId = ref(null)
const loopStats = ref({
  summary: { total: 0, postives: 0, negatives: 0, processed: 0 },
  anomalies: [],
  fewShotCoverage: [],
  list: []
})

const conversionRate = computed(() =>
  (((loopStats.value.summary.processed || 0) / (loopStats.value.summary.negatives || 1)) * 100).toFixed(1)
)

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const formatAnalysisText = (text) => {
  if (!text) return ''
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

const fetchLoopData = async () => {
  try {
    const [statsRes, listRes] = await Promise.all([
      adminApi.getAILoopStats(),
      adminApi.getAIFeedbackList({ page: 1, size: 20 })
    ])

    if (statsRes.code === 200) {
      loopStats.value.summary = statsRes.data.summary
      loopStats.value.anomalies = statsRes.data.anomalies
      loopStats.value.fewShotCoverage = statsRes.data.fewShotCoverage
    }

    if (listRes.code === 200) {
      loopStats.value.list = listRes.data.records
    }
  } catch (error) {
    console.error(error)
    message.error('获取闭环统计数据失败')
  }
}

const handleAnalyzeFeedback = async (item) => {
  analyzingId.value = item.id
  try {
    const res = await adminApi.analyzeAIFeedback({ feedbackId: item.id })
    if (res.code === 200) {
      message.success('归因分析成功')
      fetchLoopData()
    }
  } catch (error) {
    message.error('分析失败: ' + (error.message || '网络异常'))
  } finally {
    analyzingId.value = null
  }
}

onMounted(() => {
  fetchLoopData()
})
</script>


<template>
  <Teleport to="#page-actions" defer>
    <n-button secondary @click="fetchLoopData">
      <template #icon>
        <n-icon :component="RefreshCw" />
      </template>
      刷新
    </n-button>
  </Teleport>

  <div class="loop-tab">
    <section class="ls-stats loop-stats" aria-label="反馈闭环摘要">
      <div class="ls-stat">
        <span class="ls-stat__label"><MessageSquare :size="14" />近 30 天反馈</span>
        <strong class="ls-stat__value">{{ loopStats.summary.total || 0 }}</strong>
      </div>
      <div class="ls-stat ls-stat--ok">
        <span class="ls-stat__label"><CheckCircle :size="14" />已采纳纠错</span>
        <strong class="ls-stat__value">{{ loopStats.summary.processed || 0 }}</strong>
      </div>
      <div class="ls-stat">
        <span class="ls-stat__label"><RotateCcw :size="14" />纠错转化率</span>
        <strong class="ls-stat__value">{{ conversionRate }}<small>%</small></strong>
      </div>
      <div class="ls-stat" :class="{ 'ls-stat--danger': loopStats.anomalies.length > 0 }">
        <span class="ls-stat__label"><AlertTriangle :size="14" />异常模块</span>
        <strong class="ls-stat__value">{{ loopStats.anomalies.length }}</strong>
      </div>
    </section>

    <div class="ls-grid-2 loop-row">
      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">负评率异常 <span class="ls-panel__count">{{ loopStats.anomalies.length }} 项</span></h2>
        </header>
        <ul v-if="loopStats.anomalies.length > 0" class="loop-list">
          <li v-for="item in loopStats.anomalies" :key="item.action_type" class="loop-row-item loop-row-item--stack">
            <div class="loop-row-item__line">
              <span class="loop-row-item__name">{{ item.action_type }}</span>
              <span class="loop-row-item__num is-danger">{{ item.fail_rate }}%</span>
            </div>
            <n-progress type="line" :percentage="item.fail_rate" :show-indicator="false" status="error" :height="4" />
          </li>
        </ul>
        <div v-else class="ls-empty">所有生成模块表现正常</div>
      </section>

      <section class="ls-panel">
        <header class="ls-panel__head">
          <h2 class="ls-panel__title">训练样本覆盖 <span class="ls-panel__count">{{ loopStats.fewShotCoverage.length }} 个动作</span></h2>
        </header>
        <ul v-if="loopStats.fewShotCoverage.length" class="loop-list">
          <li v-for="item in loopStats.fewShotCoverage" :key="item.action_type" class="loop-row-item">
            <div class="loop-row-item__main">
              <span class="loop-row-item__name">{{ item.action_type }}</span>
              <span class="loop-row-item__meta">最近更新 {{ formatTime(item.last_update) }}</span>
            </div>
            <n-tag size="small" :bordered="false" type="success">{{ item.example_count }} 个样本</n-tag>
          </li>
        </ul>
        <div v-else class="ls-empty">暂无样本数据</div>
      </section>
    </div>

    <section class="ls-panel">
      <header class="ls-panel__head">
        <h2 class="ls-panel__title">最近用户反馈 <span class="ls-panel__count">{{ (loopStats.list || []).length }} 条</span></h2>
      </header>
      <div v-if="!loopStats.list || loopStats.list.length === 0" class="ls-empty">暂无反馈记录</div>
      <ul v-else class="loop-list">
        <li v-for="item in loopStats.list" :key="item.id" class="feedback-row">
          <div class="feedback-row__head">
            <n-tag :type="item.rating === 1 ? 'success' : 'error'" size="small" :bordered="false">
              {{ item.rating === 1 ? '有用' : '无用' }}
            </n-tag>
            <span class="feedback-row__action">{{ item.actionType }}</span>
            <span class="feedback-row__time">{{ formatTime(item.createTime) }}</span>
            <n-button
              v-if="item.rating === -1 && !(item.analysisResult || item.analysis_result)"
              size="small"
              quaternary
              type="primary"
              class="feedback-row__btn"
              :loading="analyzingId === item.id"
              @click="handleAnalyzeFeedback(item)"
            >
              AI 归因
            </n-button>
          </div>
          <p class="feedback-row__text">{{ item.feedbackText || item.feedback_text || '无具体内容' }}</p>
          <div v-if="item.analysisResult || item.analysis_result" class="analysis-box">
            <span class="analysis-box__label">AI 归因分析</span>
            <div class="analysis-box__text">{{ formatAnalysisText(item.analysisResult || item.analysis_result) }}</div>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.loop-tab {
  display: grid;
  gap: 20px;
  min-width: 0;
}

.loop-stats {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.loop-row {
  align-items: stretch;
}

.loop-row > .ls-panel {
  display: flex;
  flex-direction: column;
}

.loop-list {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
}

.loop-row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--line);
}

.loop-row-item--stack {
  display: grid;
  align-items: stretch;
  gap: 8px;
}

.loop-row-item:last-child,
.feedback-row:last-child {
  border-bottom: none;
}

.loop-row-item__line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.loop-row-item__main {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.loop-row-item__name {
  overflow: hidden;
  color: var(--ink);
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loop-row-item__meta {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.loop-row-item__num {
  flex-shrink: 0;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.loop-row-item__num.is-danger {
  color: var(--danger);
}

.feedback-row {
  display: grid;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}

.feedback-row__head {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.feedback-row__action {
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
}

.feedback-row__time {
  color: var(--ink-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.feedback-row__btn {
  margin-left: auto;
}

.feedback-row__text {
  margin: 0;
  color: var(--ink-2);
  font-size: 13px;
  line-height: 1.6;
}

.analysis-box {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: var(--r-md);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: 12px;
}

.analysis-box__label {
  font-weight: 600;
}

.analysis-box__text {
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 1100px) {
  .loop-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
