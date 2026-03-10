import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage, useNotification } from 'naive-ui'
import { BookMarked, Settings, ShieldAlert, Users } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import echarts from '@/utils/echarts'
import { loadGsap } from '@/utils/gsap'

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

  const greeting = computed(() => {
    const hour = currentTime.value.getHours()
    if (hour < 6) return '凌晨好'
    if (hour < 9) return '早上好'
    if (hour < 12) return '上午好'
    if (hour < 14) return '中午好'
    if (hour < 17) return '下午好'
    if (hour < 19) return '傍晚好'
    if (hour < 22) return '晚上好'
    return '半夜好'
  })

  const quickActions = [
    { label: '用户审计', icon: Users, path: '/users', color: '#6366f1' },
    { label: '词库更新', icon: BookMarked, path: '/vocabulary', color: '#10b981' },
    { label: '系统设置', icon: Settings, path: '/settings', color: '#f59e0b' },
    { label: '安全日志', icon: ShieldAlert, path: '/logs', color: '#f43f5e' }
  ]

  const renderCharts = async () => {
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    const commonTheme = {
      textStyle: { fontFamily: 'Inter, sans-serif' },
      labelColor: 'rgba(255, 255, 255, 0.4)',
      splitLine: 'rgba(255, 255, 255, 0.05)'
    }

    if (userChartRef.value && userChartRef.value.clientWidth > 0 && userChartRef.value.clientHeight > 0) {
      charts.user?.dispose()
      charts.user = echarts.init(userChartRef.value)
      charts.user.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross', label: { backgroundColor: '#18181b' } },
          backgroundColor: 'rgba(24, 24, 27, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          textStyle: { color: '#fff' }
        },
        grid: { left: '2%', right: '3%', bottom: '2%', top: '15%', containLabel: true },
        xAxis: {
          type: 'category',
          data: userGrowthData.value.map(item => item.date.slice(5)),
          axisLabel: { color: commonTheme.labelColor, fontSize: 10 },
          axisLine: { show: false }
        },
        yAxis: {
          type: 'value',
          min: 0,
          splitLine: { lineStyle: { color: commonTheme.splitLine, type: 'dashed' } },
          axisLabel: { color: commonTheme.labelColor }
        },
        series: [{
          name: '新增注册',
          data: userGrowthData.value.map(item => item.count),
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#6366f1' },
          lineStyle: { width: 3, shadowBlur: 10, shadowColor: 'rgba(99, 102, 241, 0.3)' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'transparent' }
            ])
          }
        }]
      })
    }

    if (contentRadarRef.value && contentRadarRef.value.clientWidth > 0 && contentRadarRef.value.clientHeight > 0) {
      charts.radar?.dispose()
      charts.radar = echarts.init(contentRadarRef.value)
      charts.radar.setOption({
        radar: {
          indicator: [
            { name: '词汇', max: 10000 },
            { name: '听力', max: 10000 },
            { name: '阅读', max: 10000 },
            { name: '口语', max: 10000 },
            { name: '语法', max: 10000 },
            { name: '写作', max: 10000 }
          ],
          splitNumber: 5,
          axisName: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 11 },
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
          splitArea: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false }
        },
        series: [{
          type: 'radar',
          data: [{
            value: [
              contentStats.value.vocabulary || 0,
              contentStats.value.listening || 0,
              contentStats.value.reading || 0,
              contentStats.value.speaking || 0,
              contentStats.value.grammar || 0,
              contentStats.value.writing || 0
            ],
            name: '内容分布',
            symbol: 'none',
            itemStyle: { color: '#10b981' },
            areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
            lineStyle: { width: 2 }
          }]
        }]
      })
    }

    if (retentionChartRef.value && retentionChartRef.value.clientWidth > 0 && retentionChartRef.value.clientHeight > 0) {
      charts.retention?.dispose()
      charts.retention = echarts.init(retentionChartRef.value)
      charts.retention.setOption({
        grid: { left: 0, right: 0, bottom: 0, top: 10, containLabel: false },
        xAxis: { type: 'category', data: retentionData.value.map(item => item.day), show: false },
        yAxis: { type: 'value', min: 0, show: false },
        series: [{
          data: retentionData.value.map(item => item.rate),
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8b5cf6' },
              { offset: 1, color: '#6366f1' }
            ])
          }
        }]
      })
    }

    if (funnelChartRef.value && funnelChartRef.value.clientWidth > 0 && funnelChartRef.value.clientHeight > 0) {
      charts.funnel?.dispose()
      charts.funnel = echarts.init(funnelChartRef.value)
      charts.funnel.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        series: [{
          name: '转化漏斗',
          type: 'funnel',
          left: '15%',
          width: '70%',
          gap: 4,
          label: { show: true, position: 'inside', color: '#fff' },
          itemStyle: { borderRadius: 8, borderWidth: 0 },
          data: [
            { value: funnelData.value.registered || 0, name: '注册', itemStyle: { color: '#6366f1' } },
            { value: funnelData.value.active_plan || 0, name: '活跃', itemStyle: { color: '#a855f7' } },
            { value: funnelData.value.vip || 0, name: '付费', itemStyle: { color: '#14b8a6' } }
          ]
        }]
      })
    }
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
    contentStats,
    currentTime,
    fetchAllStats,
    financeStats,
    formattedDate,
    formattedTime,
    funnelChartRef,
    generateBriefing,
    goToPath,
    greeting,
    lastUpdateTime,
    loading,
    onlineUsers,
    quickActions,
    recentLogs,
    refreshing,
    retentionChartRef,
    retentionData,
    showBriefingModal,
    skeletonLoading,
    stats,
    systemHealth,
    userChartRef
  }
}
