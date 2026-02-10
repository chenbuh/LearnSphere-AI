<script setup>
import { ref, onMounted, h, onBeforeUnmount, nextTick, watch } from 'vue'
import { 
  NCard, NDataTable, NButton, NInput, NPagination, NTag, NPopconfirm, useMessage, 
  NSpace, NModal, NForm, NFormItem, NSelect, NDatePicker, NInputNumber,
  NDescriptions, NDescriptionsItem, NStatistic, NGrid, NGridItem, NDivider, NAvatar,
  NAlert, NBadge, NRadioGroup, NRadio, NEmpty, NTabs, NTabPane, NTimeline, NTimelineItem,
  NList, NListItem, NThing, NResult, NProgress
} from 'naive-ui'
import { 
  Search, Crown, UserX, UserCheck, Edit, KeyRound, FileText, 
  Activity, BookOpen, MessageSquare, TrendingUp, AlertTriangle 
} from 'lucide-vue-next'
import { adminApi } from '@/api/admin'
import * as XLSX from 'xlsx'
import * as echarts from 'echarts'

const message = useMessage()
const loading = ref(false)
const exportLoading = ref(false)
const users = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')

// Modal States
const showDetailModal = ref(false)
const showEditModal = ref(false)
const showPasswordModal = ref(false)

// Logic Data
const currentUser = ref({})
const userDetail = ref({})
const activeTab = ref('overview')
const userAILogs = ref([])
const aiLogLoading = ref(false)

const editForm = ref({
  id: null,
  nickname: '',
  email: '',
  phone: ''
})
const passwordForm = ref({
  id: null,
  password: ''
})

// VIP 设置弹窗
const showVipModal = ref(false)
const vipForm = ref({
  userId: null,
  username: '',
  vipLevel: 1,
  durationType: 'month', // month, quarter, year, custom
  duration: 1,
  customDate: null,
  dailyQuota: 50
})

// 监听 VIP 等级变化，自动填写推荐配额
const handleVipLevelChange = (val) => {
  if (val === 1) vipForm.value.dailyQuota = 50
  if (val === 2) vipForm.value.dailyQuota = 100
  if (val === 3) vipForm.value.dailyQuota = 200
}

const vipLevelOptions = [
  { label: '月度会员', value: 1 },
  { label: '季度会员', value: 2 },
  { label: '年度会员', value: 3 }
]

const durationTypeOptions = [
  { label: '按月设置', value: 'month' },
  { label: '按季度设置', value: 'quarter' },
  { label: '按年设置', value: 'year' },
  { label: '自定义日期', value: 'custom' }
]

// ==================== 批量操作 ====================
const selectedUserIds = ref([])
const showBatchVipModal = ref(false)
const showBatchNotifyModal = ref(false)

const batchVipForm = ref({
  vipLevel: 1,
  duration: 7, // 天数
  dailyQuota: 50
})

const batchNotifyForm = ref({
  title: '',
  content: '',
  type: 'system' // system, email, both
})

// ==================== 高级筛选 ====================
const showFilterModal = ref(false)
const filterConditions = ref([])
const filterLogic = ref('AND')

const addFilterCondition = () => {
  filterConditions.value.push({
    field: 'lastLoginTime',
    operator: 'lessThan',
    value: '30days'
  })
}

const removeFilterCondition = (index) => {
  filterConditions.value.splice(index, 1)
}

const applyFilter = async () => {
  if (filterConditions.value.length === 0) {
    message.warning('请至少添加一个筛选条件')
    return
  }
  
  loading.value = true
  try {
    const criteria = {
      conditions: filterConditions.value,
      logic: filterLogic.value
    }
    const res = await adminApi.filterUsers(criteria, page.value, pageSize.value)
    users.value = res.data.records
    total.value = res.data.total
    showFilterModal.value = false
    message.success('筛选成功')
  } catch (error) {
    message.error('筛选失败')
  } finally {
    loading.value = false
  }
}

