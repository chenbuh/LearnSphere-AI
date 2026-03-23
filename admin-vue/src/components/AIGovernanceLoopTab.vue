<script setup>
import { onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NEmpty,
  NGrid,
  NGridItem,
  NProgress,
  NStatistic,
  NTag,
  useMessage
} from 'naive-ui'
import { Activity, AlertTriangle, ArrowRightLeft, CheckCircle, MessageSquare, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const message = useMessage()
const analyzingId = ref(null)
const loopStats = ref({
  summary: { total: 0, postives: 0, negatives: 0, processed: 0 },
  anomalies: [],
  fewShotCoverage: [],
  list: []
})

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
  <div class="page-header">
    <div>
      <div class="header-eyebrow">反馈闭环</div>
      <h2>模型反馈处理</h2>
      <p>先看反馈规模和异常模块，再确认样本覆盖情况，最后查看近期负反馈与归因结果。</p>
    </div>
    <div class="section-toolbar">
      <n-button secondary @click="fetchLoopData">
        <template #icon><RotateCcw :size="16" /></template>
        重载闭环状态
      </n-button>
    </div>
  </div>
  <n-grid :cols="4" :x-gap="24" class="mb-6">
          <n-grid-item>
            <n-card class="stat-card" :bordered="false">
              <n-statistic label="最近30天反馈总数" :value="loopStats.summary.total">
                <template #prefix><MessageSquare :size="20" class="mr-2 text-indigo-400" /></template>
              </n-statistic>
              <div class="stat-note">观察反馈总量是否与调用规模同步波动。</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card" :bordered="false">
              <n-statistic label="已采纳纠错建议" :value="loopStats.summary.processed">
                <template #prefix><CheckCircle :size="20" class="mr-2 text-emerald-400" /></template>
              </n-statistic>
              <div class="stat-note">已转化为训练样本的负反馈。</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card" :bordered="false">
              <n-statistic label="纠错转化率" :value="((loopStats.summary.processed / (loopStats.summary.negatives || 1)) * 100).toFixed(1)" suffix="%">
                <template #prefix><RotateCcw :size="20" class="mr-2 text-blue-400" /></template>
              </n-statistic>
              <div class="stat-note">衡量负反馈沉淀为可复用样本的效率。</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card" :bordered="false">
              <n-statistic label="异常模块预警" :value="loopStats.anomalies.length">
                <template #prefix><AlertTriangle :size="20" class="mr-2 text-rose-500" /></template>
              </n-statistic>
              <div class="stat-note">优先进入人工排查的高风险模块数量。</div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <n-card title="模型负评率异常诊断" :bordered="false" class="main-card">
                <p class="card-copy">异常区优先展示负评率抬升的动作，帮助快速定位最需要修复的生成环节。</p>
                <div v-if="loopStats.anomalies.length > 0">
                    <div v-for="item in loopStats.anomalies" :key="item.action_type" class="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl mb-3">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-rose-400">{{ item.action_type }}</span>
                            <n-tag type="error" size="small" round>{{ item.fail_rate }}% 负评率</n-tag>
                        </div>
                        <p class="text-xs text-zinc-500 mb-2">该动作当前偏离正常反馈水平，建议优先核查提示词、模型适配和输入质量。</p>
                        <n-progress type="line" :percentage="item.fail_rate" :show-indicator="false" status="error" processing />
                    </div>
                </div>
                <n-empty v-else description="所有生成模块表现正常" style="padding: 40px" />
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="训练样本覆盖" :bordered="false" class="main-card">
              <p class="card-copy">确认高频动作是否已有足够样本支撑优化，并关注最后更新时间是否滞后。</p>
              <div class="flex flex-col gap-3">
                <div v-for="item in loopStats.fewShotCoverage" :key="item.action_type" class="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ item.action_type }}</span>
                    <span class="text-[10px] text-zinc-500">最近更新: {{ formatTime(item.last_update) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <n-tag type="success" size="tiny" ghost>{{ item.example_count }} 个样本</n-tag>
                    <span class="coverage-note">在提示词管理中查看</span>
                  </div>
                </div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-card title="最近用户反馈流" :bordered="false" class="main-card mt-6">
              <p class="card-copy">反馈列表保留时间、动作、用户评价与 AI 归因证据，便于逐条确认问题来源。</p>
              <div class="feedback-list-container">
                  <div v-if="!loopStats.list || loopStats.list.length === 0" class="empty-state">
                     暂无反馈记录
                  </div>
              <div class="feedback-list" v-else>
                    <n-card v-for="item in loopStats.list" :key="item.id" size="small" class="bg-zinc-800/30 border border-zinc-700/50 feedback-item">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="text-xs text-zinc-500 mr-2">{{ formatTime(item.createTime) }}</span>
                                <n-tag :type="item.rating === 1 ? 'success' : 'error'" size="small" round bordered>
                                    {{ item.rating === 1 ? '有用' : '无用' }}
                                </n-tag>
                                <span class="ml-2 text-zinc-300 font-bold">{{ item.actionType }}</span>
                            </div>
                            <n-button
                                v-if="item.rating === -1 && !(item.analysisResult || item.analysis_result)"
                                size="tiny"
                                secondary
                                type="warning"
                                :loading="analyzingId === item.id"
                                @click="handleAnalyzeFeedback(item)"
                            >
                                AI 归因
                            </n-button>
                        </div>
                        <div class="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded mb-2">
                            <span class="text-xs text-zinc-500 block mb-1">用户反馈:</span>
                            {{ item.feedbackText || item.feedback_text || '无具体内容' }}
                        </div>
                        <div v-if="item.analysisResult || item.analysis_result" class="analysis-box">
                            <span class="block mb-1 font-bold">AI 归因分析</span>
                            <div class="whitespace-pre-wrap leading-relaxed">{{ formatAnalysisText(item.analysisResult || item.analysis_result) }}</div>
                        </div>
                    </n-card>
                  </div>
              </div>
        </n-card>
              <div class="auto-learning-panel">
                <div class="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                  <Activity :size="14" />
                  闭环状态
                </div>
                <p class="text-[11px] text-zinc-500">系统会将已确认的修正结果回流到对应模块的提示词和训练样本，用于后续质量修正。</p>
              </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-eyebrow {
  margin-bottom: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #67e8f9;
  text-transform: uppercase;
}

.page-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
}

.page-header p {
  max-width: 760px;
  margin: 10px 0 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: #94a3b8;
}

.stat-card {
  height: 100%;
  transition: all 0.3s;
  background: rgba(12, 18, 28, 0.84) !important;
  border: 1px solid rgba(148, 163, 184, 0.12) !important;
  border-radius: 16px;
}

.stat-card :deep(.n-card__content) {
  display: flex;
  align-items: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(94, 234, 212, 0.18) !important;
}

.stat-note {
  margin-top: 10px;
  font-size: 0.72rem;
  line-height: 1.6;
  color: #7c8799;
}

.main-card {
  background: rgba(12, 18, 28, 0.84) !important;
  border: 1px solid rgba(148, 163, 184, 0.12) !important;
  box-shadow: 0 14px 30px -24px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 18px 36px -24px rgba(0, 0, 0, 0.85);
  border-color: rgba(94, 234, 212, 0.16) !important;
}

.section-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-copy {
  margin: 0 0 16px;
  font-size: 0.8rem;
  line-height: 1.65;
  color: #94a3b8;
}

.coverage-note {
  font-size: 0.72rem;
  color: #7c8799;
}

.analysis-box {
  padding: 12px;
  font-size: 0.75rem;
  color: #bfdbfe;
  background: rgba(30, 41, 59, 0.64);
  border: 1px solid rgba(96, 165, 250, 0.14);
  border-radius: 10px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #71717a;
  border: 2px dashed #3f3f46;
  border-radius: 12px;
}

.auto-learning-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(96, 165, 250, 0.16);
  background: rgba(30, 41, 59, 0.28);
  border-radius: 14px;
}
</style>
