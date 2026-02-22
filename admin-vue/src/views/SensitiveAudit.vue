<script setup>
import { ref, onMounted, h, nextTick, onBeforeUnmount } from 'vue'
import {
  NCard, NDataTable, NButton, NPagination, useMessage,
  NSpace, NInput, NTag, NPopconfirm, NIcon, NTooltip,
  NTabs, NTabPane, NModal, NForm, NFormItem,
  NGrid, NGridItem, NStatistic
} from 'naive-ui'
import { Trash, ShieldAlert, User, Search, RefreshCw, AlertTriangle, Plus, DatabaseBackup, Activity, ShieldX } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(false)
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const checkedRowKeys = ref([])

// 词库管理状态
const activeTab = ref('logs')
const wordLoading = ref(false)
const wordList = ref([])
const wordTotal = ref(0)
const wordPage = ref(1)
const wordPageSize = ref(10)
const wordKeyword = ref('')
const showAddModal = ref(false)
const newWord = ref({ word: '' })

// 词库管理列定义
const wordColumns = [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  { title: '敏感词内容', key: 'word', render: (row) => h(NTag, { type: 'error' }, { default: () => row.word }) },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'center',
    render(row) {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDeleteWord(row.id)
      }, {
        trigger: () => h(NButton, { size: 'small', type: 'error', ghost: true, circle: true }, { default: () => h(NIcon, { component: Trash, size: 14 }) }),
        default: () => '确定要删除此敏感词吗？'
      })
    }
  }
]

const columns = [
  { type: 'selection', width: 40 },
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  { 
    title: '用户', 
    key: 'username', 
    width: 150,
    render: (row) => h(NSpace, { align: 'center', size: 4 }, {
      default: () => [
        h(NIcon, { component: User, size: 14, class: 'text-zinc-500' }),
        h('span', { class: 'font-medium' }, row.username || '未知用户 (' + row.userId + ')')
      ]
    })
  },
  { 
    title: '命中的敏感词', 
    key: 'matchedWord', 
    width: 150,
    render: (row) => h(NTag, { type: 'error', bordered: false, round: true, size: 'small' }, {
      default: () => row.matchedWord
    })
  },
  { 
    title: '触发动作', 
    key: 'action', 
    width: 180,
    render: (row) => h('code', { class: 'text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded' }, row.action)
  },
  { 
    title: '违规内容片段', 
    key: 'content', 
    ellipsis: { tooltip: true },
    render: (row) => h('span', { class: 'text-zinc-400 italic' }, row.content)
  },
  { 
    title: '发生时间', 
    key: 'createTime', 
    width: 180, 
    render: (row) => new Date(row.createTime).toLocaleString() 
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'center',
    render(row) {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDelete(row.id)
      }, {
        trigger: () => h(NButton, {
          size: 'small',
          type: 'error',
          ghost: true,
          circle: true
        }, { default: () => h(NIcon, { component: Trash, size: 14 }) }),
        default: () => '确定要删除这条审计记录吗？'
      })
    }
  }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await adminApi.getSensitiveLogs({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value
    })
    if (res.code === 200) {
      list.value = res.data.records
      total.value = res.data.total
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

const handlePageChange = (p) => {
  page.value = p
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

// ---------------- 敏感词库方法 ----------------

const fetchWords = async () => {
  wordLoading.value = true
  try {
    const res = await adminApi.getSensitiveWords({
      page: wordPage.value,
      size: wordPageSize.value,
      keyword: wordKeyword.value
    })
    if (res.code === 200) {
      wordList.value = res.data.records
      wordTotal.value = res.data.total
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
    const res = await adminApi.addSensitiveWord(newWord.value);
    if (res.code === 200) {
        message.success('添加成功')
        showAddModal.value = false
        newWord.value.word = ''
        fetchWords()
    } else {
        message.error(res.message || '添加失败')
    }
  } catch (error) {
    // 接口本身在拦截器可能已报错误
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

const handleWordPageChange = (p) => {
  wordPage.value = p
  fetchWords()
}

// ---------------- 图表仪表盘 ----------------
const trendChartRef = ref(null)
const wordPieChartRef = ref(null)
let trendChartInstance = null
let wordPieChartInstance = null

const statsData = ref({
  todayCount: 0,
  topWords: [],
  trendTimes: [],
  trendCounts: []
})

const fetchStatsData = async () => {
  try {
    const res = await adminApi.getSensitiveStats()
    if (res.code === 200) {
      statsData.value = res.data
      renderCharts()
    }
  } catch (error) {
    console.error('获取审计统计数据失败', error)
  }
}

const renderCharts = () => {
  if (trendChartRef.value) {
    if (!trendChartInstance) trendChartInstance = echarts.init(trendChartRef.value)
    trendChartInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(20, 20, 25, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { 
          type: 'category', 
          boundaryGap: false, 
          data: statsData.value.trendTimes,
          axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
          axisLabel: { color: '#71717a' }
      },
      yAxis: { 
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
          axisLabel: { color: '#a1a1aa' }
      },
      series: [{ 
          name: '拦截次数', 
          type: 'line', 
          smooth: true, 
          data: statsData.value.trendCounts, 
          areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(239, 68, 68, 0.5)' },
                  { offset: 1, color: 'rgba(239, 68, 68, 0.01)' }
              ])
          },
          itemStyle: { color: '#ef4444' }
      }]
    })
  }

  if (wordPieChartRef.value) {
    if (!wordPieChartInstance) wordPieChartInstance = echarts.init(wordPieChartRef.value)
    wordPieChartInstance.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: 'rgba(20, 20, 25, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', textStyle: { color: '#fff' } },
      legend: { bottom: '0%', textStyle: { color: '#a1a1aa' } },
      series: [
        {
          name: '高频拦截词',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          itemStyle: { borderRadius: 10, borderColor: '#18181b', borderWidth: 2 },
          label: { show: false },
          data: statsData.value.topWords.length > 0 ? statsData.value.topWords : [
              { value: 0, name: '暂无数据', itemStyle: { color: '#71717a' } }
          ]
        }
      ]
    })
  }
}