const clearFilter = () => {
  filterConditions.value = []
  fetchUsers()
}

const filterFieldOptions = [
  { label: '最后登录时间', value: 'lastLoginTime' },
  { label: '积分', value: 'points' },
  { label: 'VIP状态', value: 'vipStatus' },
  { label: '学习记录数', value: 'learningCount' },
  { label: 'AI使用次数', value: 'aiUsageCount' }
]

const filterOperatorOptions = [
  { label: '等于', value: 'equals' },
  { label: '不等于', value: 'notEquals' },
  { label: '大于', value: 'greaterThan' },
  { label: '小于', value: 'lessThan' }
]

const columns = [
  { type: 'selection' },  // ← 添加复选框列
  { title: 'ID', key: 'id', width: 60 },
  { title: '用户名', key: 'username', width: 120 },
  { title: '昵称', key: 'nickname', width: 120 },
  { 
    title: 'VIP', 
    key: 'vipStatus',
    width: 100,
    render: (row) => {
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      return h(NTag, {
        type: isVip ? 'warning' : 'default',
        size: 'small',
        bordered: false
      }, { 
        default: () => isVip ? `VIP${row.vipLevel || ''}` : '普通',
        icon: isVip ? () => h(Crown, { size: 14 }) : undefined
      })
    }
  },
  {
    title: 'VIP 到期时间',
    key: 'vipExpireTime',
    width: 160,
    render: (row) => {
      if (!row.vipExpireTime) return '-'
      const expireDate = new Date(row.vipExpireTime)
      const isExpired = expireDate < new Date()
      return h('span', {
        style: { color: isExpired ? '#999' : '#18a058' }
      }, expireDate.toLocaleString('zh-CN'))
    }
  },
  {
    title: '每日配额',
    key: 'dailyAiQuota',
    width: 100,
    render: (row) => {
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      // 非 VIP 用户统一显示基础配额 5，VIP 用户显示实际分配额度
      if (!isVip) return h('span', { style: { color: '#999' } }, 5)
      return h('span', { style: { color: '#6366f1', fontWeight: 'bold' } }, row.dailyAiQuota || 0)
    }
  },
  { title: '邮箱', key: 'email', width: 180 },
  { 
    title: '状态', 
    key: 'status',
    width: 80,
    render: (row) => {
      return h(NTag, {
        type: row.status === 1 ? 'success' : 'error',
        size: 'small'
      }, { default: () => row.status === 1 ? '正常' : '禁用' })
    }
  },
  {
    title: '注册时间',
    key: 'createTime',
    width: 160,
    render: (row) => {
      return row.createTime ? new Date(row.createTime).toLocaleString('zh-CN') : '-'
    }
  },
  {
    key: 'actions',
    width: 320,
    fixed: 'right',
    render: (row) => {
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            type: 'info',
            secondary: true,
            onClick: () => openDetailModal(row)
          }, { default: () => '详情' }),

          h(NButton, {
            size: 'small',
            secondary: true,
            onClick: () => openEditModal(row)
          }, { default: () => '编辑' }),

          h(NButton, {
            size: 'small',
            type: 'warning',
            secondary: true,
            onClick: () => openVipModal(row)
          }, { default: () => h(Crown, { size: 14 }) }),
          
          h(NButton, {
            size: 'small',
            type: row.status === 1 ? 'error' : 'success',
            secondary: true,
            onClick: () => toggleStatus(row)
          }, { default: () => row.status === 1 ? '禁用' : '启用' }),
          
          h(NButton, {
            size: 'small',
            secondary: true,
            onClick: () => openPasswordModal(row)
          }, { default: () => h(KeyRound, { size: 14 }) })
        ]
      })
    }
  }
]

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUserList({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value
    })
    users.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchUsers()
}

const handlePageChange = (newPage) => {
  page.value = newPage
  fetchUsers()
}

// ==================== 批量操作处理函数 ====================

