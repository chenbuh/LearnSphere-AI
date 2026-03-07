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
  <div class="section-toolbar">
    <n-button secondary @click="fetchLoopData">
      <template #icon><RotateCcw :size="16" /></template>
      重载闭环状态
    </n-button>
  </div>
  <n-grid :cols="4" :x-gap="24" class="mb-6">
          <n-grid-item>
            <n-card class="stat-card" style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)">
              <n-statistic label="最近30天反馈总数" :value="loopStats.summary.total">
                <template #prefix><MessageSquare :size="20" class="mr-2 text-indigo-400" /></template>
              </n-statistic>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card">
              <n-statistic label="已采纳纠错建议" :value="loopStats.summary.processed">
                <template #prefix><CheckCircle :size="20" class="mr-2 text-emerald-400" /></template>
              </n-statistic>
              <div class="text-[10px] text-zinc-500 mt-1">转化为 Few-shot 样本</div>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card">
              <n-statistic label="纠错转化率" :value="((loopStats.summary.processed / (loopStats.summary.negatives || 1)) * 100).toFixed(1)" suffix="%">
                <template #prefix><RotateCcw :size="20" class="mr-2 text-blue-400" /></template>
              </n-statistic>
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card class="stat-card">
              <n-statistic label="异常模块预警" :value="loopStats.anomalies.length">
                <template #prefix><AlertTriangle :size="20" class="mr-2 text-rose-500" /></template>
              </n-statistic>
              <div class="text-[10px] text-zinc-500 mt-1">需人工接入检查</div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-grid :cols="2" :x-gap="24">
          <n-grid-item>
            <n-card title="模型负评率异常诊断" :bordered="false" class="main-card">
                <div v-if="loopStats.anomalies.length > 0">
                    <div v-for="item in loopStats.anomalies" :key="item.action_type" class="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl mb-3">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-bold text-rose-400">{{ item.action_type }}</span>
                            <n-tag type="error" size="small" round>{{ item.fail_rate }}% 负评率</n-tag>
                        </div>
                        <p class="text-xs text-zinc-500 mb-2">由系统实时监控检测到质量大幅偏离，建议立即更新或增强提示词。</p>
                        <n-progress type="line" :percentage="item.fail_rate" :show-indicator="false" status="error" processing />
                    </div>
                </div>
                <n-empty v-else description="所有生成模块表现正常" style="padding: 40px" />
            </n-card>
          </n-grid-item>
          <n-grid-item>
            <n-card title="Few-shot 持续学习覆盖" :bordered="false" class="main-card">
              <div class="flex flex-col gap-3">
                <div v-for="item in loopStats.fewShotCoverage" :key="item.action_type" class="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">{{ item.action_type }}</span>
                    <span class="text-[10px] text-zinc-500">最近更新: {{ formatTime(item.last_update) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <n-tag type="success" size="tiny" ghost>{{ item.example_count }} 个样本</n-tag>
                    <n-button quaternary size="tiny" circle @click="activeTab = 'prompts'">
                      <template #icon><Zap :size="12" /></template>
                    </n-button>
                  </div>
                </div>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>

        <n-card title="最近用户反馈流" :bordered="false" class="main-card mt-6">
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
                                🤖 智能归因
                            </n-button>
                        </div>
                        <div class="text-sm text-zinc-300 bg-zinc-900/50 p-3 rounded mb-2">
                            <span class="text-xs text-zinc-500 block mb-1">用户反馈:</span>
                            {{ item.feedbackText || item.feedback_text || '无具体内容' }}
                        </div>
                        <div v-if="item.analysisResult || item.analysis_result" class="text-xs text-indigo-300 bg-indigo-900/20 p-3 rounded border border-indigo-500/20">
                            <span class="block mb-1 font-bold">🤖 AI 归因分析:</span>
                            <div class="whitespace-pre-wrap leading-relaxed">{{ formatAnalysisText(item.analysisResult || item.analysis_result) }}</div>
                        </div>
                    </n-card>
                  </div>
              </div>
        </n-card>
              <div class="mt-4 p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-lg">
                <div class="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                  <Activity :size="14" />
                  自进化开启中
                </div>
                <p class="text-[11px] text-zinc-500">系统已自动将修正后的反馈内容注入对应模块的 System Prompt，实现 0 人工干预的生成质量优化。</p>
              </div>
</template>

<style scoped>
.stat-card {
  height: 100%;
  transition: all 0.3s;
  background: rgba(20, 20, 25, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px;
}

.stat-card :deep(.n-card__content) {
  display: flex;
  align-items: center;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.main-card {
  backdrop-filter: blur(12px);
  background: rgba(20, 20, 25, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.main-card:hover {
  box-shadow: 0 8px 32px -1px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.12) !important;
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

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #71717a;
  border: 2px dashed #3f3f46;
  border-radius: 12px;
}
</style>
