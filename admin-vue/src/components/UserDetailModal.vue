<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NEmpty,
  NGrid,
  NGridItem,
  NList,
  NListItem,
  NModal,
  NProgress,
  NSpace,
  NSpin,
  NTabPane,
  NTabs,
  NTag,
  NThing,
  NTimeline,
  NTimelineItem,
  useMessage
} from 'naive-ui'
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Crown,
  MessageSquare,
  TrendingUp
} from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import echarts from '@/utils/echarts'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:show'])

const message = useMessage()
const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const activeTab = ref('overview')
const detailLoading = ref(false)
const aiLogLoading = ref(false)
const userDetail = ref({})
const userAILogs = ref([])
const radarChartRef = ref(null)
const usageChartRef = ref(null)

let radarChart = null
let usageChart = null
let chartInitTimer = null
let tabSwitchTimer = null

const avatarSrc = computed(() => {
  const username = userDetail.value.user?.username || props.user?.username || 'user'
  return userDetail.value.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
})

const normalizeUserDetail = (detail = {}) => ({
  ...detail,
  riskLevel: detail.riskLevel || 'LOW',
  skillScores: detail.skillScores || {},
  usageTrend: detail.usageTrend || [],
  statistics: detail.statistics || {},
  learningTrack: detail.learningTrack || { recentActivities: [] },
  valueSegmentation: detail.valueSegmentation || {}
})

const disposeCharts = () => {
  if (radarChart) {
    radarChart.dispose()
    radarChart = null
  }

  if (usageChart) {
    usageChart.dispose()
    usageChart = null
  }
}

const clearTimers = () => {
  if (chartInitTimer) {
    clearTimeout(chartInitTimer)
    chartInitTimer = null
  }

  if (tabSwitchTimer) {
    clearTimeout(tabSwitchTimer)
    tabSwitchTimer = null
  }
}

const initProfilingCharts = () => {
  if (!props.show || activeTab.value !== 'overview') {
    return
  }

  if (radarChartRef.value) {
    if (radarChart) {
      radarChart.dispose()
    }

    radarChart = echarts.init(radarChartRef.value)
    const scores = userDetail.value.skillScores || {}
    radarChart.setOption({
      backgroundColor: 'transparent',
      radar: {
        indicator: [
          { name: '词汇', max: 100 },
          { name: '语法', max: 100 },
          { name: '阅读', max: 100 },
          { name: '听力', max: 100 },
          { name: '口语', max: 100 },
          { name: '写作', max: 100 }
        ],
        splitArea: { show: false },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: [
            scores.vocabulary || 0,
            scores.grammar || 0,
            scores.reading || 0,
            scores.listening || 0,
            scores.speaking || 0,
            scores.writing || 0
          ],
          name: '能力评价',
          areaStyle: { color: 'rgba(99, 102, 241, 0.4)' },
          lineStyle: { width: 2 },
          itemStyle: { color: '#6366f1' }
        }]
      }]
    })
  }

  if (usageChartRef.value) {
    if (usageChart) {
      usageChart.dispose()
    }

    usageChart = echarts.init(usageChartRef.value)
    const trend = userDetail.value.usageTrend || []
    usageChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, bottom: 20, top: 20 },
      xAxis: {
        type: 'category',
        data: trend.map(item => (item.date || '').slice(5)),
        axisLabel: { color: '#666', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLabel: { color: '#666', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [{
        data: trend.map(item => item.value),
        type: 'line',
        smooth: true,
        itemStyle: { color: '#f59e0b' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
            { offset: 1, color: 'transparent' }
          ])
        }
      }]
    })
  }
}

const scheduleChartInit = (delay = 300) => {
  if (chartInitTimer) {
    clearTimeout(chartInitTimer)
  }

  chartInitTimer = setTimeout(() => {
    initProfilingCharts()
    chartInitTimer = null
  }, delay)
}

const fetchUserAILogs = async (userId) => {
  aiLogLoading.value = true
  try {
    const res = await adminApi.getAILogs({
      userId,
      page: 1,
      size: 50
    })
    userAILogs.value = res.data?.records || []
  } catch (error) {
    console.error('Fetch AI logs failed', error)
    userAILogs.value = []
  } finally {
    aiLogLoading.value = false
  }
}