// 处理行选择
const handleCheck = (rowKeys) => {
  selectedUserIds.value = rowKeys
}

// 打开批量VIP赠送弹窗
const openBatchVipModal = () => {
  if (selectedUserIds.value.length === 0) {
    message.warning('请先选择用户')
    return
  }
  showBatchVipModal.value = true
}

// 执行批量VIP赠送
const handleBatchGrantVip = async () => {
  try {
    await adminApi.batchGrantVip({
      userIds: selectedUserIds.value,
      vipLevel: batchVipForm.value.vipLevel,
      duration: batchVipForm.value.duration,
      dailyQuota: batchVipForm.value.dailyQuota
    })
    message.success(`成功为 ${selectedUserIds.value.length} 位用户赠送VIP`)
    showBatchVipModal.value = false
    selectedUserIds.value = []
    fetchUsers()
  } catch (error) {
    message.error('批量赠送VIP失败')
  }
}

// 打开批量通知弹窗
const openBatchNotifyModal = () => {
  if (selectedUserIds.value.length === 0) {
    message.warning('请先选择用户')
    return
  }
  showBatchNotifyModal.value = true
}

// 执行批量发送通知
const handleBatchNotify = async () => {
  if (!batchNotifyForm.value.title || !batchNotifyForm.value.content) {
    message.warning('请填写标题和内容')
    return
  }
  
  try {
    await adminApi.batchNotify({
      userIds: selectedUserIds.value,
      title: batchNotifyForm.value.title,
      content: batchNotifyForm.value.content,
      type: batchNotifyForm.value.type
    })
    message.success(`成功向 ${selectedUserIds.value.length} 位用户发送通知`)
    showBatchNotifyModal.value = false
    selectedUserIds.value = []
    // 重置表单
    batchNotifyForm.value = { title: '', content: '', type: 'system' }
  } catch (error) {
    message.error('批量发送通知失败')
  }
}

const toggleStatus = async (row) => {
  try {
    const newStatus = row.status === 1 ? 0 : 1
    await adminApi.updateUserStatus(row.id, newStatus)
    message.success('状态更新成功')
    fetchUsers()
  } catch (error) {
    message.error('状态更新失败')
  }
}

const deleteUser = async (id) => {
  try {
    await adminApi.deleteUser(id)
    message.success('删除成功')
    fetchUsers()
  } catch (error) {
    message.error('删除失败')
  }
}

// 打开 VIP 设置弹窗
const openVipModal = (row) => {
  const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
  vipForm.value = {
    userId: row.id,
    username: row.username,
    vipLevel: row.vipLevel || 1,
    durationType: 'month',
    duration: 1,
    customDate: row.vipExpireTime ? new Date(row.vipExpireTime).getTime() : null,
    // 初始配额逻辑：如果是 VIP 则取原值，否则按月度默认 50
    dailyQuota: isVip ? (row.dailyAiQuota || 50) : 50
  }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showVipModal.value = true
}

// 提交 VIP 设置
const handleGrantVip = async () => {
  try {
    const data = {
      userId: vipForm.value.userId,
      vipLevel: vipForm.value.vipLevel,
      dailyQuota: vipForm.value.dailyQuota
    }

    // 根据类型计算 duration
    if (vipForm.value.durationType === 'custom') {
      // 自定义日期：计算当前时间到目标日期的天数，转换为月数
      if (!vipForm.value.customDate) {
        message.error('请选择 VIP 到期日期')
        return
      }
      const now = new Date()
      const target = new Date(vipForm.value.customDate)
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
      data.duration = Math.max(1, Math.ceil(diffDays / 30))
      data.vipLevel = 1 // 自定义日期使用月度会员级别
    } else {
      data.duration = vipForm.value.duration
    }

    await adminApi.grantVip(data)
    message.success('VIP 设置成功')
    showVipModal.value = false
    fetchUsers()
  } catch (error) {
    message.error(error.response?.data?.msg || 'VIP 设置失败')
  }
}

