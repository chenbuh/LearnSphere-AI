<template>
  <div class="user-logs-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1>📊 用户操作日志</h1>
      <p>实时监控用户行为，查看IP地址、设备信息和操作统计</p>
    </div>

    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="20" class="mb-6">
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            📝
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalLogs || 0 }}</div>
            <div class="stat-label">总日志数</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            🌍
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ uniqueIps }}</div>
            <div class="stat-label">独立IP数</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            👥
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activeUsers }}</div>
            <div class="stat-label">活跃用户</div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="stat-card" :bordered="false">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            📱
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ mobileRate }}%</div>
            <div class="stat-label">移动端占比</div>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <!-- 图表统计 -->
    <n-card title="📈 数据可视化" class="mb-6" :bordered="false">
      <n-grid :cols="2" :x-gap="20">
        <n-grid-item>
          <div class="chart-container">
            <h3>操作类型分布</h3>
            <div ref="actionChartRef" style="height: 300px;"></div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="chart-container">
            <h3>地区分布 TOP 10</h3>
            <div ref="provinceChartRef" style="height: 300px;"></div>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 筛选和操作栏 -->
    <n-card :bordered="false" class="mb-4">
      <n-space justify="space-between">
        <n-space>
          <n-input
            v-model:value="filters.username"
            placeholder="搜索用户名"
            clearable
            style="width: 180px;"
            @keyup.enter="loadLogs"
          />
          <n-select
            v-model:value="filters.module"
            placeholder="选择模块"
            clearable
            style="width: 150px;"
            :options="moduleOptions"
            @update:value="loadLogs"
          />
          <n-select
            v-model:value="filters.action"
            placeholder="选择操作"
            clearable
            style="width: 150px;"
            :options="actionOptions"
            @update:value="loadLogs"
          />
          <n-input
            v-model:value="filters.ip"
            placeholder="搜索IP"
            clearable
            style="width: 150px;"
            @keyup.enter="loadLogs"
          />
          <n-select
            v-model:value="filters.status"
            placeholder="状态"
            clearable
            style="width: 120px;"
            :options="statusOptions"
            @update:value="loadLogs"
          />
          <n-button type="primary" @click="loadLogs">
            <template #icon>
              <n-icon><Search /></n-icon>
            </template>
            查询
          </n-button>
        </n-space>
        <n-space>
          <n-button @click="refresh">
            <template #icon>
              <n-icon><RotateCcw /></n-icon>
            </template>
            刷新
          </n-button>
          <n-popconfirm @positive-click="clearAll">
            <template #trigger>
              <n-button type="error" ghost>
                <template #icon>
                  <n-icon><Trash2 /></n-icon>
                </template>
                清空日志
              </n-button>
            </template>
            确定要清空所有日志吗？此操作不可恢复！
          </n-popconfirm>
        </n-space>
      </n-space>
    </n-card>

    <!-- 日志表格 -->
    <n-card :bordered="false">
      <n-data-table
        ref="table"
        :columns="columns"
        :data="logs"
        :loading="loading"
        :pagination="pagination"
        :row-key="row => row.id"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- 日志详情弹窗 -->
    <n-modal
      v-model:show="showDetail"
      preset="card"
      title="日志详情"
      style="width: 800px;"
      :bordered="false"
    >
      <n-descriptions v-if="currentLog" :column="2" bordered>
        <n-descriptions-item label="用户ID">{{ currentLog.userId }}</n-descriptions-item>
        <n-descriptions-item label="用户名">{{ currentLog.username || '-' }}</n-descriptions-item>
        <n-descriptions-item label="操作模块">
          <n-tag type="info">{{ currentLog.module || '-' }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="操作类型">
          <n-tag type="success">{{ currentLog.action || '-' }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="操作详情" :span="2">
          {{ currentLog.details || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="IP地址">
          <n-text code>{{ currentLog.ip || '-' }}</n-text>
        </n-descriptions-item>
        <n-descriptions-item label="地理位置">
          {{ currentLog.ipProvince || '-' }} {{ currentLog.ipCity || '-' }}
        </n-descriptions-item>
        <n-descriptions-item label="浏览器">{{ currentLog.browser || '-' }}</n-descriptions-item>
        <n-descriptions-item label="操作系统">{{ currentLog.os || '-' }}</n-descriptions-item>
        <n-descriptions-item label="设备类型">
          <n-tag v-if="currentLog.deviceType === 'Mobile'" type="warning">移动端</n-tag>
          <n-tag v-else-if="currentLog.deviceType === 'Tablet'" type="info">平板</n-tag>
          <n-tag v-else type="default">桌面端</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="状态">
          <n-tag v-if="currentLog.status === 1" type="success">成功</n-tag>
          <n-tag v-else type="error">失败</n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="请求URL" :span="2">
          <n-text code>{{ currentLog.requestUrl || '-' }}</n-text>
        </n-descriptions-item>
        <n-descriptions-item label="请求方法">{{ currentLog.requestMethod || '-' }}</n-descriptions-item>
        <n-descriptions-item label="操作时间">
          {{ currentLog.createTime ? new Date(currentLog.createTime).toLocaleString('zh-CN') : '-' }}
        </n-descriptions-item>
        <n-descriptions-item v-if="currentLog.errorMsg" label="错误信息" :span="2">
          <n-text type="error">{{ currentLog.errorMsg }}</n-text>
        </n-descriptions-item>
      </n-descriptions>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h, computed } from 'vue'
import { 
  NButton, NTag, NIcon, NPopconfirm, useMessage, 
  NCard, NGrid, NGridItem, NInput, NSelect, NSpace, 
  NDataTable, NModal, NDescriptions, NDescriptionsItem, NText 
} from 'naive-ui'
import { Search, RotateCcw, Trash2, Eye } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as echarts from 'echarts'

const message = useMessage()

// 数据
const logs = ref([])
const loading = ref(false)
const stats = ref({})
const showDetail = ref(false)
const currentLog = ref(null)

// 图表引用
const actionChartRef = ref(null)
const provinceChartRef = ref(null)
let actionChart = null
let provinceChart = null

// 筛选条件
const filters = reactive({
  username: '',
  module: null,
  action: null,
  ip: '',
  status: null
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  itemCount: 0
})

// 选项
const moduleOptions = [
  { label: '阅读', value: 'reading' },
  { label: '听力', value: 'listening' },
  { label: '写作', value: 'writing' },
  { label: '口语', value: 'speaking' },
  { label: '语法', value: 'grammar' },
  { label: '词汇', value: 'vocabulary' },
  { label: '模拟考试', value: 'exam' },
  { label: '登录', value: 'auth' }
]

const actionOptions = [
  { label: '登录', value: 'login' },
  { label: '登出', value: 'logout' },
  { label: '提交', value: 'submit' },
  { label: '查看', value: 'view' },
  { label: '分享', value: 'share' },
  { label: '生成', value: 'generate' }
]

const statusOptions = [
  { label: '成功', value: 1 },
  { label: '失败', value: 0 }
]

// 计算属性
const uniqueIps = computed(() => {
  if (!logs.value || logs.value.length === 0) return 0
  const ips = new Set()
  logs.value.forEach(log => {
    if (log.ip) ips.add(log.ip)
  })
  return ips.size
})

const activeUsers = computed(() => {
  if (!logs.value || logs.value.length === 0) return 0
  const users = new Set()
  logs.value.forEach(log => {
    if (log.userId) users.add(log.userId)
  })
  return users.size
})

const mobileRate = computed(() => {
  if (!logs.value || logs.value.length === 0) return 0
  const mobileCount = logs.value.filter(log => log.deviceType === 'Mobile').length
  return Math.round((mobileCount / logs.value.length) * 100)
})

// 表格列
const columns = [
  { title: 'ID', key: 'id', width: 80 },
  {
    title: '用户',
    key: 'username',
    width: 120,
    render: row => h('span', { style: { fontWeight: '500' } }, row.username || '-')
  },
  {
    title: '模块',
    key: 'module',
    width: 100,
    render: row => h(NTag, { type: 'info', size: 'small' }, { default: () => row.module || '-' })
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
    render: row => h(NTag, { type: 'success', size: 'small' }, { default: () => row.action || '-' })
  },
  {
    title: 'IP地址',
    key: 'ip',
    width: 140,
    render: row => h('code', row.ip || '-')
  },
  {
    title: '地理位置',
    key: 'location',
    width: 150,
    render: row => {
      const location = [row.ipProvince, row.ipCity].filter(Boolean).join(' ')
      return h('span', location || '-')
    }
  },
  {
    title: '设备',
    key: 'deviceType',
    width: 100,
    render: row => {
      if (row.deviceType === 'Mobile') {
        return h(NTag, { type: 'warning', size: 'small' }, { default: () => '移动端' })
      } else if (row.deviceType === 'Tablet') {
        return h(NTag, { type: 'info', size: 'small' }, { default: () => '平板' })
      } else {
        return h(NTag, { size: 'small' }, { default: () => '桌面' })
      }
    }
  },
  {
    title: '浏览器',
    key: 'browser',
    width: 100,
    render: row => h('span', row.browser || '-')
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    render: row => {
      return row.status === 1
        ? h(NTag, { type: 'success', size: 'small' }, { default: () => '成功' })
        : h(NTag, { type: 'error', size: 'small' }, { default: () => '失败' })
    }
  },
  {
    title: '时间',
    key: 'createTime',
    width: 160,
    render: row => h('span', row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-')
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render: row => h(
      NButton,
      {
        size: 'small',
        onClick: () => viewDetail(row)
      },
      {
        icon: () => h(NIcon, null, { default: () => h(Eye) }),
        default: () => '详情'
      }
    )
  }
]

// 方法
const loadLogs = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUserLogs({
      page: pagination.page,
      size: pagination.pageSize,
      ...filters
    })
    if (res.code === 200) {
      logs.value = res.data.records || []
      pagination.itemCount = res.data.total || 0
    }
  } catch (error) {
    message.error('加载日志失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const res = await adminApi.getUserLogStats()
    if (res.code === 200) {
      stats.value = res.data
      renderCharts()
    }
  } catch (error) {
    console.error('加载统计数据失败', error)
  }
}

const renderCharts = async () => {
  try {
    // 操作类型图表
    const actionRes = await adminApi.getUserLogActionStats()
    if (actionRes.code === 200 && actionChartRef.value) {
      if (!actionChart) {
        actionChart = echarts.init(actionChartRef.value)
      }
      actionChart.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '70%',
          data: actionRes.data.map(item => ({
            name: item.action,
            value: item.count
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      })
    }

    // 地区分布图表
    const provinceRes = await adminApi.getUserLogProvinceStats()
    if (provinceRes.code === 200 && provinceChartRef.value) {
      if (!provinceChart) {
        provinceChart = echarts.init(provinceChartRef.value)
      }
      provinceChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: {
          type: 'category',
          data: provinceRes.data.map(item => item.province),
          axisLabel: { rotate: 45 }
        },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: provinceRes.data.map(item => item.count),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }]
      })
    }
  } catch (error) {
    console.error('渲染图表失败', error)
  }
}

const viewDetail = (log) => {
  currentLog.value = log
  showDetail.value = true
}

const refresh = () => {
  loadLogs()
  loadStats()
}

const clearAll = async () => {
  try {
    const res = await adminApi.clearAllUserLogs()
    if (res.code === 200) {
      message.success('清空成功')
      refresh()
    }
  } catch (error) {
    message.error('清空失败')
  }
}

const handlePageChange = (page) => {
  pagination.page = page
  loadLogs()
}

const handlePageSizeChange = (pageSize) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadLogs()
}

onMounted(() => {
  loadLogs()
  loadStats()
})
</script>

<style scoped>
.user-logs-view {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header p {
  color: #999;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #999;
}

.chart-container {
  padding: 16px;
}

.chart-container h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

:global(.dark-mode) .chart-container h3 {
  color: #fff;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}
</style>