const loadUserDetail = async () => {
  const userId = props.user?.id
  if (!userId || detailLoading.value) {
    return
  }

  activeTab.value = 'overview'
  detailLoading.value = true

  try {
    try {
      const res = await adminApi.getUserProfile(userId)
      userDetail.value = normalizeUserDetail(res.data)
    } catch (profileError) {
      console.warn('Advanced profile failed, falling back to basic details', profileError)
      const res = await adminApi.getUserDetails(userId)
      const data = res.data || {}
      userDetail.value = normalizeUserDetail({
        user: data.user,
        vip: data.vip,
        vipExpireTime: data.vipExpireTime,
        userTag: data.userTag || '普通用户',
        riskLevel: data.riskLevel || 'LOW',
        skillScores: data.skillScores || {},
        usageTrend: data.usageTrend || [],
        statistics: {
          totalWordsLearned: data.totalWordsLearned || 0,
          totalAiUsage: data.totalAiUsage || 0,
          totalCheckins: 0,
          studyStreak: 0
        },
        learningTrack: { recentActivities: [] },
        valueSegmentation: {
          segment: data.userTag || '普通用户',
          ltv: 0,
          engagementScore: 50,
          churnRisk: data.riskLevel === 'HIGH' ? 80 : 20,
          reasons: ['基础数据视图']
        }
      })
      message.warning('User 360 服务暂不可用，已切换至基础视图')
    }

    await fetchUserAILogs(userId)

    nextTick(() => {
      scheduleChartInit()
    })
  } catch (error) {
    console.error(error)
    message.error('获取用户详情失败')
  } finally {
    detailLoading.value = false
  }
}

watch(
  () => [props.show, props.user?.id],
  ([show, userId], previous = []) => {
    const [previousShow, previousUserId] = previous

    if (show && userId && (!previousShow || userId !== previousUserId)) {
      loadUserDetail()
    }

    if (!show) {
      clearTimers()
      disposeCharts()
      activeTab.value = 'overview'
      userDetail.value = {}
      userAILogs.value = []
    }
  },
  { immediate: true }
)

watch(activeTab, (newTab) => {
  if (newTab !== 'overview' || !props.show) {
    return
  }

  if (tabSwitchTimer) {
    clearTimeout(tabSwitchTimer)
  }

  tabSwitchTimer = setTimeout(() => {
    initProfilingCharts()
    tabSwitchTimer = null
  }, 150)
})

onBeforeUnmount(() => {
  clearTimers()
  disposeCharts()
})
</script>