const handleRevokeVip = async (userId) => {
  try {
    await adminApi.revokeVip(userId)
    message.success('VIP 已取消')
    fetchUsers()
  } catch (error) {
    message.error('取消 VIP 失败')
  }
}

// 详情
const radarChartRef = ref(null)
const usageChartRef = ref(null)
let radarChart = null
let usageChart = null

const detailLoading = ref(false) // Add loading state

const openDetailModal = async (row) => {
  if (detailLoading.value) return // Prevent stacking clicks
  
  currentUser.value = row
  activeTab.value = 'overview'
  detailLoading.value = true
  
  try {
    try {
      // 1. Try Advanced Profile
      const res = await adminApi.getUserProfile(row.id)
      userDetail.value = res.data
    } catch (profileError) {
      console.warn('Advanced profile failed, falling back to basic details', profileError)
      // 2. Fallback to Basic Details
      const res = await adminApi.getUserDetails(row.id)
      const data = res.data
      
      // 3. Map Basic Data to Advanced Structure
      userDetail.value = {
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
      }
      message.warning('User 360 服务暂不可用，已切换至基础视图')
    }

    // Common Logic
    // 兼容旧版数据解构，防止报错
    if (!userDetail.value.statistics) userDetail.value.statistics = {}
    if (!userDetail.value.valueSegmentation) userDetail.value.valueSegmentation = {}
    
    // 获取 AI 日志 (Independently)
    fetchUserAILogs(row.id)

    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    showDetailModal.value = true
    
    // Initialize charts on next tick
    nextTick(() => {
      setTimeout(() => {
        initProfilingCharts()
      }, 300)
    })
    
  } catch (error) {
    console.error(error)
    message.error('获取用户详情失败')
  } finally {
    detailLoading.value = false
  }
}

// Watch tab changes to resize charts
watch(activeTab, (newTab) => {
  if (newTab === 'overview') {
    // 延迟执行，等待 Tab 切换动画完成，确保容器尺寸正确
    setTimeout(() => {
      initProfilingCharts()
    }, 150)
  }
})

const fetchUserAILogs = async (userId) => {
  aiLogLoading.value = true
  try {
    const res = await adminApi.getAILogs({ 
      userId: userId, 
      page: 1, 
      size: 50 // 获取最近50条
    })
    userAILogs.value = res.data.records
  } catch (error) {
    console.error('Fetch AI logs failed', error)
  } finally {
    aiLogLoading.value = false
  }
}

