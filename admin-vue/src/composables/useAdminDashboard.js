import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useNotification } from 'naive-ui'
import { adminApi } from '@/api/admin'
import echarts from '@/utils/echarts'
import { loadGsap } from '@/utils/gsap'
import {
  createContentRadarChartOption,
  createFunnelChartOption,
  createRetentionChartOption,
  createUserGrowthChartOption,
  dashboardQuickActions,
  getDashboardGreeting
} from '@/utils/adminDashboardConfig'

export function useAdminDashboard() {
  const message = useMessage()
  const notification = useNotification()
  const router = useRouter()

  const loading = ref(false)
  const skeletonLoading = ref(true)
  const refreshing = ref(false)

  const stats = ref({
    totalUsers: 0,
    todayNewUsers: 0
  })

  const contentStats = ref({
    vocabulary: 0,
    reading: 0,
    listening: 0,
    grammar: 0,
    writing: 0,
    speaking: 0
  })

  const aiStats = ref({
    totalCalls: 0,
    successRate: 0,
    avgDuration: 0,
    totalTokens: 0
  })

  const funnelData = ref({
    registered: 0,
    active_plan: 0,
    vip: 0
  })

  const financeStats = ref({
    totalRevenue: 0,
    monthly: 0,
    quarterly: 0,
    yearly: 0
  })

  const retentionData = ref([])
  const userGrowthData = ref([])
  const recentLogs = ref([])
  const lastUpdateTime = ref(new Date())

  const showBriefingModal = ref(false)
  const briefingLoading = ref(false)
  const briefingData = ref({
    title: '',
    summary: '',
    alert: ''
  })

  const currentTime = ref(new Date())
  const systemHealth = ref(98)
  const onlineUsers = ref(Math.floor(Math.random() * 50) + 120)

  const userChartRef = ref(null)
  const retentionChartRef = ref(null)
  const funnelChartRef = ref(null)
  const contentRadarRef = ref(null)

  const setUserChartRef = (el) => {
    userChartRef.value = el
  }

  const setRetentionChartRef = (el) => {
    retentionChartRef.value = el
  }

  const setFunnelChartRef = (el) => {
    funnelChartRef.value = el
  }

  const setContentRadarRef = (el) => {
    contentRadarRef.value = el
  }

  let timeTimer = null
  let charts = {
    user: null,
    retention: null,
    funnel: null,
    radar: null
  }

  const formattedTime = computed(() => {
    return currentTime.value.toLocaleTimeString('zh-CN', { hour12: false })
  })

  const formattedDate = computed(() => {
    return currentTime.value.toLocaleDateString('zh-CN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  const greeting = computed(() => getDashboardGreeting(currentTime.value))

  const renderUserGrowthChart = () => {
    if (!userChartRef.value || userChartRef.value.clientWidth <= 0 || userChartRef.value.clientHeight <= 0) {
      return
    }

    charts.user?.dispose()
    charts.user = echarts.init(userChartRef.value)
    charts.user.setOption(createUserGrowthChartOption(userGrowthData.value, echarts))
  }

  const renderContentRadarChart = () => {
    if (!contentRadarRef.value || contentRadarRef.value.clientWidth <= 0 || contentRadarRef.value.clientHeight <= 0) {
      return
    }

    charts.radar?.dispose()
    charts.radar = echarts.init(contentRadarRef.value)
    charts.radar.setOption(createContentRadarChartOption(contentStats.value))
  }

  const renderRetentionChart = () => {
    if (!retentionChartRef.value || retentionChartRef.value.clientWidth <= 0 || retentionChartRef.value.clientHeight <= 0) {
      return
    }

    charts.retention?.dispose()
    charts.retention = echarts.init(retentionChartRef.value)
    charts.retention.setOption(createRetentionChartOption(retentionData.value, echarts))
  }

  const renderFunnelChart = () => {
    if (!funnelChartRef.value || funnelChartRef.value.clientWidth <= 0 || funnelChartRef.value.clientHeight <= 0) {
      return
    }

    charts.funnel?.dispose()
    charts.funnel = echarts.init(funnelChartRef.value)
    charts.funnel.setOption(createFunnelChartOption(funnelData.value))
  }

  const renderCharts = async () => {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    renderUserGrowthChart()
    renderContentRadarChart()
    renderRetentionChart()
    renderFunnelChart()
  }

  const fetchAllStats = async (showLoading = true) => {
    if (showLoading) loading.value = true
    else refreshing.value = true

    try {
      const [statsRes, contentRes, aiRes, growthRes, funnelRes, financeRes, retentionRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getContentStats(),
        adminApi.getAIStats(),
        adminApi.getUserGrowth(),
        adminApi.getUserFunnel(),
        adminApi.getFinanceStats(),
        adminApi.getRetentionData(),
        adminApi.getOperationLogs({ page: 1, size: 6 })
      ])

      stats.value = statsRes.data || stats.value
      contentStats.value = contentRes.data || contentStats.value
      aiStats.value = aiRes.data || aiStats.value
      userGrowthData.value = growthRes.data || []
      funnelData.value = funnelRes.data || funnelData.value
      financeStats.value = financeRes.data || financeStats.value
      retentionData.value = retentionRes.data || []
      recentLogs.value = logsRes.data?.records || []
      lastUpdateTime.value = new Date()

      setTimeout(() => renderCharts(), 100)

      if (!showLoading) {
        message.success('数据同步成功')
      }

      if (aiStats.value.successRate < 95 && aiStats.value.totalCalls > 10) {
        notification.error({
          content: 'AI 服务异常预警',
          meta: `当前成功率仅为 ${aiStats.value.successRate.toFixed(1)}%，低于 95% 阈值。请立即检查 API 额度或网络状况。`,
          duration: 5000,
          keepAliveOnHover: true
        })
      }
    } catch (error) {
      message.error('概览数据加载失败')
      console.error(error)
    } finally {
      loading.value = false
      refreshing.value = false

      if (skeletonLoading.value) {
        setTimeout(() => {
          skeletonLoading.value = false
          nextTick(() => {
            animateKPIs()
          })
        }, 500)
      }
    }
  }

  const animateKPIs = async () => {
    if (skeletonLoading.value) {
      return
    }

    const kpiCards = document.querySelectorAll('.kpi-card')
    const otherCards = document.querySelectorAll('.p-card:not(.kpi-card)')

    if (kpiCards.length === 0 && otherCards.length === 0) {
      return
    }

    const gsap = await loadGsap()
    const timeline = gsap.timeline()

    if (kpiCards.length > 0) {
      timeline.fromTo(
        kpiCards,
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'elastic.out(1, 0.75)',
          clearProps: 'all'
        }
      )
    }

    if (otherCards.length > 0) {
      timeline.fromTo(
        otherCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          clearProps: 'all'
        },
        kpiCards.length > 0 ? '-=0.6' : 0
      )
    }
  }

  const generateBriefing = async () => {
    showBriefingModal.value = true
    briefingLoading.value = true
    try {
      const res = await adminApi.getAIBriefing()
      if (res.code === 200) {
        briefingData.value = res.data
      }
    } catch (error) {
      message.error('简报生成失败')
    } finally {
      briefingLoading.value = false
    }
  }

  const handleResize = () => {
    Object.values(charts).forEach(chart => chart?.resize())
  }

  const goToPath = path => {
    router.push(path)
  }

  onMounted(() => {
    timeTimer = setInterval(() => {
      currentTime.value = new Date()
      if (Math.random() > 0.8) {
        onlineUsers.value += Math.floor(Math.random() * 5) - 2
      }
    }, 1000)
  })

  onMounted(() => {
    fetchAllStats()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    clearInterval(timeTimer)
    window.removeEventListener('resize', handleResize)
    Object.values(charts).forEach(chart => chart?.dispose())
  })

  return {
    aiStats,
    briefingData,
    briefingLoading,
    contentRadarRef,
    setContentRadarRef,
    contentStats,
    currentTime,
    fetchAllStats,
    financeStats,
    formattedDate,
    formattedTime,
    funnelChartRef,
    setFunnelChartRef,
    generateBriefing,
    goToPath,
    greeting,
    lastUpdateTime,
    loading,
    onlineUsers,
    quickActions: dashboardQuickActions,
    recentLogs,
    refreshing,
    retentionChartRef,
    setRetentionChartRef,
    retentionData,
    showBriefingModal,
    skeletonLoading,
    stats,
    systemHealth,
    userChartRef,
    setUserChartRef
  }
}
