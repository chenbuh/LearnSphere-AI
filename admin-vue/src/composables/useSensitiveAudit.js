import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { adminApi } from '@/api/admin'
import echarts from '@/utils/echarts'
import {
  createSensitiveLogColumns,
  createSensitiveWordColumns,
  createTrendChartOption,
  createWordPieChartOption,
  defaultSensitiveAuditStats
} from '@/utils/sensitiveAuditConfig'

export function useSensitiveAudit() {
  const message = useMessage()

  const loading = ref(false)
  const list = ref([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(10)
  const keyword = ref('')
  const checkedRowKeys = ref([])
  const activeTab = ref('logs')

  const wordLoading = ref(false)
  const wordList = ref([])
  const wordTotal = ref(0)
  const wordPage = ref(1)
  const wordPageSize = ref(10)
  const wordKeyword = ref('')

  const showAddModal = ref(false)
  const newWord = ref({ word: '' })
  const statsData = ref({ ...defaultSensitiveAuditStats })

  const trendChartRef = ref(null)
  const wordPieChartRef = ref(null)

  let trendChartInstance = null
  let wordPieChartInstance = null

  const fetchData = async () => {
    loading.value = true
    try {
      const res = await adminApi.getSensitiveLogs({
        page: page.value,
        size: pageSize.value,
        keyword: keyword.value
      })
      if (res.code === 200) {
        list.value = res.data.records || []
        total.value = res.data.total || 0
      }
    } catch (error) {
      message.error('加载审计日志失败')
    } finally {
      loading.value = false
    }
  }

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteSensitiveLog(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handlePageChange = (nextPage) => {
    page.value = nextPage
    fetchData()
  }

  const handleBatchDelete = async () => {
    if (checkedRowKeys.value.length === 0) return
    try {
      await adminApi.deleteSensitiveLogsBatch(checkedRowKeys.value)
      message.success(`成功删除 ${checkedRowKeys.value.length} 条记录`)
      checkedRowKeys.value = []
      fetchData()
    } catch (error) {
      message.error('批量删除失败')
    }
  }

  const fetchWords = async () => {
    wordLoading.value = true
    try {
      const res = await adminApi.getSensitiveWords({
        page: wordPage.value,
        size: wordPageSize.value,
        keyword: wordKeyword.value
      })
      if (res.code === 200) {
        wordList.value = res.data.records || []
        wordTotal.value = res.data.total || 0
      }
    } catch (error) {
      message.error('加载词库失败')
    } finally {
      wordLoading.value = false
    }
  }

  const handleAddWord = async () => {
    if (!newWord.value.word.trim()) {
      message.warning('请输入敏感词')
      return
    }

    try {
      const res = await adminApi.addSensitiveWord(newWord.value)
      if (res.code === 200) {
        message.success('添加成功')
        showAddModal.value = false
        newWord.value.word = ''
        fetchWords()
      } else {
        message.error(res.message || '添加失败')
      }
    } catch (error) {
      message.error('添加失败')
    }
  }

  const handleDeleteWord = async (id) => {
    try {
      await adminApi.deleteSensitiveWord(id)
      message.success('删除成功')
      fetchWords()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleReloadWords = async () => {
    try {
      await adminApi.reloadSensitiveWords()
      message.success('词库重载成功，已生效！')
    } catch (error) {
      message.error('词库重载失败')
    }
  }

  const handleWordPageChange = (nextPage) => {
    wordPage.value = nextPage
    fetchWords()
  }

  const renderTrendChart = () => {
    if (!trendChartRef.value) return
    if (!trendChartInstance) trendChartInstance = echarts.init(trendChartRef.value)
    trendChartInstance.setOption(createTrendChartOption(statsData.value, echarts))
  }

  const renderWordPieChart = () => {
    if (!wordPieChartRef.value) return
    if (!wordPieChartInstance) wordPieChartInstance = echarts.init(wordPieChartRef.value)
    wordPieChartInstance.setOption(createWordPieChartOption(statsData.value))
  }

  const renderCharts = () => {
    renderTrendChart()
    renderWordPieChart()
  }

  const fetchStatsData = async () => {
    try {
      const res = await adminApi.getSensitiveStats()
      if (res.code === 200) {
        statsData.value = res.data || { ...defaultSensitiveAuditStats }
        renderCharts()
      }
    } catch (error) {
      console.error('获取审计统计数据失败', error)
    }
  }

  const handleResize = () => {
    trendChartInstance?.resize()
    wordPieChartInstance?.resize()
  }

  const columns = computed(() =>
    createSensitiveLogColumns({
      onDeleteLog: handleDelete
    })
  )

  const wordColumns = computed(() =>
    createSensitiveWordColumns({
      onDeleteWord: handleDeleteWord
    })
  )

  onMounted(() => {
    fetchData()
    fetchWords()
    nextTick(() => {
      fetchStatsData()
    })
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    trendChartInstance?.dispose()
    wordPieChartInstance?.dispose()
  })

  return {
    activeTab,
    checkedRowKeys,
    columns,
    fetchData,
    fetchWords,
    handleAddWord,
    handleBatchDelete,
    handlePageChange,
    handleReloadWords,
    handleWordPageChange,
    keyword,
    list,
    loading,
    newWord,
    page,
    pageSize,
    showAddModal,
    statsData,
    total,
    trendChartRef,
    wordColumns,
    wordKeyword,
    wordList,
    wordLoading,
    wordPage,
    wordPageSize,
    wordPieChartRef,
    wordTotal
  }
}
