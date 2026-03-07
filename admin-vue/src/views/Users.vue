<script setup>
import { ref, onMounted, h, defineAsyncComponent } from 'vue'
import {
  NBadge, NCard, NDataTable, NButton, NInput, NPagination, NTag, useMessage, NSpace
} from 'naive-ui'
import { Search, Crown, KeyRound, FileText } from 'lucide-vue-next'
import { adminApi } from '@/api/admin'

const UserDetailModal = defineAsyncComponent(() => import('@/components/UserDetailModal.vue'))
const UserVipModal = defineAsyncComponent(() => import('@/components/UserVipModal.vue'))
const UserProfileEditModal = defineAsyncComponent(() => import('@/components/UserProfileEditModal.vue'))
const UserPasswordResetModal = defineAsyncComponent(() => import('@/components/UserPasswordResetModal.vue'))
const UserBatchVipModal = defineAsyncComponent(() => import('@/components/UserBatchVipModal.vue'))
const UserBatchNotifyModal = defineAsyncComponent(() => import('@/components/UserBatchNotifyModal.vue'))
const UserAdvancedFilterModal = defineAsyncComponent(() => import('@/components/UserAdvancedFilterModal.vue'))

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

// VIP 设置弹窗
const showVipModal = ref(false)

// ==================== 批量操作 ====================
const selectedUserIds = ref([])
const showBatchVipModal = ref(false)
const showBatchNotifyModal = ref(false)

// ==================== 高级筛选 ====================
const showFilterModal = ref(false)
const activeFilterCount = ref(0)

const clearFilter = () => {
  activeFilterCount.value = 0
  fetchUsers()
}

let xlsxLoader = null
const loadXlsx = async () => {
  if (!xlsxLoader) {
    xlsxLoader = import('xlsx')
  }

  return xlsxLoader
}

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
    title: '生成配额',
    key: 'dailyAiQuota',
    width: 100,
    render: (row) => {
      // 1. 优先显示账户级独立配额
      if (row.dailyAiQuota !== null && row.dailyAiQuota !== undefined) {
        return h('span', { style: { color: '#6366f1', fontWeight: 'bold' } }, row.dailyAiQuota)
      }
      
      // 2. 否则根据 VIP 状态显示默认值 (这里简化显示，实际以切面逻辑为准)
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      if (!isVip) return h('span', { style: { color: '#999' } }, 5)
      
      // VIP 但没设独立配额，显示对应等级的基准（这里硬编码推荐值供参考）
      const recommend = row.vipLevel === 1 ? 50 : row.vipLevel === 2 ? 100 : 200
      return h('span', { style: { color: '#f59e0b' } }, recommend)
    }
  },
  {
    title: '助教配额',
    key: 'dailyTutorQuota',
    width: 100,
    render: (row) => {
      // 1. 优先显示账户级独立配额
      if (row.dailyTutorQuota !== null && row.dailyTutorQuota !== undefined) {
        return h('span', { style: { color: '#ec4899', fontWeight: 'bold' } }, row.dailyTutorQuota)
      }
      
      // 2. 否则根据 VIP 状态显示默认值
      const isVip = row.vipExpireTime && new Date(row.vipExpireTime) > new Date()
      if (!isVip) return h('span', { style: { color: '#999' } }, 200)
      
      // VIP 默认值
      const recommend = row.vipLevel === 1 ? 400 : row.vipLevel === 2 ? 800 : 1500
      return h('span', { style: { color: '#f472b6' } }, recommend)
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

// 打开批量通知弹窗
const openBatchNotifyModal = () => {
  if (selectedUserIds.value.length === 0) {
    message.warning('请先选择用户')
    return
  }
  showBatchNotifyModal.value = true
}

const toggleStatus = async (row) => {  try {
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
  currentUser.value = row
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showVipModal.value = true
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
const openDetailModal = (row) => {
  currentUser.value = row

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  showDetailModal.value = true
}

// 编辑
const openEditModal = (row) => {
  currentUser.value = row
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showEditModal.value = true
}

// 重置密码
const openPasswordModal = (row) => {
  currentUser.value = row
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  showPasswordModal.value = true
}

const handleUserUpdated = () => {
  fetchUsers()
}

const handleBatchVipUpdated = () => {
  selectedUserIds.value = []
  fetchUsers()
}

const handleBatchNotifyUpdated = () => {
  selectedUserIds.value = []
}

const handleFilterApplied = ({ records, total: filteredTotal, criteria }) => {
  users.value = records
  total.value = filteredTotal
  activeFilterCount.value = criteria?.conditions?.length || 0
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
      const XLSX = await loadXlsx()

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
    <n-card class="search-card mb-4" :bordered="false">
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px;">
        <!-- 搜索与筛选组 -->
        <n-space align="center" :size="12" wrap>
          <n-input
            v-model:value="keyword"
            placeholder="搜索用户名、邮箱、昵称"
            style="width: 280px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Search :size="16" />
            </template>
          </n-input>
          <n-button type="primary" @click="handleSearch">搜索</n-button>
          <n-button secondary @click="showFilterModal = true">高级筛选</n-button>
          <n-button v-if="activeFilterCount > 0" text type="error" @click="clearFilter">
            清除筛选 ({{ activeFilterCount }})
          </n-button>
        </n-space>
        
        <!-- 批量操作组 -->
        <n-space align="center" :size="12" wrap>
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
      </div>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="table-card" :bordered="false" style="overflow: hidden;">
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :bordered="false"
        :single-line="false"
        scroll-x="100%"
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

    <UserVipModal
      v-if="showVipModal"
      v-model:show="showVipModal"
      :user="currentUser"
      @updated="handleUserUpdated"
    />

    <UserDetailModal
      v-if="showDetailModal"
      v-model:show="showDetailModal"
      :user="currentUser"
    />

    <UserProfileEditModal
      v-if="showEditModal"
      v-model:show="showEditModal"
      :user="currentUser"
      @updated="handleUserUpdated"
    />

    <UserPasswordResetModal
      v-if="showPasswordModal"
      v-model:show="showPasswordModal"
      :user="currentUser"
    />

    <UserBatchVipModal
      v-if="showBatchVipModal"
      v-model:show="showBatchVipModal"
      :selected-user-ids="selectedUserIds"
      @updated="handleBatchVipUpdated"
    />

    <UserBatchNotifyModal
      v-if="showBatchNotifyModal"
      v-model:show="showBatchNotifyModal"
      :selected-user-ids="selectedUserIds"
      @updated="handleBatchNotifyUpdated"
    />

    <UserAdvancedFilterModal
      v-if="showFilterModal"
      v-model:show="showFilterModal"
      :page="page"
      :page-size="pageSize"
      @applied="handleFilterApplied"
    />
  </div>
</template>

<style scoped>
.users-page {
  width: 100%;
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

</style>
