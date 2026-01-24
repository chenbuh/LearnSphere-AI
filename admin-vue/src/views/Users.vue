<script setup>
import { ref, onMounted, h, onBeforeUnmount } from 'vue'
import { 
  NCard, NDataTable, NButton, NInput, NPagination, NTag, NPopconfirm, useMessage, 
  NSpace, NModal, NForm, NFormItem, NSelect, NDatePicker, NInputNumber,
  NDescriptions, NDescriptionsItem, NStatistic, NGrid, NGridItem, NDivider, NAvatar
} from 'naive-ui'
import { Search, Crown, UserX, UserCheck, Edit, KeyRound, FileText } from 'lucide-vue-next'
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

const columns = [
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

const openDetailModal = async (row) => {
  currentUser.value = row
  try {
    const res = await adminApi.getUserDetails(row.id)
    userDetail.value = res.data
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    showDetailModal.value = true
    
    // Initialize charts on next tick
    setTimeout(() => {
      initProfilingCharts()
    }, 200)
  } catch (error) {
    message.error('获取详情失败')
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
        <n-button secondary type="primary" @click="handleExport" :loading="exportLoading">
          <template #icon><FileText :size="16" /></template>
          导出 Excel
        </n-button>
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

    <!-- 详情弹窗 -->
    <n-modal v-model:show="showDetailModal" preset="card" title="用户画像与详情" style="width: 850px">
      <div class="user-profile-header mb-6">
        <div class="flex items-center gap-4">
          <n-avatar round :size="80" :src="userDetail.user?.avatar" />
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h2 class="text-2xl font-bold text-white mb-0">{{ userDetail.user?.nickname }}</h2>
              <n-tag :bordered="false" type="info" size="small">{{ userDetail.userTag || '普通学员' }}</n-tag>
              <n-tag v-if="userDetail.riskLevel === 'HIGH'" :bordered="false" type="error" size="small">高风险</n-tag>
            </div>
            <p class="text-zinc-500 text-sm">UID: {{ userDetail.user?.id }} | @{{ userDetail.user?.username }}</p>
          </div>
        </div>
      </div>

      <n-grid :cols="4" :x-gap="12" style="margin-bottom: 24px">
        <n-grid-item>
          <n-card embedded size="small" class="stat-inner-card">
            <n-statistic label="累计学习" :value="userDetail.totalWordsLearned || 0">
               <template #suffix><span class="text-xs opacity-50">记录</span></template>
            </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card embedded size="small" class="stat-inner-card">
             <n-statistic label="AI 调用" :value="userDetail.totalAiUsage || 0">
               <template #suffix><span class="text-xs opacity-50">次</span></template>
             </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card embedded size="small" class="stat-inner-card">
             <n-statistic label="签到天数" :value="userDetail.totalCheckins || 0">
               <template #suffix><span class="text-xs opacity-50">天</span></template>
             </n-statistic>
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card embedded size="small" class="stat-inner-card">
            <n-statistic label="VIP 状态" :value="userDetail.vip ? '会员' : '普通'">
               <template #suffix><Crown v-if="userDetail.vip" :size="16" class="text-yellow-500" /></template>
            </n-statistic>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-grid :cols="2" :x-gap="20" class="mb-6">
        <n-grid-item>
          <div class="profile-section">
            <h4 class="section-title">能力雷达图 (基于学习表现)</h4>
            <div ref="radarChartRef" style="height: 250px"></div>
          </div>
        </n-grid-item>
        <n-grid-item>
          <div class="profile-section">
            <h4 class="section-title">AI Token 消耗趋势 (7D)</h4>
            <div ref="usageChartRef" style="height: 250px"></div>
          </div>
        </n-grid-item>
      </n-grid>
      
      <n-divider title-placement="left">账号基本信息</n-divider>
      <n-descriptions bordered :column="2" size="small">
        <n-descriptions-item label="用户名">{{ userDetail.user?.username }}</n-descriptions-item>
        <n-descriptions-item label="邮箱">{{ userDetail.user?.email || '-' }}</n-descriptions-item>
        <n-descriptions-item label="VIP 到期">{{ userDetail.vipExpireTime ? new Date(userDetail.vipExpireTime).toLocaleString() : '-' }}</n-descriptions-item>
        <n-descriptions-item label="注册时间">{{ userDetail.user?.createTime ? new Date(userDetail.user.createTime).toLocaleString() : '-' }}</n-descriptions-item>
        <n-descriptions-item label="最后更新">{{ userDetail.user?.updateTime ? new Date(userDetail.user.updateTime).toLocaleString() : '-' }}</n-descriptions-item>
        <n-descriptions-item label="数据风险等级">
          <n-tag :type="userDetail.riskLevel === 'HIGH' ? 'error' : 'success'" size="small">
            {{ userDetail.riskLevel || 'LOW' }}
          </n-tag>
        </n-descriptions-item>
      </n-descriptions>
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
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
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