const handleResize = () => {
  trendChartInstance?.resize()
  wordPieChartInstance?.resize()
}

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
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div class="flex items-center gap-3">
        <div class="header-icon bg-red-500/20 text-red-500 p-2 rounded-xl">
           <ShieldAlert :size="28" />
        </div>
        <div>
          <h1>敏感内容审计</h1>
          <p class="text-zinc-500">监控并管理系统检测到的敏感内容尝试</p>
        </div>
      </div>
    </header>

    <!-- 仪表盘图表区 -->
    <n-grid :cols="3" :x-gap="24" class="mb-6">
      <n-grid-item :span="2">
        <n-card class="main-card h-full" :bordered="false" title="24小时热点拦截趋势">
          <template #header-extra>
            <n-tag type="error" size="small" round bordered>今日累计拦截: {{ statsData.todayCount }} 次</n-tag>
          </template>
          <div ref="trendChartRef" style="height: 280px"></div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="main-card h-full" :bordered="false" title="高频违规词分布">
           <div ref="wordPieChartRef" style="height: 280px"></div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card class="main-card" :bordered="false">
      <n-tabs type="line" size="large" animated v-model:value="activeTab">
        
        <!-- Tab 1: 审计日志 -->
        <n-tab-pane name="logs" tab="拦截审计日志">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2 text-sm font-bold text-zinc-400">
               <AlertTriangle :size="16" class="text-amber-500" />
               当前共有 {{ total }} 条违规预警记录
            </div>
            <n-space>
               <n-popconfirm v-if="checkedRowKeys.length > 0" @positive-click="handleBatchDelete">
                   <template #trigger>
                       <n-button type="error" secondary>
                           <template #icon><n-icon :component="Trash" /></template>
                           批量删除 ({{ checkedRowKeys.length }})
                       </n-button>
                   </template>
                   确定要删除选中的 {{ checkedRowKeys.length }} 条记录吗？
               </n-popconfirm>

               <n-input
                 v-model:value="keyword"
                 placeholder="搜索用户名/内容/敏感词"
                 clearable
                 style="width: 250px"
                 @keyup.enter="() => { page = 1; fetchData() }"
               >
                 <template #prefix><n-icon :component="Search" /></template>
               </n-input>
               <n-button secondary @click="fetchData">
                 <template #icon><n-icon :component="RefreshCw" /></template>
               </n-button>
            </n-space>
          </div>

          <n-data-table
            :columns="columns"
            :data="list"
            :loading="loading"
            :bordered="false"
            striped
            remote
            size="large"
            :row-key="(row) => row.id"
            v-model:checked-row-keys="checkedRowKeys"
          />

          <div class="pagination-wrapper mt-6 flex justify-end">
            <n-pagination
              v-model:page="page"
              :item-count="total"
              :page-size="pageSize"
              @update:page="handlePageChange"
            />
          </div>
        </n-tab-pane>

        <!-- Tab 2: 敏感词库管理 -->
        <n-tab-pane name="dictionary" tab="敏感词库管理">
          <div class="flex items-center justify-between mb-4">
             <div class="flex gap-2">
                 <n-button type="primary" @click="showAddModal = true">
                     <template #icon><n-icon :component="Plus" /></template>
                     添加敏感词
                 </n-button>
                 <n-button type="warning" @click="handleReloadWords">
                     <template #icon><n-icon :component="DatabaseBackup" /></template>
                     重载内存词库
                 </n-button>
             </div>
             
             <n-space>
               <n-input
                 v-model:value="wordKeyword"
                 placeholder="搜索敏感词..."
                 clearable
                 style="width: 250px"
                 @keyup.enter="() => { wordPage = 1; fetchWords() }"
               >
                 <template #prefix><n-icon :component="Search" /></template>
               </n-input>
               <n-button secondary @click="fetchWords">
                 <template #icon><n-icon :component="RefreshCw" /></template>
               </n-button>
             </n-space>
          </div>

          <n-data-table
            :columns="wordColumns"
            :data="wordList"
            :loading="wordLoading"
            :bordered="false"
            striped
            remote
            size="large"
            :row-key="(row) => row.id"
          />

          <div class="pagination-wrapper mt-6 flex justify-end">
             <n-pagination
               v-model:page="wordPage"
               :item-count="wordTotal"
               :page-size="wordPageSize"
               @update:page="handleWordPageChange"
             />
          </div>
        </n-tab-pane>
        
      </n-tabs>
    </n-card>

    <!-- 新增敏感词弹窗 -->
    <n-modal v-model:show="showAddModal" preset="card" title="新增敏感词" style="width: 400px">
        <n-form>
            <n-form-item label="敏感词内容">
                <n-input v-model:value="newWord.word" placeholder="例如：暴力、赌博..." @keyup.enter="handleAddWord" />
            </n-form-item>
        </n-form>
        <template #footer>
            <n-space justify="end">
               <n-button @click="showAddModal = false">取消</n-button>
               <n-button type="primary" @click="handleAddWord">确认添加</n-button>
            </n-space>
        </template>
    </n-modal>
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.main-card {
  background: rgba(24, 24, 27, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

:deep(.n-data-table-th) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: #71717a !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.n-data-table-td) {
  background: transparent !important;
  color: #e4e4e7 !important;
}

:deep(.n-data-table .n-data-table-tr--striped .n-data-table-td) {
  background: rgba(255, 255, 255, 0.01) !important;
}

.header-icon {
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);
}
</style>
