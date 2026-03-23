import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import gsap from 'gsap'

import { userApi } from '../api/user'
import { recommendationApi } from '../api/recommendation'
import { learningApi } from '../api/learning'
import { useUserStore } from '@/stores/user'
import { useSystemStore } from '@/stores/system'
import { useThemeStore } from '@/stores/theme'
import { decryptPayload } from '@/utils/crypto'


export function useDashboardOverview() {
  const router = useRouter()
  const { t, tm } = useI18n()
  const userStore = useUserStore()
  const systemStore = useSystemStore()
  const themeStore = useThemeStore()

  const stats = ref({
      time: { value: '0h', change: '+0%' },
      vocab: { value: '0', change: '+0' },
      streak: { value: '0', change: 'days' } // Streak info
  })
  const recentActivity = ref([])
  const leaderboard = ref([]) // Leaderboard data
  const aiStep = ref(0)
  const recData = ref(null)
  const aiRecommendations = ref([])
  const userInfo = ref(null) // User info
  const isCheckedIn = ref(false) // Check-in status
  const aiRecLoading = ref(true)
  const aiLogId = ref(null)

  const getLocalYMD = (date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
  }

  const normalizeCheckinDate = (value) => {
      if (!value) return ''

      if (typeof value === 'string') {
          return value.length >= 10 ? value.substring(0, 10) : value
      }

      if (Array.isArray(value) && value.length >= 3) {
          const [year, month, day] = value
          return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }

      if (typeof value === 'number') {
          return getLocalYMD(new Date(value))
      }

      if (typeof value === 'object') {
          const candidate = new Date(value)
          if (!Number.isNaN(candidate.getTime())) {
              return getLocalYMD(candidate)
          }
      }

      return ''
  }

  // Leveling System Data
  const userLevel = computed(() => {
    const points = userInfo.value?.points || 0
    return Math.floor(Math.sqrt(points / 10)) + 1
  })

  const xpProgress = computed(() => {
    const points = userInfo.value?.points || 0
    const currentLevel = userLevel.value
    const currentLevelMinPoints = Math.pow(currentLevel - 1, 2) * 10
    const nextLevelMinPoints = Math.pow(currentLevel, 2) * 10
    const progress = ((points - currentLevelMinPoints) / (nextLevelMinPoints - currentLevelMinPoints)) * 100
    return Math.min(Math.max(progress, 0), 100)
  })

  const nextLevelXP = computed(() => {
    const currentLevel = userLevel.value
    return Math.pow(currentLevel, 2) * 10
  })

  // Mouse Parallax for Welcome Banner
  const bannerTransform = ref('translate(0, 0)')
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const moveX = (clientX - window.innerWidth / 2) / 50
    const moveY = (clientY - window.innerHeight / 2) / 50
    bannerTransform.value = `translate(${moveX}px, ${moveY}px)`
  }

  const barChartRef = ref(null)
  const lineChartRef = ref(null)
  let barChartInstance = null
  let lineChartInstance = null
  let echartsModule = null
  let chartResizeObserver = null
  let chartInitFrame = null
  let barChartSourceData = []
  let lineChartSourceData = []

  const chartRange = ref(7)
  const isDarkTheme = computed(() => themeStore.isDark)

  const getEcharts = async () => {
      if (!echartsModule) {
          const mod = await import('@/utils/echarts')
          echartsModule = mod.default
      }
      return echartsModule
  }

  const fetchUserData = async () => {
      try {
          const { code, data } = await userApi.getUserInfo()
          if (code === 200 && data) {
              userInfo.value = data
              stats.value.streak.value = data.realConsecutiveDays != null ? data.realConsecutiveDays : (data.consecutiveDays || 0)
            
              // Check if checked in today
              const lastDate = normalizeCheckinDate(data.lastCheckinDate)
              const today = getLocalYMD(new Date())
              isCheckedIn.value = lastDate === today
          }
      } catch (e) {
          console.error("Failed to fetch user info", e)
      }
  }

  const fetchLeaderboard = async () => {
      try {
          const { code, data } = await userApi.getLeaderboard()
          if (code === 200) {
              leaderboard.value = data
          }
      } catch (e) {
          console.error("Failed to fetch leaderboard", e)
      }
  }

  const message = useMessage()

  const handleCheckIn = async () => {
      if (isCheckedIn.value) return
      try {
          const { code, data } = await userApi.checkin()
          if (code === 200) {
              stats.value.streak.value = data
              isCheckedIn.value = true
              if (userInfo.value) {
                  userInfo.value.lastCheckinDate = getLocalYMD(new Date())
                  userInfo.value.realConsecutiveDays = data
                  userInfo.value.consecutiveDays = data
              }
              await fetchUserData()
              message.success(t('dashboard.checkInSuccess'))
          } else {
              message.error(t('dashboard.checkInFail'))
          }
      } catch (e) {
          console.error("Checkin failed", e)
      }
  }

  const fetchDashboardStats = async () => {
      fetchUserData() // Load user stats
      fetchLeaderboard() // Load leaderboard
      try {
          const { code, data } = await learningApi.getStatistics() 
          if (code === 200 && data) {
              // ... (rest of the logic remains)
              const overall = data.overall || {}
              const byType = data.byType || [] 
            
              const weeklyStats = data.weeklyStats || []
              const trendStats = data.trendStats || []

              // Top Cards
              // Vocab
              const vocabStats = byType.find(t => t.content_type === 'vocabulary')
              const vocabCount = vocabStats ? vocabStats.count : 0
              stats.value.vocab.value = (vocabCount > 1000 ? (vocabCount/1000).toFixed(1) + 'k' : vocabCount)
            
              const growthVocab = data.growthVocab || 0
              stats.value.vocab.change = (growthVocab >= 0 ? '+' : '') + growthVocab

              // Time
              const totalSeconds = overall.totalTimeSpent || 0
              const totalHours = (totalSeconds / 3600).toFixed(1)
              stats.value.time.value = totalHours + 'h'
            
              const growthTimeSeconds = data.growthTime || 0
              let timeChangeText = ''
              if (growthTimeSeconds < 3600) {
                   timeChangeText = '+' + (growthTimeSeconds / 60).toFixed(0) + 'm'
              } else {
                   timeChangeText = '+' + (growthTimeSeconds / 3600).toFixed(1) + 'h'
              }
              stats.value.time.change = timeChangeText

              // Initial Chart Render
              updateBarChart(weeklyStats)
              updateLineChart(trendStats)
          }
      } catch (e) {
          console.error("Failed to fetch statistics", e)
      }
  }

  const fetchChartData = async () => {
      try {
          const days = chartRange.value
          const { code, data } = await learningApi.getTrends(days)
          if (code === 200 && data) {
              updateBarChart(data.weeklyStats || [])
              updateLineChart(data.trendStats || [])
          }
      } catch (e) {
          console.error("Failed to fetch chart data", e)
      }
  }

  const formatDateLabel = (dateStr) => {
      const date = new Date(dateStr)
      const days = tm('dashboard.weekdays')
      // If range is 30, use MM-DD
      // If range is 7, use Weekday
      // We can infer context or pass param.
      // Simple heuristic: check current range ref? But function is generic.
      // Let's formatting based on context or just return smart label.
      // actually, for 7 days, weekday is good. for 30, date is better.
      return date.getMonth()+1 + '-' + date.getDate() // MM-DD default
  }

  const getWeekday = (dateStr) => {
      const date = new Date(dateStr)
      const days = tm('dashboard.weekdays')
      return days[date.getDay()]
  }

  const getChartThemeTokens = () => (
      isDarkTheme.value
          ? {
                mode: 'dark',
                tooltipBackground: '#27272a',
                tooltipBorder: '#3f3f46',
                tooltipText: '#ffffff',
                axisLabel: '#71717a',
                splitLine: 'rgba(255,255,255,0.05)',
                barGradientStart: '#6366f1',
                barGradientEnd: 'rgba(99, 102, 241, 0.1)',
                lineColor: '#10b981',
                lineAreaStart: 'rgba(16, 185, 129, 0.2)',
                lineAreaEnd: 'rgba(16, 185, 129, 0)'
            }
          : {
                mode: null,
                tooltipBackground: 'rgba(255, 255, 255, 0.96)',
                tooltipBorder: 'rgba(148, 163, 184, 0.24)',
                tooltipText: '#0f172a',
                axisLabel: '#64748b',
                splitLine: 'rgba(148, 163, 184, 0.18)',
                barGradientStart: '#6366f1',
                barGradientEnd: 'rgba(99, 102, 241, 0.16)',
                lineColor: '#059669',
                lineAreaStart: 'rgba(16, 185, 129, 0.16)',
                lineAreaEnd: 'rgba(16, 185, 129, 0.02)'
            }
  )

  const getBarChartSeries = (dataList = []) => {
      const labels = []
      const values = []
      const count = chartRange.value

      const dataMap = {}
      if (dataList.length > 0) {
          dataList.forEach(d => {
              let dateKey = ''
              if (d.date && d.date.length >= 10) {
                  dateKey = d.date.substring(0, 10)
              } else {
                  dateKey = getLocalYMD(new Date(d.date))
              }
              dataMap[dateKey] = d.timeSpent
          })
      }

      const today = new Date()
      for (let i = count - 1; i >= 0; i--) {
          const d = new Date()
          d.setDate(today.getDate() - i)
          const dateStr = getLocalYMD(d)

          labels.push(count === 7 ? getWeekday(dateStr) : formatDateLabel(dateStr))

          const val = dataMap[dateStr] || 0
          values.push((val / 60).toFixed(0))
      }

      return { labels, values }
  }

  const getLineChartSeries = (dataList = []) => {
      const labels = []
      const values = []
      const count = chartRange.value

      const dataMap = {}
      if (dataList.length > 0) {
          dataList.forEach(d => {
              let dateKey = ''
              if (d.date && d.date.length >= 10) {
                  dateKey = d.date.substring(0, 10)
              } else {
                  dateKey = getLocalYMD(new Date(d.date))
              }
              dataMap[dateKey] = d.accuracy
          })
      }

      const today = new Date()
      for (let i = count - 1; i >= 0; i--) {
          const d = new Date()
          d.setDate(today.getDate() - i)
          const dateStr = getLocalYMD(d)

          labels.push(count === 7 ? getWeekday(dateStr) : formatDateLabel(dateStr))

          const val = dataMap[dateStr] || 0
          values.push(parseFloat(val).toFixed(1))
      }

      return { labels, values }
  }

  const isChartContainerReady = (el) => Boolean(el && el.clientWidth > 0 && el.clientHeight > 0)

  const isChartActive = (instance) => Boolean(instance && typeof instance.isDisposed === 'function' && !instance.isDisposed())

  const disposeBarChart = () => {
      if (isChartActive(barChartInstance)) {
          barChartInstance.dispose()
      }
      barChartInstance = null
  }

  const disposeLineChart = () => {
      if (isChartActive(lineChartInstance)) {
          lineChartInstance.dispose()
      }
      lineChartInstance = null
  }

  const applyBarChartOption = async () => {
      if (!isChartActive(barChartInstance)) return

      const echarts = await getEcharts()
      const chartTheme = getChartThemeTokens()
      const { labels, values } = getBarChartSeries(barChartSourceData)

      barChartInstance.setOption({
          backgroundColor: 'transparent',
          grid: { top: 30, right: 20, bottom: 20, left: 30, containLabel: true },
          tooltip: {
              trigger: 'axis',
              backgroundColor: chartTheme.tooltipBackground,
              borderColor: chartTheme.tooltipBorder,
              textStyle: { color: chartTheme.tooltipText },
              formatter: '{b}: {c} ' + t('dashboard.learningTime')
          },
          xAxis: {
              type: 'category',
              data: labels,
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: chartTheme.axisLabel }
          },
          yAxis: {
              type: 'value',
              splitLine: { lineStyle: { color: chartTheme.splitLine } },
              axisLabel: { show: false }
          },
          series: [{
              type: 'bar',
              barWidth: '30%',
              data: values,
              itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: chartTheme.barGradientStart },
                      { offset: 1, color: chartTheme.barGradientEnd }
                  ]),
                  borderRadius: [4, 4, 0, 0]
              }
          }]
      }, true)
  }

  const applyLineChartOption = async () => {
      if (!isChartActive(lineChartInstance)) return

      const echarts = await getEcharts()
      const chartTheme = getChartThemeTokens()
      const { labels, values } = getLineChartSeries(lineChartSourceData)

      lineChartInstance.setOption({
          backgroundColor: 'transparent',
          grid: { top: 30, right: 20, bottom: 20, left: 30, containLabel: true },
          tooltip: {
              trigger: 'axis',
              backgroundColor: chartTheme.tooltipBackground,
              borderColor: chartTheme.tooltipBorder,
              textStyle: { color: chartTheme.tooltipText },
              formatter: '{b}: {c}%'
          },
          xAxis: {
              type: 'category',
              data: labels,
              axisLine: { show: false },
              axisTick: { show: false },
              axisLabel: { color: chartTheme.axisLabel }
          },
          yAxis: {
              type: 'value',
              splitLine: { lineStyle: { color: chartTheme.splitLine } },
              axisLabel: { color: chartTheme.axisLabel },
              max: 100
          },
          series: [{
              type: 'line',
              smooth: true,
              showSymbol: false,
              lineStyle: { width: 4, color: chartTheme.lineColor },
              areaStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: chartTheme.lineAreaStart },
                      { offset: 1, color: chartTheme.lineAreaEnd }
                  ])
              },
              data: values
          }]
      }, true)
  }

  const updateBarChart = (dataList) => {
      barChartSourceData = Array.isArray(dataList) ? dataList : []
      applyBarChartOption()
  }

  const updateLineChart = (dataList) => {
      lineChartSourceData = Array.isArray(dataList) ? dataList : []
      applyLineChartOption()
  }

  const initCharts = async (forceRecreate = false) => {
      const echarts = await getEcharts()
      const themeMode = getChartThemeTokens().mode

      if (forceRecreate) {
          disposeBarChart()
          disposeLineChart()
      }

      if (barChartRef.value && isChartContainerReady(barChartRef.value) && !isChartActive(barChartInstance)) {
          barChartInstance = echarts.init(barChartRef.value, themeMode)
      }

      if (lineChartRef.value && isChartContainerReady(lineChartRef.value) && !isChartActive(lineChartInstance)) {
          lineChartInstance = echarts.init(lineChartRef.value, themeMode)
      }

      await applyBarChartOption()
      await applyLineChartOption()
  }

  const scheduleChartInit = (forceRecreate = false) => {
      if (typeof window === 'undefined') return

      if (chartInitFrame !== null) {
          cancelAnimationFrame(chartInitFrame)
      }

      chartInitFrame = requestAnimationFrame(async () => {
          chartInitFrame = null
          await initCharts(forceRecreate)
          handleResize()
      })
  }

  const observeChartContainers = () => {
      if (typeof ResizeObserver === 'undefined') return

      if (chartResizeObserver) {
          chartResizeObserver.disconnect()
      }

      chartResizeObserver = new ResizeObserver((entries) => {
          const hasVisibleChart = entries.some(entry => entry.contentRect.width > 0 && entry.contentRect.height > 0)
          if (!hasVisibleChart) return

          scheduleChartInit()
      })

      if (barChartRef.value) {
          chartResizeObserver.observe(barChartRef.value)
      }

      if (lineChartRef.value) {
          chartResizeObserver.observe(lineChartRef.value)
      }
  }

  // ... existing fetchRecentActivity and helpers ...
  const fetchRecentActivity = async () => {
      try {
          const { code, data } = await learningApi.getRecords({ page: 1, pageSize: 5 })
          if (code === 200 && data && data.records) {
              recentActivity.value = data.records.map(record => ({
                  type: record.contentType,
                  title: formatRecordTitle(record),
                  score: record.score != null ? record.score + '' : (record.isCorrect ? 'Correct' : 'Incorrect'),
                  time: simplifyTime(record.createTime)
              }))
          }
      } catch (e) {
          console.error("Failed to fetch records", e)
      }
  }
  const formatRecordTitle = (r) => { /* Same as before or simplified */ 
      const map = { 
          'vocabulary': t('dashboard.activityVocab'), 
          'grammar': t('dashboard.activityGrammar'), 
          'reading': t('dashboard.activityReading'), 
          'listening': t('dashboard.activityListening'), 
          'exam': t('dashboard.activityExam') 
      }
      return map[r.contentType] || t('dashboard.activityNormal')
  }
  const simplifyTime = (isoStr) => { /* Same as before */ 
      if(!isoStr) return ''
      const date = new Date(isoStr)
      const now = new Date()
      const diffMs = now - date
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 60) return diffMins + t('dashboard.minutesAgo')
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return diffHours + t('dashboard.hoursAgo')
      return Math.floor(diffHours / 24) + t('dashboard.daysAgo')
  }
  const handleActivityClick = (type) => {
    const map = {
      'vocab': '/vocabulary',
      'vocabulary': '/vocabulary',
      'grammar': '/grammar',
      'reading': '/reading',
      'listening': '/listening',
      'exam': '/mock-exam'
    }
    const path = map[type] || '/dashboard' // Default stay or handled elsewhere
    router.push(path)
  }
  const handleStatClick = (label) => { router.push('/analysis') } // simplified

  let timer = null

  onMounted(async () => {
    timer = setInterval(() => { aiStep.value = (aiStep.value + 1) % 3 }, 3000)

    // Load AI Recommendations in background
    try {
      aiRecLoading.value = true
      const res = await recommendationApi.getPersonalized(1)
      if (res.code === 200 && res.data && res.data.length > 0) {
        recData.value = res.data[0]
      }
    
      // 获取 AI 智能分析推荐
      const aiRes = await recommendationApi.getAIRecommendations()
      if (aiRes.code === 200 && aiRes.data) {
        const decryptedData = decryptPayload(aiRes.data)
        aiRecommendations.value = decryptedData.list || []
        aiLogId.value = decryptedData.logId
      } else {
        aiRecommendations.value = []
      }
    } catch (e) {
      console.error('Failed to fetch recommendations', e)
      aiRecommendations.value = [
        { title: t('dashboard.activityNormal'), content: t('dashboard.aiFallbackContent'), action: t('dashboard.aiFallbackAction'), path: '/daily-tasks' }
      ]
    } finally {
      aiRecLoading.value = false
    }

    nextTick(async () => {
      observeChartContainers()
      scheduleChartInit(true)
    
      // Fetch data after charts are initialized
      fetchDashboardStats()
      fetchRecentActivity()
    
      // GSAP Entrance Animations with safer configuration
      const tl = gsap.timeline({ 
        defaults: { 
          ease: 'power2.out', 
          duration: 0.6,
          clearProps: 'all' // Clear inline styles after animation completes
        } 
      })
    
      // Use autoAlpha instead of opacity for safer visibility control
      tl.from('.welcome-banner', { autoAlpha: 0, y: 20 })
        .from('.ai-feature-card', { autoAlpha: 0, y: 15 }, '-=0.3')
        .from('.dashboard-stat-card', { 
          autoAlpha: 0,
          y: 15,
          stagger: 0.08
        }, '-=0.3')
        .from('.chart-card', { 
          autoAlpha: 0,
          y: 15,
          stagger: 0.1 
        }, '-=0.2')
      
      // Resize charts after animation completes
      setTimeout(() => {
          scheduleChartInit()
      }, 800)
    })
  
    window.addEventListener('resize', handleResize)
  })

  const handleResize = () => {
      if (isChartActive(barChartInstance) && isChartContainerReady(barChartRef.value)) {
          barChartInstance.resize()
      }
      if (isChartActive(lineChartInstance) && isChartContainerReady(lineChartRef.value)) {
          lineChartInstance.resize()
      }
  }

  watch(isDarkTheme, () => {
      nextTick(() => {
          scheduleChartInit(true)
      })
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
    window.removeEventListener('resize', handleResize)
    if (chartResizeObserver) {
      chartResizeObserver.disconnect()
      chartResizeObserver = null
    }
    if (chartInitFrame !== null) {
      cancelAnimationFrame(chartInitFrame)
      chartInitFrame = null
    }
    disposeBarChart()
    disposeLineChart()
  })

  return {
    aiLogId,
    aiRecLoading,
    aiRecommendations,
    bannerTransform,
    barChartRef,
    chartRange,
    fetchChartData,
    handleCheckIn,
    handleMouseMove,
    isCheckedIn,
    leaderboard,
    lineChartRef,
    nextLevelXP,
    recentActivity,
    stats,
    systemStore,
    t,
    userInfo,
    userLevel,
    userStore,
    xpProgress
  }
}