<template>
  <n-modal
    v-model:show="modalVisible"
    preset="card"
    title="User 360 - 精细化用户画像"
    style="width: 900px; height: 85vh"
    :content-style="{ padding: 0, overflowY: 'auto' }"
  >
    <n-spin :show="detailLoading">
      <div class="user-profile-header p-6 bg-black/10">
        <div class="flex items-center gap-6">
          <n-avatar round :size="80" :src="avatarSrc" />
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-2xl font-bold text-white mb-0">
                {{ userDetail.user?.nickname || userDetail.user?.username || props.user?.nickname || props.user?.username }}
              </h2>
              <n-tag :bordered="false" type="info" round size="small">
                <template #icon>
                  <Crown v-if="userDetail.vip" :size="12" />
                </template>
                {{ userDetail.vip ? 'VIP会员' : '普通用户' }}
              </n-tag>
              <n-tag
                v-if="userDetail.valueSegmentation?.segment"
                :bordered="false"
                :type="userDetail.riskLevel === 'HIGH' ? 'error' : 'warning'"
                round
                size="small"
              >
                {{ userDetail.valueSegmentation.segment }}
              </n-tag>
            </div>
            <div class="flex items-center gap-4 text-zinc-400 text-sm">
              <span>ID: {{ userDetail.user?.id || props.user?.id }}</span>
              <span>|</span>
              <span>注册于: {{ userDetail.user?.createTime ? new Date(userDetail.user.createTime).toLocaleDateString() : '-' }}</span>
              <span>|</span>
              <span class="flex items-center gap-1">
                <Activity :size="14" />
                LTV预估: {{ userDetail.valueSegmentation?.ltv || 0 }}
              </span>
            </div>
          </div>
          <div v-if="userDetail.riskLevel === 'HIGH'" class="flex flex-col items-end text-red-400">
            <AlertTriangle :size="24" />
            <span class="text-xs font-bold mt-1">高风险用户</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <n-tabs v-model:value="activeTab" type="line" animated class="w-full" pane-class="p-6">
          <n-tab-pane name="overview" tab="全景概览" display-directive="show">
            <n-grid :cols="4" :x-gap="16" class="mb-8" item-responsive responsive="screen">
              <n-grid-item span="4 m:1">
                <div class="stat-box">
                  <div class="flex justify-between items-start mb-2">
                    <div class="label">累计学习词汇</div>
                    <BookOpen :size="16" class="text-indigo-400" />
                  </div>
                  <div class="value">{{ userDetail.statistics?.totalWordsLearned || 0 }}</div>
                </div>
              </n-grid-item>
              <n-grid-item span="4 m:1">
                <div class="stat-box">
                  <div class="flex justify-between items-start mb-2">
                    <div class="label">AI 对话次数</div>
                    <MessageSquare :size="16" class="text-emerald-400" />
                  </div>
                  <div class="value">{{ userDetail.statistics?.totalAiUsage || 0 }}</div>
                </div>
              </n-grid-item>
              <n-grid-item span="4 m:1">
                <div class="stat-box">
                  <div class="flex justify-between items-start mb-2">
                    <div class="label">连续签到</div>
                    <Activity :size="16" class="text-amber-400" />
                  </div>
                  <div class="value">
                    {{ userDetail.statistics?.totalCheckins || 0 }}
                    <span class="unit">天</span>
                  </div>
                </div>
              </n-grid-item>
              <n-grid-item span="4 m:1">
                <div class="stat-box">
                  <div class="flex justify-between items-start mb-2">
                    <div class="label">互动活跃分</div>
                    <TrendingUp :size="16" class="text-rose-400" />
                  </div>
                  <div class="value text-rose-500">{{ userDetail.valueSegmentation?.engagementScore || 0 }}</div>
                </div>
              </n-grid-item>
            </n-grid>

            <n-grid :cols="2" :x-gap="24" class="mb-6">
              <n-grid-item>
                <div class="chart-container">
                  <h4 class="chart-title">能力六维模型</h4>
                  <div ref="radarChartRef" style="height: 300px"></div>
                </div>
              </n-grid-item>
              <n-grid-item>
                <div class="chart-container">
                  <h4 class="chart-title">近7日 AI 算力消耗</h4>
                  <div ref="usageChartRef" style="height: 300px"></div>
                </div>
              </n-grid-item>
            </n-grid>

            <n-divider dashed>账户明细</n-divider>
            <n-descriptions bordered size="small" :column="2">
              <n-descriptions-item label="真实姓名">{{ userDetail.user?.username }}</n-descriptions-item>
              <n-descriptions-item label="绑定邮箱">{{ userDetail.user?.email || '未绑定' }}</n-descriptions-item>
              <n-descriptions-item label="VIP到期">{{ userDetail.vipExpireTime ? new Date(userDetail.vipExpireTime).toLocaleString() : '未开通' }}</n-descriptions-item>
              <n-descriptions-item label="最后登录">{{ userDetail.user?.lastLoginTime ? new Date(userDetail.user.lastLoginTime).toLocaleString() : '从未登录' }}</n-descriptions-item>
            </n-descriptions>
          </n-tab-pane>

          <n-tab-pane name="journey" tab="学习足迹">
            <template v-if="userDetail.learningTrack?.recentActivities?.length > 0">
              <n-timeline>
                <n-timeline-item
                  v-for="(activity, index) in userDetail.learningTrack.recentActivities"
                  :key="index"
                  :type="index === 0 ? 'success' : 'default'"
                  :title="activity.title"
                  :content="`得分: ${activity.score}`"
                  :time="new Date(activity.time).toLocaleString()"
                >
                  <template #icon>
                    <BookOpen v-if="activity.type === 'vocabulary'" :size="14" />
                  </template>
                </n-timeline-item>
              </n-timeline>
            </template>
            <n-empty v-else description="暂无近期学习记录" />
          </n-tab-pane>

          <n-tab-pane name="ai-logs" tab="AI 对话日志">
            <n-spin :show="aiLogLoading">
              <n-list hoverable clickable>
                <template v-if="userAILogs.length > 0">
                  <n-list-item v-for="log in userAILogs" :key="log.id">
                    <n-thing :title="log.actionType" content-style="margin-top: 10px;">
                      <template #description>
                        <n-space size="small" style="margin-top: 4px;">
                          <n-tag size="tiny" :bordered="false">{{ log.modelName }}</n-tag>
                          <n-tag size="tiny" :type="log.status === 'SUCCESS' ? 'success' : 'error'" :bordered="false">
                            {{ log.status }}
                          </n-tag>
                          <span class="text-xs text-gray-500">{{ new Date(log.createTime).toLocaleString() }}</span>
                          <span class="text-xs text-gray-500">耗时: {{ log.durationMs }}ms</span>
                        </n-space>
                      </template>
                      <div class="bg-black/20 p-3 rounded text-sm text-gray-300 font-mono">
                        user: {{ log.promptPreview }}
                      </div>
                    </n-thing>
                  </n-list-item>
                </template>
                <template v-else>
                  <n-empty description="暂无 AI 调用记录" />
                </template>
              </n-list>
            </n-spin>
          </n-tab-pane>

          <n-tab-pane name="value" tab="价值与流失分析">
            <n-alert v-if="userDetail.valueSegmentation?.churnRisk > 70" type="error" title="高流失风险" class="mb-4">
              该用户流失风险较高，建议立即采取干预措施（如推送优惠券或关怀短信）。
            </n-alert>

            <n-grid :cols="2" :x-gap="20" :y-gap="20">
              <n-grid-item>
                <n-card title="互动评分" size="small" embedded>
                  <div class="flex items-center justify-center p-4">
                    <n-progress
                      type="dashboard"
                      :percentage="userDetail.valueSegmentation?.engagementScore || 0"
                      :color="userDetail.valueSegmentation?.engagementScore > 60 ? '#10b981' : '#f59e0b'"
                    />
                  </div>
                  <p class="text-center text-xs text-gray-500">基于学习频率、时长、AI交互综合计算</p>
                </n-card>
              </n-grid-item>
              <n-grid-item>
                <n-card title="分层归因" size="small" embedded>
                  <n-list>
                    <n-list-item v-for="(reason, index) in userDetail.valueSegmentation?.reasons" :key="index">
                      <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {{ reason }}
                      </div>
                    </n-list-item>
                    <n-list-item v-if="!userDetail.valueSegmentation?.reasons?.length">
                      暂无特别标签
                    </n-list-item>
                  </n-list>
                </n-card>
              </n-grid-item>
            </n-grid>

            <n-divider />

            <n-space justify="end">
              <n-button secondary type="info">发送站内信</n-button>
              <n-button secondary type="warning">赠送 VIP 体验卡</n-button>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </div>
    </n-spin>
  </n-modal>
</template>

<style scoped>
.user-profile-header {
  padding: 32px;
  background: linear-gradient(to bottom, rgba(30, 30, 35, 0.8), rgba(20, 20, 25, 0.4));
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-box {
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-box:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.3);
}

.stat-box .label {
  font-size: 13px;
  color: #a1a1aa;
  margin-bottom: 8px;
}

.stat-box .value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.stat-box .unit {
  font-size: 12px;
  font-weight: 400;
  color: #71717a;
  margin-left: 4px;
}

.chart-container {
  padding: 24px;
  background: rgba(20, 20, 25, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  height: 100%;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #d1d1d6;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