const initProfilingCharts = () => {
    if (radarChartRef.value) {
        if (radarChart) radarChart.dispose()
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
        if (usageChart) usageChart.dispose()
        usageChart = echarts.init(usageChartRef.value)
        const trend = userDetail.value.usageTrend || []
        usageChart.setOption({
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { left: 40, right: 20, bottom: 20, top: 20 },
            xAxis: { 
                type: 'category', 
                data: trend.map(d => d.date.slice(5)),
                axisLabel: { color: '#666', fontSize: 10 }
            },
            yAxis: { 
                type: 'value',
                min: 0,
                axisLabel: { color: '#666', fontSize: 10 },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
            },
            series: [{
                data: trend.map(d => d.value),
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

// 编辑
const openEditModal = (row) => {
  editForm.value = {
    id: row.id,
    nickname: row.nickname,
    email: row.email,
    phone: row.phone
  }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showEditModal.value = true
}

const handleUpdateProfile = async () => {
  try {
    await adminApi.updateUserProfile(editForm.value.id, editForm.value)
    message.success('用户信息更新成功')
    showEditModal.value = false
    fetchUsers()
  } catch (error) {
    message.error('更新失败')
  }
}

// 重置密码
const openPasswordModal = (row) => {
  passwordForm.value = {
    id: row.id,
    password: ''
  }
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showPasswordModal.value = true
}

const handleResetPassword = async () => {
  if (!passwordForm.value.password || passwordForm.value.password.length < 6) {
    message.error('密码至少6位')
    return
  }
  try {
    await adminApi.resetUserPassword(passwordForm.value.id, passwordForm.value.password)
    message.success('密码重置成功')
    showPasswordModal.value = false
  } catch (error) {
    message.error('重置失败')
  }
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    // Determine total pages or fetch a large size for export (or implement a backend export API)
    // For simplicity, we just fetch a larger page size or current viewed data.
    // Better: Fetch all data if possible using a special parameter or large size.
    const res = await adminApi.getUserList({
      page: 1,
      size: 10000, // Export up to 10000 users
      keyword: keyword.value
    })
    
    if (res.code === 200) {
      const exportData = res.data.records.map(user => {
        const isVip = user.vipExpireTime && new Date(user.vipExpireTime) > new Date()
        return {
          ID: user.id,
          用户名: user.username,
          昵称: user.nickname,
          邮箱: user.email,
          手机号: user.phone || '',
          身份: isVip ? `VIP${user.vipLevel || ''}` : '普通用户',
          VIP到期时间: user.vipExpireTime ? new Date(user.vipExpireTime).toLocaleString() : '',
          每日配额: isVip ? user.dailyAiQuota : 5,
          状态: user.status === 1 ? '正常' : '禁用',
          注册时间: user.createTime ? new Date(user.createTime).toLocaleString() : ''
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
      XLSX.writeFile(workbook, `User_Export_${new Date().toISOString().slice(0, 10)}.xlsx`)
      message.success('导出成功')
    }
  } catch (error) {
    console.error(error)
    message.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

onBeforeUnmount(() => {
  if (radarChart) {
    radarChart.dispose()
    radarChart = null
  }
  if (usageChart) {
    usageChart.dispose()
    usageChart = null
  }
})
</script>

<template>
  <div class="users-page">
    <header class="page-header">
      <div>
        <h1>用户管理</h1>
        <p>管理平台注册用户及 VIP 权限</p>
      </div>
    </header>

    <!-- 搜索栏 -->
    <n-card class="search-card">
      <n-space align="center" justify="space-between">
        <n-space align="center">
          <n-input
            v-model:value="keyword"
            placeholder="搜索用户名、邮箱、昵称"
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Search :size="16" />
            </template>
          </n-input>
          <n-button type="primary" @click="handleSearch">
            搜索
          </n-button>
          <n-button secondary @click="showFilterModal = true">
            高级筛选
          </n-button>
          <n-button v-if="filterConditions.length > 0" text type="error" @click="clearFilter">
            清除筛选 ({{ filterConditions.length }})
          </n-button>
        </n-space>
        
        <n-space align="center">
          <n-badge :value="selectedUserIds.length" :show="selectedUserIds.length > 0">
            <n-button secondary type="warning" @click="openBatchVipModal">
              <template #icon><Crown :size="16" /></template>
              批量赠送VIP
            </n-button>
          </n-badge>
          <n-badge :value="selectedUserIds.length" :show="selectedUserIds.length > 0">
            <n-button secondary type="info" @click="openBatchNotifyModal">
              批量发送通知
            </n-button>
          </n-badge>
          <n-button secondary type="primary" @click="handleExport" :loading="exportLoading">
            <template #icon><FileText :size="16" /></template>
            导出 Excel
          </n-button>
        </n-space>
      </n-space>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="table-card">
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :bordered="false"
        :single-line="false"
        :scroll-x="1400"
        :row-key="row => row.id"
        v-model:checked-row-keys="selectedUserIds"
        @update:checked-row-keys="handleCheck"
      />
      
      <div class="pagination">
        <n-pagination
          v-model:page="page"
          :page-count="Math.ceil(total / pageSize)"
          :page-size="pageSize"
          show-size-picker
          :page-sizes="[10, 20, 30, 50]"
          @update:page="handlePageChange"
          @update:page-size="(size) => { pageSize = size; fetchUsers() }"
        />
      </div>
    </n-card>

    <!-- VIP 设置弹窗 -->
    <n-modal
      v-model:show="showVipModal"
      preset="card"
      title="VIP 设置"
      style="width: 600px"
      :bordered="false"
      :segmented="{ content: 'soft', footer: 'soft' }"
    >
      <n-form :model="vipForm" label-placement="left" label-width="120">
        <n-form-item label="用户">
          <n-input :value="vipForm.username" disabled />
        </n-form-item>

        <n-form-item label="VIP 等级">
          <n-select
            v-model:value="vipForm.vipLevel"
            :options="vipLevelOptions"
            :disabled="vipForm.durationType === 'custom'"
            @update:value="handleVipLevelChange"
          />
        </n-form-item>

        <n-form-item label="设置方式">
          <n-select
            v-model:value="vipForm.durationType"
            :options="durationTypeOptions"
          />
        </n-form-item>

        <n-form-item v-if="vipForm.durationType !== 'custom'" label="时长">
          <n-input-number
            v-model:value="vipForm.duration"
            :min="1"
            :max="100"
            style="width: 100%"
          >
            <template #suffix>
              {{ vipForm.durationType === 'month' ? '个月' : vipForm.durationType === 'quarter' ? '个季度' : '年' }}
            </template>
          </n-input-number>
        </n-form-item>

        <n-form-item v-else label="到期日期">
          <n-date-picker
            v-model:value="vipForm.customDate"
            type="datetime"
            clearable
            style="width: 100%"
            :is-date-disabled="(ts) => ts < Date.now()"
          />
        </n-form-item>

        <n-form-item label="每日 AI 配额">
          <n-input-number
            v-model:value="vipForm.dailyQuota"
            :min="0"
            :max="10000"
            style="width: 100%"
          >
            <template #suffix>次/天</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="说明">
          <div style="color: #999; font-size: 12px; line-height: 1.6">
            <p>• 月度会员：推荐配额 50 点/日</p>
            <p>• 季度会员：推荐配额 100 点/日</p>
            <p>• 年度会员：推荐配额 200 点/日</p>
            <p>• 自定义日期：精确指定 VIP 到期时间</p>
            <p>• 每日配额：VIP 用户每天可调用的 AI 能量值（Units）</p>
          </div>
        </n-form-item>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showVipModal = false">取消</n-button>
          <n-button type="primary" @click="handleGrantVip">确定</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 360用户详情弹窗 -->
    <n-modal 
      v-model:show="showDetailModal" 
      preset="card" 
      title="User 360 - 精细化用户画像" 
      style="width: 900px; height: 85vh"
      :content-style="{ padding: 0, overflowY: 'auto' }"
    >
      <!-- 头部：不再固定，随页面滚动 -->
      <div class="user-profile-header p-6 bg-black/10">
        <div class="flex items-center gap-6">
          <n-avatar round :size="80" :src="userDetail.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (userDetail.user?.username || 'user')" />
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-2xl font-bold text-white mb-0">{{ userDetail.user?.nickname || userDetail.user?.username }}</h2>
              <n-tag :bordered="false" type="info" round size="small">
                <template #icon><Crown v-if="userDetail.vip" :size="12" /></template>
                {{ userDetail.vip ? 'VIP会员' : '普通用户' }}
              </n-tag>
              <!-- 价值分层标签 -->
              <n-tag v-if="userDetail.valueSegmentation?.segment" :bordered="false" :type="userDetail.riskLevel === 'HIGH' ? 'error' : 'warning'" round size="small">
                {{ userDetail.valueSegmentation.segment }}
              </n-tag>
            </div>
            <div class="flex items-center gap-4 text-zinc-400 text-sm">
              <span>ID: {{ userDetail.user?.id }}</span>
              <span>|</span>
              <span>注册于: {{ userDetail.user?.createTime ? new Date(userDetail.user.createTime).toLocaleDateString() : '-' }}</span>
              <span>|</span>
              <span class="flex items-center gap-1">
                <Activity :size="14" />
                LTV预估: {{ userDetail.valueSegmentation?.ltv || 0 }}
              </span>
            </div>
          </div>
          <!-- 风险指示器 -->
          <div v-if="userDetail.riskLevel === 'HIGH'" class="flex flex-col items-end text-red-400">
            <AlertTriangle :size="24" />
            <span class="text-xs font-bold mt-1">高风险用户</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col">
        <n-tabs type="line" animated class="w-full" pane-class="p-6" v-model:value="activeTab">
          
          <!-- Tab 1: 概览 -->
          <n-tab-pane name="overview" tab="全景概览" display-directive="show">
            <!-- 核心指标卡 -->
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

            <!-- 图表区 -->
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

          <!-- Tab 2: 学习轨迹 -->
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
                  <template #icon v-if="activity.type === 'vocabulary'"><BookOpen :size="14"/></template>
                </n-timeline-item>
              </n-timeline>
            </template>
            <n-empty v-else description="暂无近期学习记录" />
          </n-tab-pane>

          <!-- Tab 3: AI 对话日志 -->
          <n-tab-pane name="ai-logs" tab="AI 对话日志">
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
          </n-tab-pane>

          <!-- Tab 4: 价值分析 -->
          <n-tab-pane name="value" tab="价值与流失分析">
            <n-alert v-if="userDetail.valueSegmentation?.churnRisk > 70" type="error" title="高流失风险" class="mb-4">
              该用户流失风险较高，建议立即采取干预措施（如推送优惠券或关怀短信）。
            </n-alert>
            
            <n-grid :cols="2" :x-gap="20" :y-gap="20">
              <n-grid-item>
                <n-card title="互动评分" size="small" embedded>
                   <div class="flex items-center justify-center p-4">
                      <n-progress type="dashboard" :percentage="userDetail.valueSegmentation?.engagementScore || 0" :color="userDetail.valueSegmentation?.engagementScore > 60 ? '#10b981' : '#f59e0b'" />
                   </div>
                   <p class="text-center text-xs text-gray-500">基于学习频率、时长、AI交互综合计算</p>
                </n-card>
              </n-grid-item>
              <n-grid-item>
                <n-card title="分层归因" size="small" embedded>
                   <n-list>
                      <n-list-item v-for="(reason, idx) in userDetail.valueSegmentation?.reasons" :key="idx">
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
               <!-- 运营干预按钮 (Mock) -->
               <n-button secondary type="info">发送站内信</n-button>
               <n-button secondary type="warning">赠送 VIP 体验卡</n-button>
            </n-space>
          </n-tab-pane>

        </n-tabs>
      </div>
    </n-modal>

    <!-- 编辑弹窗 -->
    <n-modal v-model:show="showEditModal" preset="card" title="编辑资料" style="width: 500px">
      <n-form>
        <n-form-item label="昵称">
          <n-input v-model:value="editForm.nickname" />
        </n-form-item>
        <n-form-item label="邮箱">
          <n-input v-model:value="editForm.email" />
        </n-form-item>
        <n-form-item label="手机号">
          <n-input v-model:value="editForm.phone" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showEditModal = false">取消</n-button>
          <n-button type="primary" @click="handleUpdateProfile">保存</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 重置密码弹窗 -->
    <n-modal v-model:show="showPasswordModal" preset="card" title="重置密码" style="width: 400px">
      <n-form>
        <n-form-item label="新密码">
          <n-input 
            v-model:value="passwordForm.password" 
            type="password" 
            show-password-on="click" 
            placeholder="请输入新密码（至少6位）"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPasswordModal = false">取消</n-button>
          <n-button type="error" @click="handleResetPassword">确认重置</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量赠送VIP弹窗 -->
    <n-modal v-model:show="showBatchVipModal" preset="card" title="批量赠送VIP" style="width: 550px">
      <n-alert type="info" :bordered="false" style="margin-bottom: 16px">
        已选择 <strong>{{ selectedUserIds.length }}</strong> 位用户
      </n-alert>
      <n-form label-placement="left" label-width="100">
        <n-form-item label="VIP等级">
          <n-select v-model:value="batchVipForm.vipLevel" :options="vipLevelOptions" />
        </n-form-item>
        <n-form-item label="时长（天）">
          <n-input-number v-model:value="batchVipForm.duration" :min="1" :max="365" style="width: 100%" />
        </n-form-item>
        <n-form-item label="每日AI配额">
          <n-input-number v-model:value="batchVipForm.dailyQuota" :min="0" :max="1000" style="width: 100%" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchVipModal = false">取消</n-button>
          <n-button type="warning" @click="handleBatchGrantVip">确认赠送</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 批量发送通知弹窗 -->
    <n-modal v-model:show="showBatchNotifyModal" preset="card" title="批量发送通知" style="width: 650px">
      <n-alert type="info" :bordered="false" style="margin-bottom: 16px">
        已选择 <strong>{{ selectedUserIds.length }}</strong> 位用户
      </n-alert>
      <n-form label-placement="left" label-width="100">
        <n-form-item label="通知类型">
          <n-select v-model:value="batchNotifyForm.type" :options="[
            { label: '站内信', value: 'system' },
            { label: '邮件', value: 'email' },
            { label: '站内信+邮件', value: 'both' }
          ]" />
        </n-form-item>
        <n-form-item label="标题">
          <n-input v-model:value="batchNotifyForm.title" placeholder="请输入通知标题" />
        </n-form-item>
        <n-form-item label="内容">
          <n-input
            v-model:value="batchNotifyForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入通知内容"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showBatchNotifyModal = false">取消</n-button>
          <n-button type="info" @click="handleBatchNotify">发送通知</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- 高级筛选弹窗 -->
    <n-modal v-model:show="showFilterModal" preset="card" title="高级筛选" style="width: 700px">
      <div style="margin-bottom: 16px">
        <n-space align="center" justify="space-between">
          <n-radio-group v-model:value="filterLogic">
            <n-radio value="AND">满足所有条件(AND)</n-radio>
            <n-radio value="OR">满足任一条件(OR)</n-radio>
          </n-radio-group>
          <n-button secondary type="primary" @click="addFilterCondition">
            + 添加条件
          </n-button>
        </n-space>
      </div>

      <n-space vertical style="width: 100%">
        <n-card
          v-for="(condition, index) in filterConditions"
          :key="index"
          size="small"
          :bordered="false"
          embedded
        >
          <n-space align="center">
            <n-select
              v-model:value="condition.field"
              :options="filterFieldOptions"
              style="width: 150px"
              placeholder="选择字段"
            />
            <n-select
              v-model:value="condition.operator"
              :options="filterOperatorOptions"
              style="width: 120px"
              placeholder="操作符"
            />
            <n-input
              v-model:value="condition.value"
              placeholder="值(如30days)"
              style="flex: 1"
            />
            <n-button text type="error" @click="removeFilterCondition(index)">
              删除
            </n-button>
          </n-space>
        </n-card>

        <n-empty v-if="filterConditions.length === 0" description="暂无筛选条件" />
      </n-space>

      <template #footer>
        <n-space justify="end">
          <n-button @click="showFilterModal = false">取消</n-button>
          <n-button type="primary" @click="applyFilter">应用筛选</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<style scoped>
.users-page {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}

.page-header p {
  color: #71717a;
  font-size: 0.95rem;
}

.search-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  margin-bottom: 24px;
}

.table-card {
  background: rgba(20, 20, 25, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

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

.stat-inner-card {
  background: rgba(255,255,255,0.02) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
  border-radius: 12px;
}

.profile-section {
  background: rgba(0,0,0,0.2);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.05);
}

.section-title {
  font-size: 0.9rem;
  color: #a1a1aa;
  margin-bottom: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
